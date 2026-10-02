import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  PhoneCall,
  PhoneOff,
  Activity
} from 'lucide-react';

interface LiveVoiceConsultantProps {
  isOpen: boolean;
  onClose: () => void;
  patientContext?: string;
}

interface ChatTurn {
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const LiveVoiceConsultant: React.FC<LiveVoiceConsultantProps> = ({
  isOpen,
  onClose,
  patientContext,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting to Gemini 3.8 Live API...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [textInput, setTextInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio Contexts & WebSockets
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const currentModelTextRef = useRef<string>('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Suggested Prompts
  const quickPrompts = [
    'How does steep hillside farming accelerate knee osteoarthritis in Meghalaya?',
    'What exercises can an elder do to strengthen their quadriceps safely?',
    'Explain the 30-second chair-stand test in simple terms for a patient.',
    'What traditional North Eastern foods provide bioavailable calcium for cartilage?'
  ];

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, currentModelTextRef.current]);

  const stopAudio = () => {
    // Stop all playing audio sources
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsModelSpeaking(false);
  };

  const disconnectSession = () => {
    stopAudio();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    setErrorMessage(null);
    setIsConnecting(true);
    setStatusMessage('Initializing Gemini 3.8 Live API session...');

    try {
      // 1. Establish Audio Contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      const outputCtx = new AudioCtx({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // 2. Request mic access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Connect WebSocket to backend server
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStatusMessage('Live Voice session connected. Speak naturally.');

        // If patient context is provided, introduce it
        if (patientContext) {
          ws.send(
            JSON.stringify({
              type: 'text',
              text: `Here is the current patient context: ${patientContext}. Please acknowledge in a brief friendly sentence and let me know how you can assist with their screening.`,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'ready') {
            setIsConnected(true);
            setIsConnecting(false);
          } else if (msg.type === 'audio' && msg.audio) {
            setIsModelSpeaking(true);
            playAudioChunk(outputCtx, msg.audio);
          } else if (msg.type === 'text' && msg.text) {
            currentModelTextRef.current += msg.text;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'model') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + msg.text },
                ];
              } else {
                return [
                  ...prev,
                  {
                    sender: 'model',
                    text: msg.text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ];
              }
            });
          } else if (msg.type === 'interrupted') {
            stopAudio();
          } else if (msg.type === 'turnComplete') {
            setIsModelSpeaking(false);
            currentModelTextRef.current = '';
          } else if (msg.type === 'error') {
            setErrorMessage(msg.message || 'An error occurred during voice communication.');
            setIsConnecting(false);
          }
        } catch (e) {
          console.error('Error parsing live WS message', e);
        }
      };

      ws.onerror = () => {
        setErrorMessage('Failed to connect to the Live API WebSocket. Ensure the server is running.');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setStatusMessage('Live Voice session ended.');
      };

