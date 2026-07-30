import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { fetchMessages, type MessageRow, type ApiError } from './tipimail-api'
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
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [items, setItems] = useState<MessageRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  // Incrémenté par « Réinitialiser les filtres » / « Actualiser » : force un rechargement frais.
  const [tick, setTick] = useState(0)

  // Scroll infini sur la pagination de l'API Tipimail (externe) : on concatène les pages jusqu'à
  // épuisement de `total`. Pas de tri server-side (l'API externe n'en expose pas via notre proxy).
  const pageRef = useRef(0)
  const loadingRef = useRef(false)
  const reqRef = useRef(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (reset: boolean) => {
    if (!reset && loadingRef.current) return
    const myReq = ++reqRef.current
    loadingRef.current = true
    setLoading(true)
    if (reset) setError(null)
    const nextPage = reset ? 1 : pageRef.current + 1
    const end = Math.floor(Date.now() / 1000)
    try {
      const m = await fetchMessages({ page: nextPage, pageSize: PAGE_SIZE, search, dateBegin: end - days * DAY, dateEnd: end })
      if (myReq !== reqRef.current) return
      pageRef.current = nextPage
      setTotal(m.total || 0)
      setItems((prev) => (reset ? m.items : [...prev, ...m.items]))
      // `total` = total NON filtré côté Tipimail → on continue de charger tant qu'il reste des pages.
      setHasMore(nextPage * PAGE_SIZE < (m.total || 0))
    } catch (e) {
      if (myReq === reqRef.current) { setError(e as ApiError); setHasMore(false) }
    } finally {
      if (myReq === reqRef.current) { setLoading(false); loadingRef.current = false }
    }
  }, [days, search])

  // Chargement frais au 1er montage + à chaque changement de filtre/refresh.
  useEffect(() => { if (configured) load(true) }, [configured, search, tick, load])

  // Sentinel visible → page suivante (load gère l'anti-stack).
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) load(false) }, { rootMargin: '120px' })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [hasMore, load])

  // Réinitialiser : recherche + rechargement depuis la page 1. On vide `items` pour repasser par
  // l'état « Chargement » (sinon les anciennes lignes restent et le clic paraît sans effet).
  const resetFilters = () => {
    setSearchInput(''); setSearch('')
    setItems([])
    setTick((x) => x + 1)
  }

  if (!configured) return <NotConfigured t={t} onGo={onGoSettings} />

  const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '.03em', borderBottom: `1px solid ${c.border}` }
  const td: CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: `1px solid ${c.border}`, verticalAlign: 'top' }

  const submitSearch = () => { setSearch(searchInput.trim()) }

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
        <Button variant="ghost" onClick={() => setTick((x) => x + 1)} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
          </svg>
          {t('common.refresh')}
        </Button>
      </div>

      {error && <ErrorBanner message={error.code === 'invalid_credentials' ? t('error.invalid') : (error.message || t('error.generic'))} />}

      <Card style={{ overflow: 'hidden' }}>
        {loading && items.length === 0 ? <Spinner label={t('common.loading')} /> : (
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
        <div ref={sentinelRef} style={{ height: 1 }} />
        {loading && items.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', fontSize: 12, color: c.muted }}>
            <Spinner />{t('common.loading')}
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <div style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: c.muted }}>{t('msg.count', { n: total })}</div>
        )}
      </Card>
    </div>
  )
}
