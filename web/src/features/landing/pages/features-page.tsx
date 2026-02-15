'use client'

import { motion } from 'framer-motion'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import {
  Heart,
  BookOpen,
  Users,
  MessageCircle,
  Zap,
  Shield,
  Check,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export function FeaturesPage() {
  const { t } = useLanguage()
  const featureCards = [
    {
      icon: Heart,
      content: t.landing.features.emotionalSupport,
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: BookOpen,
      content: t.landing.features.reliableInfo,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      content: t.landing.features.activeComm,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: MessageCircle,
      content: t.landing.features.forums,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      content: t.landing.features.articles,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      content: t.landing.features.security,
      color: 'from-red-500 to-pink-500',
    },
  ]

  const benefitBullets = t.landing.features.bullets ?? []

  return (
    <main className="w-full -mt-4 bg-background dark:bg-slate-950 text-foreground dark:text-slate-100 pt-20">
      <Header activeLink={t.navigation.features} />

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
            {t.features.hero.title}
          </motion.p>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-foreground">
            <motion.span
              className="bg-gradient-to-r from-primary  to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {t.features.hero.subtitle}
            </motion.span>
          </h1>
          <p className="text-xl text-foreground/70 mb-8 leading-relaxed max-w-2xl mx-auto">
            {t.landing.features.description}
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {featureCards.map((feature, index) => {
              const Icon = feature.icon
              const content = feature.content
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative p-8 rounded-2xl border border-primary/10 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="relative">
                    <motion.div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3 text-foreground dark:text-slate-100">{content?.title}</h3>
                    <p className="text-foreground/70 dark:text-slate-400 mb-4 leading-relaxed">{content?.description}</p>
                    <p className="text-sm font-semibold text-primary dark:text-blue-400">{content?.details}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground dark:text-slate-100">
              {t.landing.benefits.title}
            </h2>
            <p className="text-lg text-foreground/70 dark:text-slate-400">
              {t.landing.benefits.subtitle}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {benefitBullets.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-4 p-6 rounded-xl border border-primary/10 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary/30 dark:hover:border-primary/50 transition-all"
                whileHover={{ x: 5 }}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-medium text-foreground dark:text-slate-100">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          {...fadeUp}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground dark:text-slate-100">
            {t.landing.cta.title}
          </h2>
          <p className="text-xl text-foreground/70 dark:text-slate-400 mb-8">
            {t.landing.cta.subtitle}
          </p>
          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="  hover:shadow-lg transition-shadow text-white border-0">
                {t.landing.cta.button} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="hover:shadow-lg transition-shadow">
                {t.landing.cta.secondaryButton}
              </Button>
            </motion.div>
          </motion.div>
          <p className="text-sm text-foreground/60 dark:text-slate-500 mt-6">
            {t.landing.cta.tagline}
          </p>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
