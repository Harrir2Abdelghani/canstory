'use client'

import { motion } from 'framer-motion'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { Cookie, Settings, Eye, Trash2 } from 'lucide-react'

export function CookiesPage() {
  const sections = [
    {
      icon: Cookie,
      title: 'What Are Cookies?',
      content: 'Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.',
    },
    {
      icon: Settings,
      title: 'How We Use Cookies',
      content: 'We use cookies to improve your browsing experience, analyze site traffic, personalize content, and remember your preferences. This helps us provide you with relevant content and a seamless user experience.',
    },
    {
      icon: Eye,
      title: 'Types of Cookies We Use',
      content: 'We use essential cookies (required for the site to function), analytics cookies (to understand how you use our site), and preference cookies (to remember your settings).',
    },
    {
      icon: Trash2,
      title: 'Managing Cookies',
      content: 'You can control and manage cookies through your browser settings. However, please note that disabling cookies may affect the functionality of our website.',
    },
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <Header activeLink="Cookie Policy" />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Cookie Policy
            </h1>
            <p className="text-xl text-foreground/70 dark:text-slate-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg text-foreground/80 dark:text-slate-300 leading-relaxed">
              This Cookie Policy explains how Canstory uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                className="p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-primary/10 dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(125, 90, 180, 0.2)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-foreground dark:text-slate-100">
                      {section.title}
                    </h2>
                    <p className="text-foreground/70 dark:text-slate-400 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-slate-100">
              More Information
            </h2>
            <p className="text-foreground/70 dark:text-slate-400">
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@canstory.com" className="text-primary hover:underline">
                privacy@canstory.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
