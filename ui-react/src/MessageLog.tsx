import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { fetchMessages, type Messages, type ApiError } from './tipimail-api'
import { useT, useLang } from './i18n'
import { Card, Button, Spinner, NotConfigured, ErrorBanner, c, fmtDate } from './ui'

const DAY = 86400
const PAGE_SIZE = 25

function stateColor(state: string): string {
  const s = (state || '').toLowerCase()
  if (s.includes('deliver')) return '#16a34a'
  if (s.includes('open') || s.includes('click')) return 'var(--color-primary)'
  if (s.includes('bounce') || s.includes('error') || s.includes('reject') || s.includes('fail')) return 'var(--color-destructive)'
  return 'var(--color-muted-foreground)'
}

export default function MessageLog({ configured, onGoSettings }: { configured: boolean; onGoSettings: () => void }) {
  const t = useT()
  const lang = useLang()
  const [days] = useState(30)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [data, setData] = useState<Messages | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  // Incrémenté par « Réinitialiser les filtres » : force le rechargement même quand la
  // recherche et la page sont déjà à leur valeur par défaut (sinon l'effet ne rejoue pas).
  const [tick, setTick] = useState(0)

  const load = useCallback((p: number, s: string) => {
    setLoading(true); setError(null)
    const end = Math.floor(Date.now() / 1000)
    fetchMessages({ page: p, pageSize: PAGE_SIZE, search: s, dateBegin: end - days * DAY, dateEnd: end })
      .then((m) => setData(m))
      .catch((e: ApiError) => setError(e))
      .finally(() => setLoading(false))
  }, [days])

  useEffect(() => { if (configured) load(page, search) }, [configured, page, search, load, tick])

  // Réinitialiser : recherche + page 1, puis rechargement. On vide `data` pour repasser par
  // l'état « Chargement » (sinon les anciennes lignes restent et le clic paraît sans effet).
  const resetFilters = () => {
    setSearchInput(''); setSearch(''); setPage(1)
    setData(null)
    setTick((x) => x + 1)
  }

  if (!configured) return <NotConfigured t={t} onGo={onGoSettings} />

  const items = data?.items ?? []
  const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '.03em', borderBottom: `1px solid ${c.border}` }
  const td: CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: `1px solid ${c.border}`, verticalAlign: 'top' }

  const submitSearch = () => { setSearch(searchInput.trim()); setPage(1) }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flex: '1 1 260px', maxWidth: 380 }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
            placeholder={t('msg.searchPh')}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.card, color: c.fg, fontSize: 13 }}
          />
          <Button variant="ghost" onClick={submitSearch}>{t('common.search')}</Button>
        </div>
        <Button variant="ghost" onClick={resetFilters} style={{ marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v6h6" /><path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
          </svg>
          {t('common.reset_filters')}
        </Button>
        <Button variant="ghost" onClick={() => load(page, search)} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
          </svg>
          {t('common.refresh')}
        </Button>
      </div>

      {error && <ErrorBanner message={error.code === 'invalid_credentials' ? t('error.invalid') : (error.message || t('error.generic'))} />}

      <Card style={{ overflow: 'hidden' }}>
        {loading && !data ? <Spinner label={t('common.loading')} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>{t('msg.date')}</th>
                  <th style={th}>{t('msg.to')}</th>
                  <th style={th}>{t('msg.subject')}</th>
                  <th style={th}>{t('msg.state')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td style={{ ...td, color: c.muted, textAlign: 'center', padding: 28 }} colSpan={4}>{t('msg.empty')}</td></tr>
                ) : items.map((m) => (
                  <tr key={m.id}>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: c.muted }}>{fmtDate(m.createdDate, lang)}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{m.email || '—'}</td>
                    <td style={td}>{m.subject || '—'}</td>
                    <td style={td}><span style={{ color: stateColor(m.state), fontWeight: 600, fontSize: 12 }}>{m.state || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 14 }}>
        <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>{t('msg.prev')}</Button>
        <span style={{ fontSize: 12, color: c.muted }}>{t('msg.page', { n: page })}</span>
        <Button variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={loading || items.length < PAGE_SIZE}>{t('msg.next')}</Button>
      </div>
    </div>
  )
}
