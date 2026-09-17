import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  DEFAULT_MODEL_ID,
  MULTI_RESPONSE_SCHEMA,
  SINGLE_RESPONSE_SCHEMA,
  SYSTEM_INSTRUCTION,
} from './src/constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper to extract or resolve API key
  const resolveApiKey = (clientKey?: string): string | null => {
    if (clientKey && typeof clientKey === 'string' && clientKey.trim().length > 0) {
      return clientKey.trim();
    }
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 0) {
      return envKey.trim();
    }
    return null;
  };

  // Helper to map errors cleanly per Section 7
  const mapGeminiError = (err: any) => {
    console.error('[Gemini Call Error]:', err);
    const message = err?.message || String(err);
    const status = err?.status || err?.statusCode || 500;

    if (
      status === 401 ||
      status === 403 ||
      message.includes('API key') ||
      message.includes('PERMISSION_DENIED') ||
      message.includes('API_KEY_INVALID')
    ) {
      return {
        status: 401,
        body: { error: 'That API key was rejected.', code: 'KEY_REJECTED' },
      };
    }

    if (
      status === 429 ||
      message.includes('RESOURCE_EXHAUSTED') ||
      message.includes('quota') ||
      message.includes('Rate limit')
    ) {
      return {
        status: 429,
        body: { error: 'Rate limited — wait a moment and try again.', code: 'RATE_LIMITED' },
      };
    }

    if (
      message.includes('fetch failed') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ENOTFOUND') ||
      message.includes('network') ||
      message.includes('timeout')
    ) {
      return {
        status: 503,
        body: { error: "Couldn't reach the model. Check your connection.", code: 'NETWORK_ERROR' },
      };
    }

    return {
      status: typeof status === 'number' && status >= 400 && status < 600 ? status : 500,
      body: {
        error: `Something went wrong reading that advert. (Status ${status})`,
        code: 'UNKNOWN_ERROR',
        details: message,
      },
    };
  };

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    res.json({ status: 'ok', hasEnvKey });
  });

  // Single or multiple advert reading endpoint
  app.post('/api/read', async (req: Request, res: Response) => {
    try {
      const { advert, title, employer, adverts, apiKey: clientApiKey, modelId: requestedModelId } = req.body;

      const apiKey = resolveApiKey(clientApiKey);
      if (!apiKey) {
        return res.status(400).json({
          error: 'Add an API key to read adverts.',
          code: 'NO_API_KEY',
        });
      }

      const requestedModel = requestedModelId || DEFAULT_MODEL_ID;
      const candidateModels = [requestedModel, 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'].filter(
        (v, i, a) => a.indexOf(v) === i
      );

      const ai = new GoogleGenAI({ apiKey });

      // Check if this is a single advert or shortlist of multiple adverts
      const isMulti = Array.isArray(adverts) && adverts.length > 1;

      let userPrompt = '';
      let responseSchema: any = SINGLE_RESPONSE_SCHEMA;

      if (isMulti) {
        responseSchema = MULTI_RESPONSE_SCHEMA;
        const advertSections = adverts
          .map(
            (adv: { index: number; title?: string; employer?: string; advert: string }) => `Advert index ${adv.index}:
Title: ${adv.title || 'not stated'}
Employer: ${adv.employer || 'not stated'}

Advert:
${adv.advert}`
          )
          .join('\n\n---\n\n');

        userPrompt = `Extract the seven commitments for each of the following ${adverts.length} adverts. Return a JSON array where each object has the "index" and the 7 commitment fields.\n\n${advertSections}`;
      } else {
        const singleAdvert = advert || (adverts && adverts[0]?.advert) || '';
        const singleTitle = title || (adverts && adverts[0]?.title) || 'not stated';
        const singleEmployer = employer || (adverts && adverts[0]?.employer) || 'not stated';

        userPrompt = `Title: ${singleTitle}
Employer: ${singleEmployer}

Advert:
${singleAdvert}`;
      }

      let textResult = '';
      let usedModel = requestedModel;
      let lastError: any = null;

      for (const modelToTry of candidateModels) {
        try {
          usedModel = modelToTry;
          // Try with structured output schema first
          try {
            const response = await ai.models.generateContent({
              model: modelToTry,
              contents: [
                {
                  role: 'user',
                  parts: [{ text: userPrompt }],
                },
              ],
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0,
                maxOutputTokens: isMulti ? 4096 : 2048,
                responseMimeType: 'application/json',
                responseSchema,
              },
            });
            textResult = response.text || '';
          } catch (schemaError: any) {
            // Fallback if model rejects schema (as instructed in Section 4.2)
            console.warn('Schema output rejected or unsupported, retrying without responseSchema:', schemaError?.message);
            const fallbackResponse = await ai.models.generateContent({
              model: modelToTry,
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n---\n\n${userPrompt}` }],
                },
              ],
              config: {
                temperature: 0,
                maxOutputTokens: isMulti ? 4096 : 2048,
                responseMimeType: 'application/json',
              },
            });
            textResult = fallbackResponse.text || '';
          }

          if (textResult) {
            break; // Success!
          }
        } catch (callError: any) {
          lastError = callError;
          const status = callError?.status || callError?.statusCode;
          const msg = callError?.message || '';
          // Only retry on transient capacity/demand errors
          if (status === 503 || msg.includes('high demand') || msg.includes('UNAVAILABLE') || status === 404) {
            console.warn(`Model ${modelToTry} unavailable, attempting next fallback...`);
            continue;
          }
          throw callError;
        }
      }

      if (!textResult && lastError) {
        throw lastError;
      }

      return res.json({
        rawText: textResult,
        modelId: usedModel,
        isMulti,
      });
    } catch (err) {
      const errResponse = mapGeminiError(err);
      return res.status(errResponse.status).json(errResponse.body);
    }
  });

  // Phase 3: Honest rewrite endpoint for Vague adverts
  app.post('/api/rewrite', async (req: Request, res: Response) => {
    try {
      const { advert, missingPhrases, apiKey: clientApiKey, modelId: requestedModelId } = req.body;

      const apiKey = resolveApiKey(clientApiKey);
      if (!apiKey) {
        return res.status(400).json({
          error: 'Add an API key to read adverts.',
          code: 'NO_API_KEY',
        });
      }

      const modelId = requestedModelId || DEFAULT_MODEL_ID;
      const ai = new GoogleGenAI({ apiKey });

      const missingList = Array.isArray(missingPhrases) ? missingPhrases.join(', ') : 'the missing details';

      const prompt = `You are editing a job advert to make it honest and transparent.
The original advert avoided committing to: ${missingList}.

Rewrite the advert text below to keep its exact prose style and structure, but insert explicit uppercase bracketed placeholders where the employer should state the missing facts. For example:
- [STATE THE TEAM YOU'D JOIN]
- [STATE WHO YOU'D ANSWER TO]
- [STATE WHEN YOU'D START]
- [STATE HOW MANY ROLES ARE BEING HIRED]
- [STATE THE EXACT HIRING STAGES]
- [STATE WHAT THIS ROLE SPECIFICALLY OWNS]
- [STATE THE PAY FIGURE OR RANGE]

Insert ONLY placeholders for the missing commitments (${missingList}). Leave whatever was already concretely stated as-is. Return ONLY the rewritten advert text.

Original Advert:
${advert}`;

      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      });

      return res.json({
        rewrittenText: response.text || advert,
      });
    } catch (err) {
      const errResponse = mapGeminiError(err);
      return res.status(errResponse.status).json(errResponse.body);
    }
  });

  // Serve frontend with Vite in development, or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`On Paper server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
