import { useCallback, useEffect, useState } from 'react'
import { fetchStats, type Stats, type ApiError } from './tipimail-api'
import { useT, useLang } from './i18n'
import { Card, Button, Spinner, NotConfigured, ErrorBanner, c, num } from './ui'

const DAY = 86400
function rangeSeconds(days: number) {
  const end = Math.floor(Date.now() / 1000)
  return { dateBegin: end - days * DAY, dateEnd: end }
}

/** Best-effort extraction of a credit count from the (undocumented-shape) credits payload. */
function creditValue(credits: any): string | null {
  if (credits == null) return null
  if (typeof credits === 'number') return String(credits)
  if (typeof credits === 'object') {
    for (const k of ['credits', 'remaining', 'amount', 'value', 'count', 'available']) {
      if (typeof credits[k] === 'number') return String(credits[k])
    }
  }
  return null
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Card style={{ padding: '16px 18px', flex: '1 1 150px', minWidth: 150 }}>
      <div style={{ fontSize: 12, color: c.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent ? c.primary : c.fg, lineHeight: 1.1 }}>{value}</div>
      {sub ? <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{sub}</div> : null}
    </Card>
  )
}

export default function Dashboard({ configured, onGoSettings }: { configured: boolean; onGoSettings: () => void }) {
  const t = useT()
  const lang = useLang()
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback((d: number) => {
    setLoading(true); setError(null)
    fetchStats(rangeSeconds(d))
      .then((s) => setData(s))
      .catch((e: ApiError) => setError(e))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (configured) load(days) }, [configured, days, load])

  if (!configured) return <NotConfigured t={t} onGo={onGoSettings} />

  const k = data?.kpis
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[7, 30, 90].map((d) => (
            <Button key={d} variant={days === d ? 'primary' : 'ghost'} onClick={() => setDays(d)}>
              {t(`range.${d}` as any)}
            </Button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => load(days)} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
          </svg>
          {t('common.refresh')}
        </Button>
      </div>

      {error && <ErrorBanner message={error.code === 'invalid_credentials' ? t('error.invalid') : (error.message || t('error.generic'))} />}
      {loading && !data ? <Spinner label={t('common.loading')} /> : null}

      {k && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Kpi label={t('kpi.credits')} value={creditValue(data?.credits) ?? '—'} accent />
          <Kpi label={t('kpi.requested')} value={num(k.requested, lang)} />
          <Kpi label={t('kpi.delivered')} value={num(k.delivered, lang)} />
          <Kpi label={t('kpi.open')} value={num(k.open, lang)} sub={t('kpi.uniqueOpeners', { n: num(k.opener, lang) })} />
          <Kpi label={t('kpi.click')} value={num(k.click, lang)} sub={t('kpi.uniqueClickers', { n: num(k.clicker, lang) })} />
          <Kpi label={t('kpi.bounces')} value={num(k.hardbounced + k.softbounced, lang)} sub={t('kpi.hardSoft', { hard: num(k.hardbounced, lang), soft: num(k.softbounced, lang) })} />
          <Kpi label={t('kpi.unsubscribed')} value={num(k.unsubscribed, lang)} />
        </div>
      )}
    </div>
  )
}
