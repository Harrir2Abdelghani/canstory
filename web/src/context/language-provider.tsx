import React, { createContext, useContext, useEffect, useState } from 'react'
import { Language, defaultLanguage, languages } from '@/config/i18n'
import { fr } from '@/config/translations/fr'
import { en } from '@/config/translations/en'
import { ar } from '@/config/translations/ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof fr
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  fr,
  en,
  ar,
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null
    if (savedLanguage && languages.some((l) => l.code === savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      const browserLang = navigator.language.split('-')[0].toLowerCase()
      if (browserLang === 'ar') {
        setLanguageState('ar')
      } else if (browserLang === 'en') {
        setLanguageState('en')
      } else {
        setLanguageState('fr')
      }
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const isRTL = language === 'ar'
  const t = translations[language]

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
