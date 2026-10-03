import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import {
  readDatabase,
  saveScreeningRecord,
  deleteScreeningRecord,
  savePatientRecord
} from './server-db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI with server-side API Key
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Search Grounding endpoint using gemini-3.5-flash with googleSearch tool
app.post('/api/research/search-grounding', async (req: Request, res: Response) => {
  try {
    const { query, patientContext } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.',
      });
      return;
    }

    const prompt = patientContext
      ? `Patient Profile Context:\n${patientContext}\n\nClinical Research Question:\n${query}\n\nProvide an evidence-based clinical analysis. Cite current medical guidelines, epidemiologic data, or orthopaedic recommendations where applicable.`
      : query;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          'You are an authoritative clinical research intelligence assistant for ArthroScan NER (Early Detection of Osteoarthritis in North Eastern Region India). Provide concise, evidence-grounded insights, citing up-to-date guidelines from ICMR, WHO, or orthopaedic literature. Always ground your facts in verified medical sources.',
      },
    });

    const answer = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources = groundingChunks
      .map((chunk: { web?: { title?: string; uri?: string } }) => ({
        title: chunk.web?.title || 'Medical Reference',
        uri: chunk.web?.uri || '',
      }))
      .filter((s: { uri: string }) => Boolean(s.uri));

    res.json({
      answer,
      sources,
      model: 'gemini-3.5-flash',
    });
  } catch (error: any) {
    console.error('Search Grounding error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to execute search grounding query.',
    });
  }
});

// Database API: Get all screenings
app.get('/api/database/screenings', (_req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json({
      success: true,
      screenings: db.screenings,
      total: db.screenings.length,
      lastModified: db.lastModified
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to fetch screenings' });
  }
});

// Database API: Save or update a screening
app.post('/api/database/screenings', (req: Request, res: Response) => {
  try {
    const screening = req.body;
    if (!screening) {
      res.status(400).json({ error: 'Screening data is required' });
      return;
    }
    const saved = saveScreeningRecord(screening);
    res.json({
      success: true,
      message: 'Screening saved successfully to database',
      screening: saved
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to save screening' });
  }
});

// Database API: Delete a screening
app.delete('/api/database/screenings/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = deleteScreeningRecord(id);
    if (ok) {
      res.json({ success: true, message: `Screening ${id} deleted` });
    } else {
      res.status(404).json({ error: `Screening ${id} not found` });
    }
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to delete screening' });
  }
});

// Database API: Get all patient profiles
app.get('/api/database/patients', (_req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json({
      success: true,
      patients: db.patients,
      total: db.patients.length
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to fetch patients' });
  }
});

// Database API: Save patient profile directly
app.post('/api/database/patients', (req: Request, res: Response) => {
  try {
    const patientData = req.body;
    if (!patientData || !patientData.fullName) {
      res.status(400).json({ error: 'Patient full name is required' });
      return;
    }
    const saved = savePatientRecord(patientData);
    res.json({
      success: true,
      message: 'Patient details stored successfully in database',
      patient: saved
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to save patient details' });
  }
});

// Database API: Database stats & status
app.get('/api/database/stats', (_req: Request, res: Response) => {
  try {
    const db = readDatabase();
    const highRiskCount = db.screenings.filter(s => s.riskLevel === 'HIGH').length;
    res.json({
      success: true,
      totalScreenings: db.screenings.length,
      totalPatients: db.patients.length,
      highRiskCount,
      lastModified: db.lastModified,
      auditLogsCount: db.auditLogs.length
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to get database stats' });
  }
});

// Database API: Export full JSON database
app.get('/api/database/export', (_req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="arthroscan_database_backup.json"');
    res.send(JSON.stringify(db, null, 2));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to export database' });
  }
});

// WebSocket Server for Live Voice Conversations using gemini-3.8-live
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
  if (pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    // If not our endpoint, let other handlers or destroy
    // socket.destroy();
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live Voice API');

  if (!apiKey) {
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message: 'GEMINI_API_KEY is not configured on the server. Please add it to Settings > Secrets.',
      })
    );
    clientWs.close();
    return;
  }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
        systemInstruction:
          'You are ArthroVoice, an empathetic and clinically knowledgeable AI voice assistant for ArthroScan NER. You assist community health workers (ASHAs) and rural patients in North East India with early detection, functional mobility assessments (chair-stand, gait, ROM), and osteoarthritis pain management. Keep voice responses spoken, natural, concise (1 to 3 sentences at a time), empathetic, and clear.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          // Check for audio chunks
          const audio =
            message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }

          // Check for text transcriptions or parts
          const textPart = message.serverContent?.modelTurn?.parts?.find(
            (p: any) => p.text
          );
          if (textPart?.text) {
            clientWs.send(JSON.stringify({ type: 'text', text: textPart.text }));
          }

          // Check for interruption signal
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }

          // Check for turn complete
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }
        },
        onclose: () => {
          console.log('Live session closed by server');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'sessionClosed' }));
          }
        },
        onerror: (err: any) => {
          console.error('Live session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', message: err?.message || 'Live session error' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready', model: 'gemini-3.8-live' }));
  } catch (err: any) {
    console.error('Failed to connect to Live API:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: err?.message || 'Failed to establish Live API session.',
        })
      );
      clientWs.close();
    }
    return;
  }

  clientWs.on('message', (data: any) => {
    try {
      const payload = JSON.parse(data.toString());

      if (payload.type === 'audio' && payload.data && session) {
        // payload.data is base64 PCM 16kHz
        session.sendRealtimeInput({
          audio: {
            data: payload.data,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (payload.type === 'text' && payload.text && session) {
        session.send({
          clientContent: {
            turns: [
              {
                role: 'user',
                parts: [{ text: payload.text }],
              },
            ],
            turnComplete: true,
          },
        });
      }
    } catch (e) {
      console.warn('Error handling client message:', e);
    }
  });

  clientWs.on('close', () => {
    console.log('Client disconnected from Live API');
    if (session) {
      try {
        session.close();
      } catch {
        // session close error ignored
      }
    }
  });
});

// Mount Vite middleware in development or serve static in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

server.listen(Number(port), host, () => {
  console.log(`ArthroScan NER Server listening on http://${host}:${port}`);
});
