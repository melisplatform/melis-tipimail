import { useEffect, useState } from 'react'
import { fetchWebaccessInfo } from './tipimail-api'
import { useT } from './i18n'
import { Button, Spinner, c } from './ui'

/**
 * MelisTipimail — single-screen tool, same intent as the original legacy tool ("a built-in
 * bookmark" to the Tipimail web app, config/app.tools.php). On open, a server-side probe
 * (webaccessUrlAction) checks whether Tipimail can actually be embedded in an iframe —
 * X-Frame-Options / CSP frame-ancestors on a cross-origin response can't be read from our
 * own JS (same-origin policy blocks it, and the iframe's `load` event fires the same way
 * whether the navigation succeeded or was blocked), so the check happens server-side. If it
 * can be framed, the tool embeds it directly; if not (the common case — Tipimail sends
 * X-Frame-Options: sameorigin), a small panel offers to open it in a new tab instead.
 */

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; url: string; canFrame: boolean }

export default function TipimailPage() {
  const t = useT()
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    fetchWebaccessInfo()
      .then((r) => setState(r.url ? { status: 'ready', url: r.url, canFrame: r.canFrame } : { status: 'error' }))
      .catch(() => setState({ status: 'error' }))
  }, [])

  if (state.status === 'loading') {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner label={t('common.loading')} />
      </div>
    )
  }

  if (state.status === 'ready' && state.canFrame) {
    return (
      <iframe
        src={state.url}
        title="Tipimail"
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    )
  }

  if (state.status === 'error') {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <p style={{ maxWidth: 360, textAlign: 'center', fontSize: 13.5, color: c.muted }}>{t('error.generic')}</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, textAlign: 'center', border: `1px solid ${c.border}`, borderRadius: 12, background: c.card, padding: '32px 28px' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: c.fg }}>{t('old.title')}</h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{t('old.body')}</p>
        <Button onClick={() => window.open(state.url, '_blank', 'noopener,noreferrer')}>
          {t('old.cta')} ↗
        </Button>
      </div>
    </div>
  )
}
