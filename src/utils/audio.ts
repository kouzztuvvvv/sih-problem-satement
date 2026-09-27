/**
 * Web Audio tone generator for clinical assessment countdowns & rep counters
 */
class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playBeep(frequency = 600, duration = 0.12, type: OscillatorType = 'sine') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playRepCount() {
    this.playBeep(750, 0.08, 'triangle');
  }

  playTestStart() {
    this.playBeep(520, 0.15);
    setTimeout(() => this.playBeep(880, 0.25), 180);
  }

  playTestComplete() {
    this.playBeep(587.33, 0.12);
    setTimeout(() => this.playBeep(739.99, 0.12), 140);
    setTimeout(() => this.playBeep(880, 0.35), 280);
  }
}

export const sounds = new SoundEffects();

/**
 * Text-to-speech for vernacular patient instruction
 */
export function speakAdvice(text: string, lang = 'en-IN') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Attempt to select an Indian English or local voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    v => v.lang.includes('IN') || v.lang.includes('hi') || v.lang.includes('bn')
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  utterance.lang = lang;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
