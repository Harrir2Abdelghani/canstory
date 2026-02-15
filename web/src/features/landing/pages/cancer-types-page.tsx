'use client'

import { motion } from 'framer-motion'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { Heart, Activity, Target, Zap, Brain, Flame } from 'lucide-react'
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

export function CancerTypesPage() {
  const { t } = useLanguage()
  const cancerSection = t.landing.cancerTypes ?? {}
  const cancerEntries = cancerSection.items ?? {}
  const labels = cancerSection.labels ?? {
    patients: 'Patients',
    resources: 'Resources',
    survivors: 'Survivors',
  }
  const cancerTypes = [
    {
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      data: cancerEntries.breast,
    },
    {
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      data: cancerEntries.lung,
    },
    {
      icon: Target,
      color: 'from-purple-500 to-indigo-500',
      data: cancerEntries.prostate,
    },
    {
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      data: cancerEntries.colon,
    },
    {
      icon: Brain,
      color: 'from-indigo-500 to-purple-500',
      data: cancerEntries.skin,
    },
    {
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      data: cancerEntries.liver,
    },
  ]

  const infoHighlights = cancerSection.info ?? []
  const heroTitle = cancerSection.title ?? t.navigation.cancerTypes
  const heroSubtitle = cancerSection.subtitle ?? cancerSection.description ?? ''

  return (
    <main className="w-full -mt-4 bg-background dark:bg-slate-950 text-foreground dark:text-slate-100 pt-20">
      <Header activeLink={t.navigation.cancerTypes} />

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
            {t.navigation.cancerTypes}
          </motion.p>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-foreground dark:text-slate-100">
            <motion.span
              className="bg-gradient-to-r from-primary  to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {heroTitle}
            </motion.span>
          </h1>
          <p className="text-xl text-foreground/70 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            {heroSubtitle || cancerSection.description || ''}
          </p>
        </motion.div>
      </section>

      {/* Cancer Types Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {cancerTypes.map((cancer, index) => {
              const Icon = cancer.icon
              const data = cancer.data
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative p-8 rounded-2xl border border-primary/10 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cancer.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="relative">
                    <motion.div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cancer.color} flex items-center justify-center mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-slate-100">{data?.name}</h3>
                    <p className="text-foreground/70 dark:text-slate-400 mb-6 leading-relaxed">{data?.description}</p>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary/10 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-semibold text-primary dark:text-blue-400">{data?.patients}</p>
                        <p className="text-xs text-foreground/60 dark:text-slate-500">{labels.patients}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary dark:text-blue-400">{data?.resources}</p>
                        <p className="text-xs text-foreground/60 dark:text-slate-500">{labels.resources}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary dark:text-blue-400">{data?.survivors}</p>
                        <p className="text-xs text-foreground/60 dark:text-slate-500">{labels.survivors}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground dark:text-slate-100">
              {t.landing.stats.heading}
            </h2>
            <p className="text-lg text-foreground/70 dark:text-slate-400">
              {t.landing.stats.subtitle}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {infoHighlights.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-8 rounded-xl border border-primary/10 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary/30 dark:hover:border-primary/50 transition-all"
                whileHover={{ x: 5 }}
              >
                <h3 className="text-xl font-bold mb-3 text-foreground dark:text-slate-100">{item.title}</h3>
                <p className="text-foreground/70 dark:text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
