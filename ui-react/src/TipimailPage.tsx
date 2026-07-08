import { useEffect, useState } from 'react'
import { fetchSettings, type Settings as TSettings } from './tipimail-api'
import { useT } from './i18n'
import { useCaps } from './shared/useCaps'
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

const MELIS_KEY = 'melis_tool_tipimail_webaccess'
type Tab = 'dashboard' | 'messages' | 'settings'

export default function TipimailPage() {
  const t = useT()
  // Advanced rights: central host caps check (window.__melisUseCaps). Each tab = one capability
  // (config/react.capabilities.php). Default-allow while loading / when the tool is unmanaged.
  const { can } = useCaps(MELIS_KEY)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [settings, setSettings] = useState<TSettings | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
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
  // Hide any tab whose capability is denied (can() is default-allow → shows all while loading).
  const canShow = (id: Tab) => can(id)
  const tabs = allTabs.filter((tb) => canShow(tb.id))

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

      {/* Content — each panel is gated by its capability, NOT just the active-tab state, so a denied
          tab's content never renders even if `tab` still points at it (e.g. the no-key Settings
          redirect, or when every tab is denied and the tab bar is empty). */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {!loaded ? <Spinner label={t('common.loading')} /> : tabs.length === 0 ? (
          <div style={{ padding: 24, fontSize: 13.5, color: c.muted }}>{t('common.no_access')}</div>
        ) : (
          <>
            {tab === 'dashboard' && canShow('dashboard') && <Dashboard configured={configured} onGoSettings={() => setTab('settings')} />}
            {tab === 'messages' && canShow('messages') && <MessageLog configured={configured} onGoSettings={() => setTab('settings')} />}
            {tab === 'settings' && canShow('settings') && <Settings settings={settings} onSaved={(s) => setSettings(s)} />}
          </>
        )}
      </div>
    </div>
  )
}
