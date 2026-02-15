'use client'

import { motion } from 'framer-motion'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { FileText, Users, Shield, AlertCircle } from 'lucide-react'

export function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: 'By accessing and using Canstory, you accept and agree to be bound by the terms and provision of this agreement.',
    },
    {
      icon: Users,
      title: 'User Responsibilities',
      content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.',
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: 'The content, organization, graphics, design, and other matters related to Canstory are protected under applicable copyrights and other proprietary laws.',
    },
    {
      icon: AlertCircle,
      title: 'Limitation of Liability',
      content: 'Canstory shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.',
    },
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <Header activeLink="Terms of Service" />
      
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
              Terms of Service
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
              Welcome to Canstory. These Terms of Service govern your use of our website and services. By using Canstory, you agree to these terms in full.
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
              Questions?
            </h2>
            <p className="text-foreground/70 dark:text-slate-400">
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@canstory.com" className="text-primary hover:underline">
                legal@canstory.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
