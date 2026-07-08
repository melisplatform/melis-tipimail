import { useEffect, useState } from 'react'

/**
 * Self-contained i18n for the Tipimail brick (host modules aren't importable).
 * Reads the active language from <html lang> (set by the host I18nProvider to the
 * session locale) and reacts to changes. FR/EN only.
 */

export const DICT = {
  fr: {
    'tab.dashboard': 'Tableau de bord',
    'tab.messages': 'Journal des envois',
    'tab.settings': 'Connexion',
    'common.refresh': 'Actualiser',
    'common.loading': 'Chargement…',
    'common.save': 'Enregistrer',
    'common.search': 'Rechercher',
    'common.retry': 'Réessayer',
    'common.no_access': 'Vous n’avez pas les droits d’accéder à cet outil.',
    'notConfigured.title': 'Tipimail n’est pas encore connecté',
    'notConfigured.body': 'Renseignez votre identifiant et votre clé API Tipimail dans l’onglet « Connexion » pour afficher vos statistiques et vos envois.',
    'notConfigured.cta': 'Aller à la connexion',
    'error.invalid': 'Identifiants Tipimail invalides. Vérifiez l’onglet « Connexion ».',
    'error.generic': 'Une erreur est survenue.',
    'range.7': '7 jours',
    'range.30': '30 jours',
    'range.90': '90 jours',
    'kpi.credits': 'Crédits restants',
    'kpi.requested': 'Envoyés',
    'kpi.delivered': 'Délivrés',
    'kpi.open': 'Ouvertures',
    'kpi.click': 'Clics',
    'kpi.bounces': 'Rejets (bounces)',
    'kpi.unsubscribed': 'Désabonnements',
    'kpi.uniqueOpeners': '{n} destinataires uniques',
    'kpi.uniqueClickers': '{n} destinataires uniques',
    'kpi.hardSoft': '{hard} durs · {soft} temporaires',
    'msg.date': 'Date',
    'msg.to': 'Destinataire',
    'msg.subject': 'Objet',
    'msg.state': 'État',
    'msg.empty': 'Aucun message sur cette période.',
    'msg.searchPh': 'Filtrer (destinataire, objet)…',
    'msg.prev': 'Précédent',
    'msg.next': 'Suivant',
    'msg.page': 'Page {n}',
    'set.title': 'Connexion à l’API Tipimail',
    'set.help': 'Ces identifiants proviennent de votre compte Tipimail (Paramètres → SMTP et API). Ils sont stockés côté serveur et jamais exposés au navigateur.',
    'set.apiUser': 'Identifiant API (SMTP user)',
    'set.apiKey': 'Clé API',
    'set.apiKeyKept': '•••••••• (inchangée)',
    'set.saved': 'Identifiants enregistrés.',
    'set.test': 'Tester la connexion',
    'set.testing': 'Test en cours…',
    'set.testOk': 'Connexion réussie ✓',
    'set.testKo': 'Échec de la connexion : {err}',
    'set.required': 'L’identifiant API est obligatoire.',
    'set.keyRequired': 'La clé API est obligatoire.',
  },
  en: {
    'tab.dashboard': 'Dashboard',
    'tab.messages': 'Message log',
    'tab.settings': 'Connection',
    'common.refresh': 'Refresh',
    'common.loading': 'Loading…',
    'common.save': 'Save',
    'common.search': 'Search',
    'common.retry': 'Retry',
    'common.no_access': 'You don’t have permission to access this tool.',
    'notConfigured.title': 'Tipimail is not connected yet',
    'notConfigured.body': 'Enter your Tipimail API user and key in the “Connection” tab to see your statistics and sent messages.',
    'notConfigured.cta': 'Go to connection',
    'error.invalid': 'Invalid Tipimail credentials. Check the “Connection” tab.',
    'error.generic': 'Something went wrong.',
    'range.7': '7 days',
    'range.30': '30 days',
    'range.90': '90 days',
    'kpi.credits': 'Remaining credits',
    'kpi.requested': 'Sent',
    'kpi.delivered': 'Delivered',
    'kpi.open': 'Opens',
    'kpi.click': 'Clicks',
    'kpi.bounces': 'Bounces',
    'kpi.unsubscribed': 'Unsubscribes',
    'kpi.uniqueOpeners': '{n} unique recipients',
    'kpi.uniqueClickers': '{n} unique recipients',
    'kpi.hardSoft': '{hard} hard · {soft} soft',
    'msg.date': 'Date',
    'msg.to': 'Recipient',
    'msg.subject': 'Subject',
    'msg.state': 'State',
    'msg.empty': 'No message in this period.',
    'msg.searchPh': 'Filter (recipient, subject)…',
    'msg.prev': 'Previous',
    'msg.next': 'Next',
    'msg.page': 'Page {n}',
    'set.title': 'Tipimail API connection',
    'set.help': 'These credentials come from your Tipimail account (Settings → SMTP and API). They are stored server-side and never exposed to the browser.',
    'set.apiUser': 'API user (SMTP user)',
    'set.apiKey': 'API key',
    'set.apiKeyKept': '•••••••• (unchanged)',
    'set.saved': 'Credentials saved.',
    'set.test': 'Test connection',
    'set.testing': 'Testing…',
    'set.testOk': 'Connection successful ✓',
    'set.testKo': 'Connection failed: {err}',
    'set.required': 'API user is required.',
    'set.keyRequired': 'API key is required.',
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
