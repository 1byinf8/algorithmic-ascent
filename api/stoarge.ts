import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req, res) {
  try {
    const { key, value } = req.body || {};

    // READ
    if (req.method === 'GET') {
      const { key } = req.query;
      const result = await sql`
        SELECT value 
        FROM app_storage 
        WHERE key = ${key}
      `;
      return res.status(200).json(result[0]?.value ?? null);
    }

    // WRITE (UPSERT)
    if (req.method === 'POST') {
      await sql`
        INSERT INTO app_storage (key, value)
        VALUES (${key}, ${value})
        ON CONFLICT (key)
        DO UPDATE SET value = ${value}, updated_at = NOW()
      `;
      return res.status(200).json({ ok: true });
    }

    res.status(405).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
}
