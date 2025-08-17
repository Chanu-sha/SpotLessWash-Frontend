export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function apiPost(path, body, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error((await safeJson(res)).error || 'Request failed');
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error((await safeJson(res)).error || 'Request failed');
  return res.json();
}

async function safeJson(res) {
  try { return await res.json(); } catch { return {}; }
}
