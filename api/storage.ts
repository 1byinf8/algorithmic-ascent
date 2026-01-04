import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Ensure DATABASE_URL is set in your .env
const sql = neon(process.env.DATABASE_URL!);

// ============ SECURITY: CORS Configuration ============
const ALLOWED_ORIGINS = [
  'https://algorithmic-ascent.vercel.app',
  'https://algorithmic-ascent-*.vercel.app', // Preview deployments
  'http://localhost:3000',
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return false;
  
  // Allow any localhost or 127.0.0.1 origin (any port) for local development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return true;
  }
  
  return ALLOWED_ORIGINS.some(allowed => {
    if (allowed.includes('*')) {
      // Handle wildcard patterns like 'https://algorithmic-ascent-*.vercel.app'
      const pattern = allowed.replace('*', '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return allowed === origin;
  });
};

// ============ SECURITY: Rate Limiting ============
// In-memory rate limiter (resets on cold start, good enough for basic protection)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per IP

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  record.count++;
  
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  return false;
};

const getClientIp = (req: VercelRequest): string => {
  // Vercel provides the real IP in x-forwarded-for
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

// ============ Main Handler ============
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const origin = req.headers.origin as string | undefined;
  const clientIp = getClientIp(req);

  // ---- CORS Check ----
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Origin provided but not allowed
    return res.status(403).json({
      success: false,
      error: 'Origin not allowed'
    });
  }
  // If no origin (e.g., server-to-server), allow but don't set header
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ---- Rate Limiting Check ----
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a minute.',
      retryAfter: 60
    });
  }

  try {
    // READ
    if (req.method === 'GET') {
      const { key } = req.query;

      if (!key || typeof key !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Key is required',
          value: null
        });
      }

      const result = await sql`
        SELECT value 
        FROM app_storage 
        WHERE key = ${key}
      `;

      const rawValue = result[0]?.value ?? null;
      
      let parsedValue = rawValue;
      if (typeof rawValue === 'string') {
         try {
           parsedValue = JSON.parse(rawValue);
         } catch {
           // If parse fails, keep original string
         }
      }

      return res.status(200).json({
        success: true,
        value: parsedValue
      });
    }

    // WRITE (UPSERT)
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { key, value } = body || {};

      if (!key || typeof key !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Key is required'
        });
      }

      const serializedValue = JSON.stringify(value);

      await sql`
        INSERT INTO app_storage (key, value, updated_at)
        VALUES (${key}, ${serializedValue}, NOW())
        ON CONFLICT (key)
        DO UPDATE SET value = ${serializedValue}, updated_at = NOW()
      `;

      return res.status(200).json({ 
        success: true,
        value 
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Storage API error:', error);
    // Don't expose internal error details in production
    return res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : (error instanceof Error ? error.message : 'Internal server error'),
      value: null
    });
  }
}