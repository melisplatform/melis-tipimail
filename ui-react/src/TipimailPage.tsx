import { useEffect, useState } from 'react'
import { fetchSettings, fetchAllowedTabs, type Settings as TSettings } from './tipimail-api'
import { useT } from './i18n'
import { Spinner, c } from './ui'
import Dashboard from './Dashboard'
import MessageLog from './MessageLog'
import Settings from './Settings'

/**
 * MelisTipimail — NATIVE React tool (no iframe, no external portal embed).
 *
 * Three tabs (Dashboard KPIs, Message log, Connection settings) backed by the module's
 * own JSON API (/melis/react-api/tipimail/*), which proxies the public Tipimail REST API
 * server-side with the stored credentials. Self-contained: inline styles + host theme CSS
 * vars, FR/EN from <html lang>, no host imports.
 */

type Tab = 'dashboard' | 'messages' | 'settings'

export default function TipimailPage() {
  const t = useT()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [settings, setSettings] = useState<TSettings | null>(null)
  const [loaded, setLoaded] = useState(false)
  // Advanced rights: tab keys the user may see (null = no restriction / admin). See tipimail-api.
  const [allowedTabs, setAllowedTabs] = useState<string[] | null>(null)

  useEffect(() => {
    fetchAllowedTabs().then(setAllowedTabs)
    fetchSettings()
      .then((s) => { setSettings(s); if (!s.hasKey) setTab('settings') })
      .catch(() => setSettings({ id: 0, apiUser: '', hasKey: false }))
      .finally(() => setLoaded(true))
  }, [])

  const configured = !!settings?.hasKey

  const allTabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: t('tab.dashboard') },
    { id: 'messages', label: t('tab.messages') },
    { id: 'settings', label: t('tab.settings') },
  ]
  // Hide any tab the user is denied (default-allow: allowedTabs === null ⇒ show all).
  const tabs = allTabs.filter((tb) => allowedTabs === null || allowedTabs.includes(tb.id))

  // Keep the active tab valid: if the current one is hidden (e.g. the no-key redirect to Settings
  // when Settings is denied), fall back to the first visible tab.
  useEffect(() => {
    if (tabs.length && !tabs.some((tb) => tb.id === tab)) {
      setTab(tabs[0].id)
    }
  }, [tabs, tab])

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--color-background, transparent)', color: c.fg }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${c.border}`, padding: '0 20px', flexShrink: 0 }}>
        {tabs.map((tb) => {
          const active = tab === tb.id
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              style={{
                appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '14px 16px', fontSize: 13.5, fontWeight: 600,
                color: active ? c.primary : c.muted,
                borderBottom: `2px solid ${active ? c.primary : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              {tb.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {!loaded ? <Spinner label={t('common.loading')} /> : (
          <>
            {tab === 'dashboard' && <Dashboard configured={configured} onGoSettings={() => setTab('settings')} />}
            {tab === 'messages' && <MessageLog configured={configured} onGoSettings={() => setTab('settings')} />}
            {tab === 'settings' && <Settings settings={settings} onSaved={(s) => setSettings(s)} />}
          </>
        )}
      </div>
    </div>
  )
}
