import type { CSSProperties, ReactNode } from 'react'

/**
 * Shared inline-styled primitives for the Tipimail brick. No host imports: styles use
 * the host theme CSS variables so light/dark follow the shell.
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
