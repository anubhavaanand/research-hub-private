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

app.post('/api/generate-citation', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'Server API key not configured' });
    }

    const { title, authors, publication, year, volume, issue, pages, style } = req.body || {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title is required' });
    }
    if (!style || typeof style !== 'string') {
      return res.status(400).json({ error: 'style is required' });
    }

    const prompt = `Generate a bibliographic citation for the following academic paper in **${style}** format.
Return ONLY the raw citation string. No markdown formatting.

Metadata:
Title: ${title}
Authors: ${Array.isArray(authors) ? authors.join(', ') : (authors || 'N/A')}
Publication (Journal/Conf): ${publication || 'N/A'}
Year: ${year || 'N/A'}
Volume: ${volume || 'N/A'}
Issue: ${issue || 'N/A'}
Pages: ${pages || 'N/A'}`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { role: 'user', parts: [{ text: prompt }] },
    });

    return res.json({ citation: response.text?.trim() || '' });
  } catch (error) {
    console.error('Citation generation error:', error);
    return res.status(500).json({ error: 'Citation generation failed' });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
