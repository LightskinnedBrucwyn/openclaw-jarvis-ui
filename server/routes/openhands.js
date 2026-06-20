// ── OpenHands Routes: /api/openhands/chat ──
// Server-side proxy to the OpenHands REST API. The base URL and any auth token
// live only here (env vars), never in the browser.
//
// PENDING: OPENHANDS_API_URL / OPENHANDS_API_TOKEN not yet confirmed.
// Once known, set them in config.local.json / env and this route will start
// proxying for real — no frontend changes needed.

import { Router } from 'express';

const router = Router();

const OPENHANDS_API_URL = process.env.OPENHANDS_API_URL || '';
const OPENHANDS_API_TOKEN = process.env.OPENHANDS_API_TOKEN || '';

router.post('/openhands/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  if (!OPENHANDS_API_URL) {
    return res.status(503).json({
      error: 'not_configured',
      reply: 'OpenHands backend is not configured yet. Set OPENHANDS_API_URL (and OPENHANDS_API_TOKEN if required) on the server.',
    });
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (OPENHANDS_API_TOKEN) headers.Authorization = `Bearer ${OPENHANDS_API_TOKEN}`;

    const upstream = await fetch(OPENHANDS_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message || 'openhands gateway error' });
  }
});

export default router;
