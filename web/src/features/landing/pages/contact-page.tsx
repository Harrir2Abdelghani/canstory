'use client'

import { motion } from 'framer-motion'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/context/language-provider'

const springTransition = { type: 'spring' as const, stiffness: 100, damping: 20 }

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: springTransition,
  viewport: { once: true, margin: '-80px' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export function ContactPage() {
  const { t } = useLanguage()
  const contactTexts = t.contact ?? {}
  const heroTexts = contactTexts.hero ?? {}
  const formTexts = contactTexts.form ?? {}
  const methodTexts = contactTexts.methods ?? {}
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const contactMethods = [
    {
      icon: Mail,
      title: methodTexts.emailTitle ?? 'Email',
      description: methodTexts.emailDesc ?? '',
      contact: methodTexts.emailContact ?? 'support@canstory.app',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      title: methodTexts.phoneTitle ?? 'Téléphone',
      description: methodTexts.phoneDesc ?? '',
      contact: methodTexts.phoneContact ?? '+213 (0) 123 456 789',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageSquare,
      title: methodTexts.chatTitle ?? 'Chat en Direct',
      description: methodTexts.chatDesc ?? '',
      contact: methodTexts.chatContact ?? 'Disponible 24/7',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: MapPin,
      title: methodTexts.addressTitle ?? 'Adresse',
      description: methodTexts.addressDesc ?? '',
      contact: methodTexts.addressContact ?? 'Alger, Algérie',
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <main className="w-full -mt-4 bg-background dark:bg-slate-950 text-foreground dark:text-slate-100 pt-20">
      <Header activeLink={t.navigation.contact} />

      {/* Hero Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '28px 28px' }} aria-hidden />
        <motion.div
          className="max-w-4xl mx-auto text-center relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
        >
          <motion.p
            className="text-primary font-semibold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t.navigation.contact}
          </motion.p>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-foreground dark:text-slate-100">
            <motion.span
              className="bg-gradient-to-r from-primary  to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {heroTexts.title ?? t.navigation.contact}
            </motion.span>
          </h1>
          <p className="text-xl text-foreground/70 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            {heroTexts.subtitle ?? ''}
          </p>
        </motion.div>
      </section>

      {/* Contact Methods */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative p-8 rounded-2xl border border-primary/10 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="relative">
                    <motion.div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 text-foreground dark:text-slate-100">{method.title}</h3>
                    <p className="text-foreground/70 dark:text-slate-400 text-sm mb-4 leading-relaxed">{method.description}</p>
                    <p className="text-primary dark:text-blue-400 font-semibold">{method.contact}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-12"
            {...fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground dark:text-slate-100">
              {heroTexts.title ?? t.navigation.contact}
            </h2>
            <p className="text-lg text-foreground/70 dark:text-slate-400">
              {heroTexts.subtitle ?? ''}
            </p>
          </motion.div>

          <motion.form
            className="space-y-6 p-8 rounded-2xl border border-primary/10 dark:border-slate-700 bg-white dark:bg-slate-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            onSubmit={(e) => {
              e.preventDefault()
              // Handle form submission
              console.log(formData)
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-semibold text-foreground dark:text-slate-100 mb-2">
                {formTexts.name ?? 'Nom Complet'}
              </label>
              <input
                type="text"
                placeholder={formTexts.name ?? 'Votre nom'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-primary/10 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground dark:text-slate-100 placeholder:text-foreground/50 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary/30 dark:focus:border-primary/50 transition-colors"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-semibold text-foreground dark:text-slate-100 mb-2">
                {formTexts.email ?? 'Email'}
              </label>
              <input
                type="email"
                placeholder={formTexts.email ?? 'name@example.com'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-primary/10 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground dark:text-slate-100 placeholder:text-foreground/50 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary/30 dark:focus:border-primary/50 transition-colors"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-foreground dark:text-slate-100 mb-2">
                {formTexts.subject ?? 'Sujet'}
              </label>
              <input
                type="text"
                placeholder={formTexts.subject ?? 'Sujet de votre message'}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-primary/10 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground dark:text-slate-100 placeholder:text-foreground/50 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary/30 dark:focus:border-primary/50 transition-colors"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-foreground dark:text-slate-100 mb-2">
                {formTexts.message ?? 'Message'}
              </label>
              <textarea
                placeholder={formTexts.message ?? 'Votre message...'}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-primary/10 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground dark:text-slate-100 placeholder:text-foreground/50 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary/30 dark:focus:border-primary/50 transition-colors resize-none"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="w-full bg-gradient-to-r from-primary to-primary hover:shadow-lg transition-shadow text-white border-0">
                {formTexts.submit ?? 'Envoyer'} <Send className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
