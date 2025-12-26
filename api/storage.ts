import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Ensure DATABASE_URL is set in your .env
const sql = neon(process.env.DATABASE_URL!);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

      // Neon (postgres) handles JSON parsing automatically for JSONB columns
      // If using TEXT column, we might need to parse. 
      const rawValue = result[0]?.value ?? null;
      
      // If it's a string that looks like JSON/stringified value, parse it
      // Otherwise return as is
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
      // Ensure body is parsed
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { key, value } = body || {};

      if (!key || typeof key !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Key is required'
        });
      }

      // Serialize value to JSON string for storage if using JSONB or TEXT
      // For JSONB in Neon, you can often pass the object directly, but stringifying ensures consistency
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
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      value: null
    });
  }
}