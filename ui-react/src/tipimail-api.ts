/**
 * Typed client for the native Tipimail React tool.
 *
 * Calls the module's own REST layer (config/react-api.php) under /melis/react-api/tipimail,
 * which proxies the public Tipimail API (api.tipimail.com/v1) server-side with the stored
 * X-Tipimail-ApiUser / X-Tipimail-ApiKey credentials. Standard {success,data,error} envelope.
 */

const BASE = '/melis/react-api/tipimail'
const XHR = { 'X-Requested-With': 'XMLHttpRequest' }

export type ApiError = { code: 'not_configured' | 'invalid_credentials' | 'error'; message: string }

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...XHR, ...(init?.headers || {}) },
    credentials: 'same-origin',
  })
  let json: any = null
  try { json = await res.json() } catch { /* non-JSON */ }
  if (!json || json.success !== true) {
    const raw = (json && json.error) || `HTTP ${res.status}`
    const code = raw === 'not_configured' ? 'not_configured'
      : raw === 'invalid_credentials' ? 'invalid_credentials' : 'error'
    const err: ApiError = { code, message: String(raw) }
    throw err
  }
  return json.data as T
}

export type Settings = { id: number; apiUser: string; hasKey: boolean }
export type TestResult = { configured: boolean; connected: boolean; error?: string | null; account?: any }

export type Kpis = {
  requested: number; delivered: number; open: number; opener: number
  click: number; clicker: number; hardbounced: number; softbounced: number
  unsubscribed: number; complaint: number
}
export type Stats = { configured: boolean; credits?: any; kpis?: Kpis; raw?: any }

export type MessageRow = {
  id: string; createdDate: number | null; lastStateDate: number | null
  state: string; from: string; email: string; subject: string; size: number
}
export type Messages = { configured: boolean; total: number; page?: number; pageSize?: number; items: MessageRow[] }

export type DateRange = { dateBegin?: number | null; dateEnd?: number | null }

function rangeQuery(r?: DateRange): string {
  const p = new URLSearchParams()
  if (r?.dateBegin) p.set('dateBegin', String(r.dateBegin))
  if (r?.dateEnd) p.set('dateEnd', String(r.dateEnd))
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const fetchSettings = () => apiFetch<Settings>(`${BASE}/settings`)

export const saveSettings = (apiUser: string, apiKey: string) =>
  apiFetch<Settings>(`${BASE}/settings/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiUser, apiKey }),
  })

export const testConnection = () => apiFetch<TestResult>(`${BASE}/test`)

export const fetchStats = (r?: DateRange) => apiFetch<Stats>(`${BASE}/stats${rangeQuery(r)}`)

export const fetchMessages = (opts: { page?: number; pageSize?: number; search?: string } & DateRange) => {
  const p = new URLSearchParams()
  if (opts.page) p.set('page', String(opts.page))
  if (opts.pageSize) p.set('pageSize', String(opts.pageSize))
  if (opts.search) p.set('search', opts.search)
  if (opts.dateBegin) p.set('dateBegin', String(opts.dateBegin))
  if (opts.dateEnd) p.set('dateEnd', String(opts.dateEnd))
  const qs = p.toString()
  return apiFetch<Messages>(`${BASE}/messages${qs ? `?${qs}` : ''}`)
}
