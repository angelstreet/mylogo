import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import sharp from 'sharp';
import ImageTracer from 'imagetracerjs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'mylogo.db');

// Ensure data dir exists
import { mkdirSync } from 'fs';
mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    description TEXT,
    prompt TEXT,
    model TEXT NOT NULL,
    cost_usd REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertGen = db.prepare(
  `INSERT INTO generations (type, description, prompt, model, cost_usd) VALUES (?, ?, ?, ?, ?)`
);

// Cost estimates (USD) — based on OpenAI pricing as of 2025
const COST = {
  'gpt-4o-mini-prompt': 0.001,    // ~300 tokens in+out
  'gpt-image-1-1024': 0.04,       // 1024x1024 image generation
};

const app = new Hono();

app.use('/*', cors());
app.use('/*', logger());

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stats endpoint — view generation history and total cost
app.get('/api/stats', (c) => {
  const total = db.prepare(`SELECT COUNT(*) as count, COALESCE(SUM(cost_usd), 0) as total_cost FROM generations`).get() as any;
  const byType = db.prepare(`SELECT type, COUNT(*) as count, COALESCE(SUM(cost_usd), 0) as total_cost FROM generations GROUP BY type`).all();
  const recent = db.prepare(`SELECT * FROM generations ORDER BY id DESC LIMIT 20`).all();
  return c.json({ total, byType, recent });
});

// Step 1: Generate an optimized image prompt from user description
app.post('/api/generate-prompt', async (c) => {
  const { description, apiKey } = await c.req.json();

  if (!apiKey) return c.json({ error: 'API key required' }, 400);
  if (!description) return c.json({ error: 'Description required' }, 400);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert logo designer. The user will describe what they want for their logo.
Generate an optimized prompt for an AI image generator (OpenAI gpt-image-1).

Rules:
- Output ONLY the image generation prompt, nothing else
- Always include: "minimal flat vector logo", "clean geometric design", "transparent background", "no shadows", "no gradients"
- Translate the user's intent into precise visual instructions
- Specify colors explicitly
- Keep it under 200 words
- Focus on shapes, composition, and style`,
        },
        { role: 'user', content: description },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return c.json({ error: (err as any).error?.message || 'OpenAI API error' }, res.status);
  }

  const data = await res.json() as any;
  const prompt = data.choices[0].message.content.trim();

  // Log prompt generation cost
  insertGen.run('prompt', description, prompt, 'gpt-4o-mini', COST['gpt-4o-mini-prompt']);

  return c.json({ prompt });
});

// Step 2: Generate the logo image from the prompt
app.post('/api/generate-image', async (c) => {
  const { prompt, apiKey } = await c.req.json();

  if (!apiKey) return c.json({ error: 'API key required' }, 400);
  if (!prompt) return c.json({ error: 'Prompt required' }, 400);

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      background: 'transparent',
      output_format: 'png',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return c.json({ error: (err as any).error?.message || 'Image generation failed' }, res.status);
  }

  const data = await res.json() as any;
  const b64 = data.data[0].b64_json || data.data[0].b64;

  // Log image generation cost
  insertGen.run('image', null, prompt, 'gpt-image-1', COST['gpt-image-1-1024']);

  // Auto-crop transparent areas
  try {
    const buf = Buffer.from(b64, 'base64');
    const cropped = await sharp(buf).trim().png().toBuffer();
    return c.json({ image: cropped.toString('base64') });
  } catch {
    return c.json({ image: b64 });
  }
});

// Convert PNG base64 to ICO (multi-size: 16, 32, 48, 64, 128, 256)
app.post('/api/convert-ico', async (c) => {
  const { image } = await c.req.json();
  if (!image) return c.json({ error: 'Image required' }, 400);

  const buf = Buffer.from(image, 'base64');
  const sizes = [16, 32, 48, 64, 128, 256];

  // Generate all icon sizes
  const images = await Promise.all(
    sizes.map(s => sharp(buf).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer())
  );

  // Build ICO file (see ICO format spec)
  const numImages = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * numImages;

  // ICO header: reserved(2) + type(2) + count(2)
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);       // reserved
  header.writeUInt16LE(1, 2);       // type = ICO
  header.writeUInt16LE(numImages, 4);

  const dirEntries: Buffer[] = [];
  for (let i = 0; i < numImages; i++) {
    const entry = Buffer.alloc(dirEntrySize);
    const s = sizes[i];
    entry.writeUInt8(s < 256 ? s : 0, 0);  // width (0 = 256)
    entry.writeUInt8(s < 256 ? s : 0, 1);  // height
    entry.writeUInt8(0, 2);                  // color palette
    entry.writeUInt8(0, 3);                  // reserved
    entry.writeUInt16LE(1, 4);              // color planes
    entry.writeUInt16LE(32, 6);             // bits per pixel
    entry.writeUInt32LE(images[i].length, 8);  // image size
    entry.writeUInt32LE(offset, 12);           // offset
    offset += images[i].length;
    dirEntries.push(entry);
  }

  const ico = Buffer.concat([header, ...dirEntries, ...images]);
  return c.json({ ico: ico.toString('base64') });
});

// Convert PNG base64 to SVG (vector trace)
app.post('/api/convert-svg', async (c) => {
  const { image } = await c.req.json();
  if (!image) return c.json({ error: 'Image required' }, 400);

  try {
    const buf = Buffer.from(image, 'base64');
    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    // Build ImageData-like object for imagetracerjs
    const imgd = {
      width: info.width,
      height: info.height,
      data: new Uint8ClampedArray(data),
    };

    const svg = ImageTracer.imagedataToSVG(imgd, {
      colorsampling: 2,
      numberofcolors: 16,
      pathomit: 8,
      roundcoords: 2,
      blurradius: 0,
      strokewidth: 0,
    });

    return c.json({ svg });
  } catch (e: any) {
    return c.json({ error: e.message || 'SVG conversion failed' }, 500);
  }
});

const port = Number(process.env.PORT) || 5003;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export { app };
