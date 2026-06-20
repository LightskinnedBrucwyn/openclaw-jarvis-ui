// ── SSE 廣播管理 ──

const sseClients = new Set();
const voiceChatHandlers = new Set();

export function addClient(res) { sseClients.add(res); }
export function removeClient(res) { sseClients.delete(res); }
export function clientCount() { return sseClients.size; }
export function addVoiceHandler(h) { voiceChatHandlers.add(h); }
export function removeVoiceHandler(h) { voiceChatHandlers.delete(h); }

// 提取文字內容
function extractText(payload) {
  if (!payload.message?.content) return '';
  const content = payload.message.content;
  if (Array.isArray(content)) return content.filter(c => c.type === 'text').map(c => c.text).join('');
  return typeof content === 'string' ? content : '';
}

// 寫入所有 SSE client，若某個 client 已斷線（write 失敗）則移除，避免迴圈拋錯
function writeAll(msg) {
  for (const res of sseClients) {
    try {
      res.write(`data: ${msg}\n\n`);
    } catch {
      sseClients.delete(res);
    }
  }
}

export function broadcastChat(payload) {
  const text = extractText(payload);
  const event = {
    runId: payload.runId,
    state: payload.state,
    text,
    role: payload.message?.role || '',
    done: payload.state === 'final' || payload.state === 'aborted',
  };
  if (payload.message?.model) event.model = payload.message.model;
  if (payload.message?.provider) event.provider = payload.message.provider;
  if (payload.message?.usage) event.usage = payload.message.usage;

  writeAll(JSON.stringify(event));
  for (const handler of voiceChatHandlers) { try { handler(payload); } catch {} }
}

export function broadcastSystem(data) {
  writeAll(JSON.stringify({ type: 'system', ...data }));
}

export function broadcastEvent(type) {
  writeAll(JSON.stringify({ type }));
}
