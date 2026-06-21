const POLL_MS = 15000;

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function ensureMarkup() {
  if (document.getElementById('bat-commander-panel')) return;
  const panel = document.createElement('div');
  panel.className = 'data-panel bat-commander-panel';
  panel.id = 'bat-commander-panel';
  panel.style.position = 'absolute';
  panel.style.top = '20px';
  panel.style.left = '320px';
  panel.innerHTML = `
    <div class="data-panel-title" id="bat-commander-header"><span>BAT CMDR-ALPHA</span></div>
    <div class="bc-card" id="bat-commander-card"><div class="bc-level bc-level-unknown">LOADING…</div></div>
  `;
  document.body.appendChild(panel);
}

function render(data) {
  const card = document.getElementById('bat-commander-card');
  if (!card) return;

  if (data.pending) {
    card.innerHTML = `
      <div class="bc-level bc-level-unknown">PENDING BACKEND</div>
      <div class="bc-brief">${escapeHtml(data.local_brief || 'Awaiting feed configuration.')}</div>
    `;
    return;
  }

  const level = (data.level || 'unknown').toUpperCase();
  const summaries = (data.agent_summaries || [])
    .map((a) => `<div class="bc-agent"><span class="bc-agent-name">${escapeHtml(a.agent)}</span><span class="bc-agent-level bc-level-${escapeHtml(a.level)}">${escapeHtml((a.level || '').toUpperCase())}</span></div>`)
    .join('');

  card.innerHTML = `
    <div class="bc-level bc-level-${escapeHtml(data.level || 'unknown')}">${escapeHtml(level)}</div>
    <div class="bc-brief">${escapeHtml(data.local_brief || '')}</div>
    <div class="bc-agents">${summaries}</div>
  `;
}

async function fetchBrief() {
  try {
    const res = await fetch('/api/bat-commander');
    const data = await res.json();
    render(data);
  } catch (err) {
    console.error('[BAT CMDR-ALPHA] fetch error:', err);
  }
}

export function initBatCommanderPanel() {
  ensureMarkup();
  const header = document.getElementById('bat-commander-header');
  header?.addEventListener('click', () => {
    document.getElementById('bat-commander-panel')?.classList.toggle('collapsed');
  });

  fetchBrief();
  setInterval(fetchBrief, POLL_MS);
}
