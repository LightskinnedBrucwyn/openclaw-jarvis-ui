import { renderMarkdown } from './markdown.js';

const GREETING = 'Welcome Sir, how can I assist you.';

let opened = false;
let sending = false;

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function ensureMarkup() {
  if (document.getElementById('openhands-launcher')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'openhands-launcher';
  wrapper.id = 'openhands-launcher';
  wrapper.style.position = 'fixed';
  wrapper.style.bottom = '20px';
  wrapper.style.right = '20px';
  wrapper.style.zIndex = '20';
  wrapper.style.pointerEvents = 'auto';
  wrapper.innerHTML = `
    <button class="openhands-toggle" id="openhands-toggle" title="OpenHands"><span class="openhands-arrow">▾</span> OPENHANDS</button>
    <div class="openhands-panel" id="openhands-panel">
      <div class="openhands-header">OPENHANDS</div>
      <div class="openhands-body" id="openhands-body"></div>
      <div class="openhands-input-bar">
        <input type="text" id="openhands-input" class="openhands-input" placeholder="TYPE A MESSAGE..." />
        <button class="btn" id="openhands-send">SEND</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);
}

function appendLine(container, role, html) {
  const line = document.createElement('div');
  line.className = `oh-line oh-line-${role}`;
  line.innerHTML = html;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

async function sendMessage(input, body) {
  const text = input.value.trim();
  if (!text || sending) return;
  sending = true;
  input.value = '';

  appendLine(body, 'user', `<span class="oh-text">${escapeHtml(text)}</span>`);
  window.dispatchEvent(new CustomEvent('agent-state', { detail: 'thinking' }));

  try {
    const res = await fetch('/api/openhands/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    const reply = data.reply || data.message || (data.error ? `[OpenHands unavailable: ${data.error}]` : '[no reply]');
    appendLine(body, 'agent', renderMarkdown(reply));
  } catch (err) {
    appendLine(body, 'agent', `<span class="oh-text oh-error">[OpenHands unavailable: ${escapeHtml(err.message)}]</span>`);
  } finally {
    window.dispatchEvent(new CustomEvent('agent-state', { detail: 'idle' }));
    sending = false;
  }
}

export function initOpenHandsPanel() {
  ensureMarkup();
  const toggle = document.getElementById('openhands-toggle');
  const panel = document.getElementById('openhands-panel');
  const body = document.getElementById('openhands-body');
  const input = document.getElementById('openhands-input');
  const sendBtn = document.getElementById('openhands-send');
  if (!toggle || !panel || !body || !input) return;

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    toggle.classList.toggle('open');
    if (panel.classList.contains('open') && !opened) {
      opened = true;
      appendLine(body, 'agent', `<span class="oh-text">${escapeHtml(GREETING)}</span>`);
    }
  });

  sendBtn?.addEventListener('click', () => sendMessage(input, body));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(input, body);
  });
}