      // 4. Hook microphone audio stream processing
      const source = inputCtx.createMediaStreamSource(stream);
      // Analyze volume for UI feedback
      const analyzer = inputCtx.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!mediaStreamRef.current) return;
        analyzer.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round(avg * 2)));
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          requestAnimationFrame(checkVolume);
        }
      };
      requestAnimationFrame(checkVolume);

      // ScriptProcessor for raw PCM chunking
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;
      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isMicMuted) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to 16-bit PCM little-endian
        const pcmBuffer = new ArrayBuffer(inputData.length * 2);
        const pcmView = new DataView(pcmBuffer);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmView.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }

        // Convert to base64
        const bytes = new Uint8Array(pcmBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        wsRef.current.send(
          JSON.stringify({
            type: 'audio',
            data: base64Audio,
          })
        );
      };
    } catch (err: any) {
      console.error('Failed to initialize microphone or live audio session:', err);
      setErrorMessage(
        err?.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser.'
          : err?.message || 'Failed to start Live Voice session.'
      );
      setIsConnecting(false);
    }
  };

  const playAudioChunk = (outputCtx: AudioContext, base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert 16-bit PCM little-endian to Float32
      const int16Array = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = outputCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputCtx.destination);

      const currentTime = outputCtx.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsModelSpeaking(false);
        }
      };
    } catch (e) {
      console.warn('Error playing audio chunk', e);
    }
  };

  const handleSendTextMessage = (textToSend?: string) => {
    const text = textToSend || textInput;
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        type: 'text',
        text: text.trim(),
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (!textToSend) setTextInput('');
  };

  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      startSession();
    }
    return () => {
      if (!isOpen && isConnected) {
        disconnectSession();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isConnected
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25 ring-2 ring-teal-400/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <Radio className={`w-5 h-5 ${isConnected ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  ArthroVoice Live AI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Low-latency, bidirectional real-time voice consultation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <button
                type="button"
                onClick={disconnectSession}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startSession}
                disabled={isConnecting}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PhoneCall className="w-3.5 h-3.5" />}
                <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                disconnectSession();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status / Error Banner */}
        {errorMessage ? (
          <div className="px-5 py-3 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        ) : (
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? isModelSpeaking
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-teal-500'
                    : isConnecting
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-300'
                }`}
              />
              <span>
                {isConnecting
                  ? 'Connecting to Gemini Live...'
                  : isModelSpeaking
                  ? 'Gemini is speaking...'
                  : isConnected
                  ? 'Listening — Speak into your microphone'
                  : 'Session disconnected'}
              </span>
            </div>

            {isConnected && (
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-teal-600 dark:text-teal-400">
                <Activity className="w-3.5 h-3.5" />
                <span>24kHz Audio Stream</span>
              </div>
            )}
          </div>
        )}

        {/* Live Audio Visualizer Banner */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
          {/* Animated Waveform Bars */}
          <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-sm">
            {[40, 65, 85, 45, 95, 30, 75, 55, 90, 60, 45, 80, 50, 70, 35].map((baseHeight, idx) => {
              const dynamicHeight = isModelSpeaking
                ? Math.sin((idx + Date.now() / 200) * 0.8) * 35 + 40
                : isConnected && !isMicMuted && audioLevel > 5
                ? Math.min(100, (audioLevel / 100) * baseHeight + 10)
                : 12;

              return (
                <div
                  key={idx}
                  style={{ height: `${Math.max(8, dynamicHeight)}%` }}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isModelSpeaking
                      ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                      : isConnected && !isMicMuted
                      ? 'bg-teal-400 shadow-sm shadow-teal-400/50'
                      : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] font-medium text-slate-300">
              {isModelSpeaking ? (
                <span className="text-amber-300 font-semibold flex items-center justify-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  Model Turn (Tap Interrupt to cut in)
                </span>
              ) : isConnected ? (
                isMicMuted ? (
                  <span className="text-rose-400">Microphone Muted</span>
                ) : (
                  <span className="text-teal-300">Speak now • Live bidirectional channel</span>
                )
              ) : (
                <span className="text-slate-400">Click Connect to start voice interaction</span>
              )}
            </span>
          </div>

          {/* Quick Interrupt Button when model is speaking */}
          {isModelSpeaking && (
            <button
              type="button"
              onClick={stopAudio}
              className="mt-3 px-3.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-400/30 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Interrupt Model</span>
            </button>
          )}
        </div>

        {/* Conversation Transcript Scroll */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/50 min-h-[180px] max-h-[260px]"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Sparkles className="w-8 h-8 mb-2 text-teal-500/60" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Live conversation stream is ready.
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                Ask about knee pain assessment, load ergonomics for hill workers, or screening protocols.
              </p>
            </div>
          ) : (
            messages.map((turn, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${turn.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {turn.sender === 'user' ? 'You' : 'ArthroVoice'}
                  </span>
                  <span className="text-[9px] text-slate-400">{turn.timestamp}</span>
                </div>
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    turn.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none shadow-sm'
                  }`}
                >
                  {turn.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendTextMessage(prompt)}
              disabled={!isConnected}
              className="text-[11px] px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shrink-0 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          {/* Mic Mute / Unmute Button */}
          <button
            type="button"
            onClick={() => setIsMicMuted(!isMicMuted)}
            disabled={!isConnected}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isMicMuted
                ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800'
                : 'bg-teal-50 border-teal-300 text-teal-700 dark:bg-teal-950/40 dark:border-teal-800'
            } disabled:opacity-50`}
            title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Fallback / Hybrid Input */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendTextMessage()}
              disabled={!isConnected}
              placeholder={
                isConnected
                  ? 'Speak into microphone or type a question...'
                  : 'Connect above to start session...'
              }
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => handleSendTextMessage()}
              disabled={!isConnected || !textInput.trim()}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-40 cursor-pointer shadow-sm shadow-teal-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
