/**
 * Typed client for the Tipimail React tool.
 *
 * Calls the module's own REST layer (config/react-api.php) under /melis/react-api/tipimail.
 * Standard {success,data,error} envelope.
 */

const BASE = '/melis/react-api/tipimail'
const XHR = { 'X-Requested-With': 'XMLHttpRequest' }

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...XHR, ...(init?.headers || {}) },
    credentials: 'same-origin',
  })
  let json: any = null
  try { json = await res.json() } catch { /* non-JSON */ }
  if (!json || json.success !== true) {
    throw new Error((json && json.error) || `HTTP ${res.status}`)
  }
  return json.data as T
}

export type WebaccessInfo = { url: string; canFrame: boolean }

export const fetchWebaccessInfo = () => apiFetch<WebaccessInfo>(`${BASE}/webaccess-url`)
