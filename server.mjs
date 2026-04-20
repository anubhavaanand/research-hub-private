import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/summarize', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'Server API key not configured' });
    }

    const abstract = req.body?.abstract;
    if (!abstract || typeof abstract !== 'string') {
      return res.status(400).json({ error: 'abstract is required' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        role: 'user',
        parts: [{ text: `Summarize this academic abstract into one concise sentence:\n\n${abstract}` }],
      },
    });

    return res.json({ summary: response.text || '' });
  } catch (error) {
    console.error('Summarization error:', error);
    return res.status(500).json({ error: 'Summarization failed' });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
