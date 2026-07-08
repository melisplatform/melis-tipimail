import { useState, type CSSProperties } from 'react'
import { saveSettings, testConnection, type Settings as TSettings, type ApiError } from './tipimail-api'
import { useT } from './i18n'
import { Card, Button, Spinner, ErrorBanner, c } from './ui'

export default function Settings({
  settings, onSaved,
}: {
  settings: TSettings | null
  onSaved: (s: TSettings) => void
}) {
  const t = useT()
  const [apiUser, setApiUser] = useState(settings?.apiUser ?? '')
  const [apiKey, setApiKey] = useState('')
  const hasKey = !!settings?.hasKey
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const save = () => {
    setError(null); setSaved(false); setTestMsg(null)
    if (!apiUser.trim()) { setError(t('set.required')); return }
    if (!apiKey.trim() && !hasKey) { setError(t('set.keyRequired')); return }
    setSaving(true)
    saveSettings(apiUser.trim(), apiKey.trim())
      .then((s) => { onSaved(s); setApiKey(''); setSaved(true) })
      .catch((e: ApiError) => setError(e.message || t('error.generic')))
      .finally(() => setSaving(false))
  }

  const test = () => {
    setTesting(true); setTestMsg(null)
    testConnection()
      .then((r) => {
        if (r.connected) setTestMsg({ ok: true, text: t('set.testOk') })
        else setTestMsg({ ok: false, text: t('set.testKo', { err: r.error || t('error.generic') }) })
      })
      .catch((e: ApiError) => setTestMsg({ ok: false, text: t('set.testKo', { err: e.message }) }))
      .finally(() => setTesting(false))
  }

  const label: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: c.fg, marginBottom: 6 }
  const input: CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.card, color: c.fg, fontSize: 13, boxSizing: 'border-box' }

  return (
    <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
      <Card style={{ maxWidth: 520, width: '100%', padding: '26px 28px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 600 }}>{t('set.title')}</h2>
        <p style={{ margin: '0 0 20px', fontSize: 12.5, color: c.muted, lineHeight: 1.6 }}>{t('set.help')}</p>

        {error && <ErrorBanner message={error} />}
        {saved && (
          <div style={{ background: 'color-mix(in srgb, #16a34a 12%, transparent)', color: '#16a34a', border: '1px solid color-mix(in srgb, #16a34a 40%, transparent)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {t('set.saved')}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={label}>{t('set.apiUser')}</label>
          <input value={apiUser} onChange={(e) => setApiUser(e.target.value)} style={input} autoComplete="off" spellCheck={false} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={label}>{t('set.apiKey')}</label>
          <input
            type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasKey ? t('set.apiKeyKept') : ''} style={input} autoComplete="off" spellCheck={false}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button type="button" onClick={save} disabled={saving}>{t('common.save')}</Button>
          <Button variant="ghost" onClick={test} disabled={testing || (!hasKey && !apiKey.trim())}>{testing ? t('set.testing') : t('set.test')}</Button>
          {testing ? <Spinner /> : null}
          {testMsg ? (
            <span style={{ fontSize: 13, fontWeight: 600, color: testMsg.ok ? '#16a34a' : c.destructive }}>{testMsg.text}</span>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
