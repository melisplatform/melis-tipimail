import { useEffect, useState } from 'react'

/**
 * Self-contained i18n for the Tipimail brick (host modules aren't importable).
 * Reads the active language from <html lang> (set by the host I18nProvider to the
 * session locale) and reacts to changes. FR/EN only.
 */

export const DICT = {
  fr: {
    'common.loading': 'Chargement…',
    'error.generic': 'Une erreur est survenue.',
    'old.title': 'Tipimail ne peut pas s’afficher ici',
    'old.body': 'Pour des raisons de sécurité, Tipimail refuse de s’afficher dans une fenêtre intégrée. Ouvrez-le dans un nouvel onglet.',
    'old.cta': 'Ouvrir Tipimail',
  },
  en: {
    'common.loading': 'Loading…',
    'error.generic': 'Something went wrong.',
    'old.title': 'Tipimail can’t be displayed here',
    'old.body': 'For security reasons, Tipimail refuses to be displayed inside an embedded frame. Open it in a new tab instead.',
    'old.cta': 'Open Tipimail',
  },
} as const

export type Lang = keyof typeof DICT
export type Key = keyof (typeof DICT)['en']

export function currentLang(): Lang {
  return (document.documentElement.lang || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>(currentLang)
  useEffect(() => {
    const obs = new MutationObserver(() => setLang(currentLang()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
    return () => obs.disconnect()
  }, [])
  return lang
}

export function useT() {
  const lang = useLang()
  return (key: Key, vars?: Record<string, string | number>): string => {
    let s: string = DICT[lang][key] ?? DICT.en[key] ?? String(key)
    if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, String(vars[k]))
    return s
  }
}
