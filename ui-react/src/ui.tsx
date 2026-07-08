import type { CSSProperties, ReactNode } from 'react'

/**
 * Shared inline-styled primitives for the Tipimail brick. No host imports: styles use
 * the host theme CSS variables so light/dark follow the shell. Icons are inline SVG.
 */

export const c = {
  card: 'var(--color-card)',
  cardFg: 'var(--color-card-foreground, var(--color-foreground))',
  fg: 'var(--color-foreground)',
  muted: 'var(--color-muted-foreground)',
  border: 'var(--color-border)',
  primary: 'var(--color-primary)',
  primaryFg: 'var(--color-primary-foreground)',
  destructive: 'var(--color-destructive)',
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: c.card, color: c.cardFg, border: `1px solid ${c.border}`, borderRadius: 12, ...style }}>
      {children}
    </div>
  )
}

export function Button({
  children, onClick, variant = 'primary', disabled, type = 'button', style,
}: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost'
  disabled?: boolean; type?: 'button' | 'submit'; style?: CSSProperties
}) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px',
    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1, border: '1px solid transparent', whiteSpace: 'nowrap',
  }
  const variants: Record<string, CSSProperties> = {
    primary: { background: c.primary, color: c.primaryFg },
    ghost: { background: 'transparent', color: c.fg, borderColor: c.border },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: c.muted, fontSize: 13, padding: 24 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'tipi-spin 0.8s linear infinite' }}>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="42" strokeLinecap="round" opacity="0.7" />
      </svg>
      {label}
      <style>{`@keyframes tipi-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export function NotConfigured({ t, onGo }: { t: (k: any, v?: any) => string; onGo: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <Card style={{ maxWidth: 480, textAlign: 'center', padding: '36px 30px' }}>
        <div style={{ fontSize: 34, marginBottom: 12 }}>✉️</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600 }}>{t('notConfigured.title')}</h2>
        <p style={{ margin: '0 0 20px', color: c.muted, fontSize: 13, lineHeight: 1.6 }}>{t('notConfigured.body')}</p>
        <Button onClick={onGo}>{t('notConfigured.cta')}</Button>
      </Card>
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      background: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)',
      color: c.destructive, border: `1px solid color-mix(in srgb, var(--color-destructive) 40%, transparent)`,
      borderRadius: 8, padding: '10px 14px', fontSize: 13, margin: '0 0 16px',
    }}>
      {message}
    </div>
  )
}

/** Unix seconds (or ms) → localized date-time string, following the BO locale. */
export function fmtDate(value: number | string | null | undefined, lang: 'fr' | 'en'): string {
  if (value === null || value === undefined || value === '') return '—'
  let n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '—'
  if (n < 1e12) n = n * 1000 // seconds → ms
  const d = new Date(n)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function num(n: number, lang: 'fr' | 'en'): string {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB').format(n || 0)
}
