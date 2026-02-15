export type Language = 'fr' | 'en' | 'ar'

export interface Translations {
  common: {
    home: string
    about: string
    features: string
    contact: string
    faq: string
    cancerTypes: string
    testimonials: string
    admin: string
    signIn: string
    language: string
    theme: string
    light: string
    dark: string
    system: string
  }
  navigation: {
    home: string
    about: string
    features: string
    contact: string
    faq: string
    cancerTypes: string
    testimonials: string
  }
  landing: {
    hero: {
      title: string
      heading: string
      subtitle: string
      cta: string
      ctaSecondary: string
      downloadButton: string
      downloadMobile: string
      cards: {
        primary: {
          title: string
          subtitle: string
        }
        secondary: {
          title: string
          subtitle: string
        }
      }
    }
    features: {
      title: string
      subtitle: string
      description: string
      bullets: string[]
      emotionalSupport: {
        title: string
        description: string
        details: string
      }
      reliableInfo: {
        title: string
        description: string
        details: string
      }
      activeComm: {
        title: string
        description: string
        details: string
      }
      forums: {
        title: string
        description: string
        details: string
      }
      articles: {
        title: string
        description: string
        details: string
      }
      security: {
        title: string
        description: string
        details: string
      }
    }
    cancerTypes: {
      title: string
      subtitle: string
      description: string
      items: {
        breast: {
          name: string
          patients: string
          resources: string
          survivors: string
          description: string
        }
        lung: {
          name: string
          patients: string
          resources: string
          survivors: string
          description: string
        }
        prostate: {
          name: string
          patients: string
          resources: string
          survivors: string
          description: string
        }
        colon: {
          name: string
          patients: string
          resources: string
          survivors: string
          description: string
        }
        skin: {
          name: string
          patients: string
          resources: string
          survivors: string
          description: string
        }
        liver: {
          name: string
          patients: string
          resources: string
          survivors: string
          description: string
        }
      }
      labels: {
        patients: string
        resources: string
        survivors: string
      }
      info: {
        title: string
        description: string
      }[]
    }
    benefits: {
      title: string
      subtitle: string
      qualityOfLife: {
        title: string
        description: string
        stat: string
        statLabel: string
      }
      instantAccess: {
        title: string
        description: string
        stat: string
        statLabel: string
      }
      globalReach: {
        title: string
        description: string
        stat: string
        statLabel: string
      }
    }
    steps: {
      title: string
      subtitle: string
      download: {
        number: string
        title: string
        description: string
        details: string
      }
      createAccount: {
        number: string
        title: string
        description: string
        details: string
      }
      joinCommunity: {
        number: string
        title: string
        description: string
        details: string
      }
      tracking: {
        number: string
        title: string
        description: string
        details: string
      }
    }
    testimonials: {
      title: string
      subtitle: string
    }
    faqs: {
      title: string
      subtitle: string
      q1: string
      a1: string
      q2: string
      a2: string
      q3: string
      a3: string
      q4: string
      a4: string
      q5: string
      a5: string
      q6: string
      a6: string
      q7: string
      a7: string
      q8: string
      a8: string
    }
    stats: {
      heading: string
      subtitle: string
      members: {
        value: string
        label: string
      }
      articles: {
        value: string
        label: string
      }
      countries: {
        value: string
        label: string
      }
      satisfaction: {
        value: string
        label: string
      }
      rating: {
        value: string
        label: string
      }
    }
    cta: {
      title: string
      subtitle: string
      button: string
      secondaryButton: string
      tagline: string
    }
    footer: {
      quickLinks: string
      resources: string
      company: string
      legal: string
      followUs: string
      copyright: string
      newsletter: string
      restInformed: string
      security: string
      applications: string
      updates: string
      blog: string
      guide: string
      community: string
      articles: string
      careers: string
      press: string
      terms: string
      privacy: string
      cookies: string
      sitemap: string
      legalNotice: string
      emailPlaceholder: string
      designedWith: string
    }
  }
  about: {
    hero: {
      title: string
      subtitle: string
    }
    mission: {
      title: string
      description: string
    }
    values: {
      title: string
      solidarity: {
        title: string
        description: string
      }
      reliability: {
        title: string
        description: string
      }
      accessibility: {
        title: string
        description: string
      }
      community: {
        title: string
        description: string
      }
    }
    objectives: {
      title: string
      obj1: string
      obj2: string
      obj3: string
      obj4: string
      obj5: string
      obj6: string
    }
    impact: {
      title: string
      subtitle: string
    }
  }
  features: {
    hero: {
      title: string
      subtitle: string
    }
    modules: {
      i3lam: {
        title: string
        subtitle: string
        description: string
      }
      ghida2ak: {
        title: string
        subtitle: string
        description: string
      }
      tawassol: {
        title: string
        subtitle: string
        description: string
      }
      khibrati: {
        title: string
        subtitle: string
        description: string
      }
      tawassolMasakin: {
        title: string
        subtitle: string
        description: string
      }
      tawassolAssociations: {
        title: string
        subtitle: string
        description: string
      }
    }
  }
  contact: {
    hero: {
      title: string
      subtitle: string
    }
    form: {
      name: string
      email: string
      phone: string
      subject: string
      message: string
      submit: string
      success: string
      error: string
    }
    methods: {
      emailTitle: string
      emailDesc: string
      emailContact: string
      phoneTitle: string
      phoneDesc: string
      phoneContact: string
      chatTitle: string
      chatDesc: string
      chatContact: string
      addressTitle: string
      addressDesc: string
      addressContact: string
    }
  }
  faq: {
    hero: {
      title: string
      subtitle: string
    }
    questions: {
      q1: string
      a1: string
      q2: string
      a2: string
      q3: string
      a3: string
      q4: string
      a4: string
      q5: string
      a5: string
      q6: string
      a6: string
      q7: string
      a7: string
      q8: string
      a8: string
    }
  }
  testimonials: {
    hero: {
      title: string
      subtitle: string
    }
    items: {
      fatima: {
        name: string
        role: string
        location: string
        content: string
      }
      mohamed: {
        name: string
        role: string
        location: string
        content: string
      }
      aicha: {
        name: string
        role: string
        location: string
        content: string
      }
      ahmed: {
        name: string
        role: string
        location: string
        content: string
      }
      leila: {
        name: string
        role: string
        location: string
        content: string
      }
      karim: {
        name: string
        role: string
        location: string
        content: string
      }
    }
  }
  cancerTypes: {
    hero: {
      title: string
      subtitle: string
    }
  }
}

export const defaultLanguage: Language = 'fr'
export const languages: { code: Language; name: string }[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
]
