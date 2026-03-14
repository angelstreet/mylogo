import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

const app = new Hono();

app.use('/*', cors());
app.use('/*', logger());

// --- Auth Middleware ---
// If CLERK_SECRET_KEY is set, validates Clerk JWTs on /api/* routes.
// Without it, all routes are open (local dev mode).
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

app.use('/api/*', async (c, next) => {
  if (!CLERK_SECRET_KEY) return next(); // No Clerk → open access

  // Public endpoints that skip auth
  const publicPaths = ['/api/health'];
  if (publicPaths.includes(c.req.path)) return next();

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { verifyToken } = await import('@clerk/backend');
    const token = authHeader.slice(7);
    const payload = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    (c as any).clerkUserId = payload.sub;
    return next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

// --- Routes ---

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add your routes here...

// --- Start ---

const port = Number(process.env.PORT) || 5003;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export { app }; // For Vercel serverless
