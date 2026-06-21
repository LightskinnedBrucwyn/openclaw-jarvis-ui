const POLL_MS = 15000;

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function ensureMarkup() {
  if (document.getElementById('network-nodes-panel')) return;
  const panel = document.createElement('div');
  panel.className = 'network-nodes-panel';
  panel.id = 'network-nodes-panel';
  panel.style.position = 'absolute';
  panel.style.bottom = '280px';
  panel.style.left = '20px';
  panel.style.right = '20px';
  panel.style.zIndex = '8';
  panel.innerHTML = `
    <div class="network-nodes-header" id="network-nodes-header">
      <span>NETWORK POSTURE</span><span class="node-arrow">▾</span>
    </div>
    <div class="network-nodes-body" id="network-nodes-body"></div>
  `;
  document.body.appendChild(panel);
}

function renderNode(node) {
  const slug = String(node.name || 'unknown').toLowerCase().replace(/\s+/g, '-');
  const pending = node.status === 'pending_telemetry';
  const cpuPercent = Number(node.cpuPercent);
  const gpuPercent = Number(node.gpuPercent);
  const latencyMs = Number(node.latencyMs);
  const cpuLabel = Number.isFinite(cpuPercent) ? `${cpuPercent}%` : '—';
  const gpuLabel = Number.isFinite(gpuPercent) ? `${gpuPercent}%` : '—';
  const latencyLabel = Number.isFinite(latencyMs) ? `${latencyMs} ms` : '—';

  return `
    <div class="node-card" data-node="${slug}">
      <div class="node-header" data-action="toggle">
        <span class="node-arrow">▾</span>
        <span class="node-name">${escapeHtml(node.name)}</span>
        <span class="node-status node-status-${pending ? 'pending' : escapeHtml(node.status)}">${pending ? 'PENDING' : escapeHtml(node.status).toUpperCase()}</span>
      </div>
      <div class="node-body">
        <div class="data-row"><span class="data-label">IP:</span><span class="data-value">${escapeHtml(node.ip ?? '—')}</span></div>
        <div class="data-row"><span class="data-label">OPEN PORTS:</span><span class="data-value">${(node.openPorts || []).map(escapeHtml).join(', ') || '—'}</span></div>
        <div class="data-row"><span class="data-label">CPU:</span><span class="data-value">${cpuLabel}</span></div>
        <div class="data-row"><span class="data-label">GPU:</span><span class="data-value">${gpuLabel}</span></div>
        <div class="data-row"><span class="data-label">LATENCY:</span><span class="data-value">${latencyLabel}</span></div>
      </div>
    </div>
  `;
}

function render(nodes) {
  const container = document.getElementById('network-nodes-body');
  if (!container) return;
  container.innerHTML = nodes.map(renderNode).join('');

  container.querySelectorAll('.node-header').forEach((header) => {
    header.addEventListener('click', () => {
      header.closest('.node-card')?.classList.toggle('collapsed');
    });
  });
}

async function fetchNodes() {
  try {
    const res = await fetch('/api/nodes');
    const data = await res.json();
    render(data.nodes || []);
  } catch (err) {
    console.error('[NODES] fetch error:', err);
  }
}

export function initNetworkNodesPanel() {
  ensureMarkup();
  const header = document.getElementById('network-nodes-header');
  header?.addEventListener('click', () => {
    document.getElementById('network-nodes-panel')?.classList.toggle('collapsed');
  });

  fetchNodes();
  setInterval(fetchNodes, POLL_MS);
}
