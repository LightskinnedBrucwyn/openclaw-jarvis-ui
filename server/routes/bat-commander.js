// ── Bat Cmdr-Alpha Routes: /api/bat-commander ──
// Read-only status feed for the Batcave Command Center "Bat Cmdr-Alpha" agent.
//
// PENDING: feed delivery is not yet decided. Once a narrow read-only upstream
// route exists, point BAT_COMMANDER_URL at it; this route remains a thin proxy.
//
// Schema reference (batcave.command_center.bat_commander.v1):
//   { level, local_brief, strategic_posture, agent_summaries[], recent_events[], next_actions[] }

import { Router } from 'express';

const router = Router();

const BAT_COMMANDER_URL = process.env.BAT_COMMANDER_URL || '';

function pendingPayload() {
  return {
    schema: 'batcave.command_center.bat_commander.v1',
    agent: 'Bat Cmdr-Alpha',
    role: 'Intelligence Briefing Agent',
    level: 'unknown',
    pending: true,
    local_brief: 'Awaiting feed configuration — BAT_COMMANDER_URL not set.',
    strategic_posture: '',
    agent_summaries: [],
    recent_events: [],
    next_actions: [],
  };
}

router.get('/bat-commander', async (req, res) => {
  if (!BAT_COMMANDER_URL) return res.json(pendingPayload());

  try {
    const upstream = await fetch(BAT_COMMANDER_URL);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ ...pendingPayload(), error: err.message || 'bat cmdr-alpha feed error' });
  }
});

export default router;
