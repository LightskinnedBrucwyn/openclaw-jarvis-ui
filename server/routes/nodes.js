// ── Network Posture Routes: /api/nodes ──
// Per-node status for the home-lab fleet: MAC Cmdr-7, Bat Tower-9, BatSrv-X,
// BatPi-Z. IP / open ports / CPU+GPU stress / latency per node.
//
// PENDING: no telemetry collector exists yet for this. Once one does, point
// NODES_API_URL at it.

import { Router } from 'express';

const router = Router();

const NODES_API_URL = process.env.NODES_API_URL || '';

const NODE_NAMES = ['MAC Cmdr-7', 'Bat Tower-9', 'BatSrv-X', 'BatPi-Z'];

function pendingPayload() {
  return {
    pending: true,
    nodes: NODE_NAMES.map((name) => ({
      name,
      status: 'pending_telemetry',
      ip: null,
      openPorts: [],
      cpuPercent: null,
      gpuPercent: null,
      latencyMs: null,
    })),
  };
}

router.get('/nodes', async (req, res) => {
  if (!NODES_API_URL) return res.json(pendingPayload());

  try {
    const upstream = await fetch(NODES_API_URL);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ ...pendingPayload(), error: err.message || 'nodes feed error' });
  }
});

export default router;
