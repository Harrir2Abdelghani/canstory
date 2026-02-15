'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language-provider'
import { Footer } from './components/footer'
import { Header } from './components/header'
import { AnimatedBackground } from './components/animated-background'
import {
  Heart,
  BookOpen,
  Users,
  MessageCircle,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Globe,
  Sun,
  Check,
  Award,
  Lightbulb,
  Activity,
  Target,
  Star,
  ArrowRight,
  MapPin,
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const springTransition = { type: 'spring' as const, stiffness: 100, damping: 20 }

const slideFromLeft = {
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  transition: springTransition,
  viewport: { once: true, margin: '-80px' },
}

const slideFromRight = {
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
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

export function Landing() {
  const { t, isRTL } = useLanguage()

  const features = [
    {
      icon: Heart,
      title: t.landing.features.emotionalSupport.title,
      description: t.landing.features.emotionalSupport.description,
      details: t.landing.features.emotionalSupport.details,
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: BookOpen,
      title: t.landing.features.reliableInfo.title,
      description: t.landing.features.reliableInfo.description,
      details: t.landing.features.reliableInfo.details,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: t.landing.features.activeComm.title,
      description: t.landing.features.activeComm.description,
      details: t.landing.features.activeComm.details,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: MessageCircle,
      title: t.landing.features.forums.title,
      description: t.landing.features.forums.description,
      details: t.landing.features.forums.details,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: t.landing.features.articles.title,
      description: t.landing.features.articles.description,
      details: t.landing.features.articles.details,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: t.landing.features.security.title,
      description: t.landing.features.security.description,
      details: t.landing.features.security.details,
      color: 'from-red-500 to-pink-500',
    },
  ]

  const cancerTypes = [
    {
      icon: Heart,
      name: t.landing.cancerTypes.items.breast.name || 'Breast Cancer',
      patients: t.landing.cancerTypes.items.breast.patients || '0',
      resources: t.landing.cancerTypes.items.breast.resources || '0',
      survivors: t.landing.cancerTypes.items.breast.survivors || '0',
    },
    {
      icon: Activity,
      name: t.landing.cancerTypes.items.lung.name || 'Lung Cancer',
      patients: t.landing.cancerTypes.items.lung.patients || '0',
      resources: t.landing.cancerTypes.items.lung.resources || '0',
      survivors: t.landing.cancerTypes.items.lung.survivors || '0',
    },
    {
      icon: Target,
      name: t.landing.cancerTypes.items.prostate.name || 'Prostate Cancer',
      patients: t.landing.cancerTypes.items.prostate.patients || '0',
      resources: t.landing.cancerTypes.items.prostate.resources || '0',
      survivors: t.landing.cancerTypes.items.prostate.survivors || '0',
    },
    {
      icon: Lightbulb,
      name: t.landing.cancerTypes.items.colon.name || 'Colon Cancer',
      patients: t.landing.cancerTypes.items.colon.patients || '0',
      resources: t.landing.cancerTypes.items.colon.resources || '0',
      survivors: t.landing.cancerTypes.items.colon.survivors || '0',
    },
    {
      icon: Sun,
      name: t.landing.cancerTypes.items.skin.name || 'Skin Cancer',
      patients: t.landing.cancerTypes.items.skin.patients || '0',
      resources: t.landing.cancerTypes.items.skin.resources || '0',
      survivors: t.landing.cancerTypes.items.skin.survivors || '0',
    },
    {
      icon: Award,
      name: t.landing.cancerTypes.items.liver.name || 'Liver Cancer',
      patients: t.landing.cancerTypes.items.liver.patients || '0',
      resources: t.landing.cancerTypes.items.liver.resources || '0',
      survivors: t.landing.cancerTypes.items.liver.survivors || '0',
    },
  ]

  const benefits = [
    {
      icon: TrendingUp,
      title: t.landing.benefits.qualityOfLife.title,
      description: t.landing.benefits.qualityOfLife.description,
      stat: t.landing.benefits.qualityOfLife.stat,
      statLabel: t.landing.benefits.qualityOfLife.statLabel,
    },
    {
      icon: Clock,
      title: t.landing.benefits.instantAccess.title,
      description: t.landing.benefits.instantAccess.description,
      stat: t.landing.benefits.instantAccess.stat,
      statLabel: t.landing.benefits.instantAccess.statLabel,
    },
    {
      icon: Globe,
      title: t.landing.benefits.globalReach.title,
      description: t.landing.benefits.globalReach.description,
      stat: t.landing.benefits.globalReach.stat,
      statLabel: t.landing.benefits.globalReach.statLabel,
    },
  ]

  const steps = [
    {
      number: t.landing.steps.download.number,
      title: t.landing.steps.download.title,
      description: t.landing.steps.download.description,
      details: t.landing.steps.download.details,
    },
    {
      number: t.landing.steps.createAccount.number,
      title: t.landing.steps.createAccount.title,
      description: t.landing.steps.createAccount.description,
      details: t.landing.steps.createAccount.details,
    },
    {
      number: t.landing.steps.joinCommunity.number,
      title: t.landing.steps.joinCommunity.title,
      description: t.landing.steps.joinCommunity.description,
      details: t.landing.steps.joinCommunity.details,
    },
    {
      number: t.landing.steps.tracking.number,
      title: t.landing.steps.tracking.title,
      description: t.landing.steps.tracking.description,
      details: t.landing.steps.tracking.details,
    },
  ]

  const testimonialEntries = t.testimonials?.items ?? {}
  const testimonials = [
    {
      ...testimonialEntries.fatima,
      rating: 5,
      image: '👩‍⚕️',
    },
    {
      ...testimonialEntries.mohamed,
      rating: 5,
      image: '👨‍💼',
    },
    {
      ...testimonialEntries.aicha,
      rating: 5,
      image: '👩‍⚕️',
    },
    {
      ...testimonialEntries.ahmed,
      rating: 5,
      image: '👨‍🦱',
    },
  ]

  const faqs = [
    {
      question: t.landing.faqs.q1,
      answer: t.landing.faqs.a1,
    },
    {
      question: t.landing.faqs.q2,
      answer: t.landing.faqs.a2,
    },
    {
      question: t.landing.faqs.q3,
      answer: t.landing.faqs.a3,
    },
    {
      question: t.landing.faqs.q4,
      answer: t.landing.faqs.a4,
    },
    {
      question: t.landing.faqs.q5,
      answer: t.landing.faqs.a5,
    },
    {
      question: t.landing.faqs.q6,
      answer: t.landing.faqs.a6,
    },
    {
      question: t.landing.faqs.q7,
      answer: t.landing.faqs.a7,
    },
    {
      question: t.landing.faqs.q8,
      answer: t.landing.faqs.a8,
    },
  ]

  const stats = [
    {
      icon: Users,
      ...t.landing.stats.members,
    },
    {
      icon: BookOpen,
      ...t.landing.stats.articles,
    },
    {
      icon: Globe,
      ...t.landing.stats.countries,
    },
    {
      icon: Star,
      ...t.landing.stats.rating,
    },
  ]

  const heroCards = {
    primary: {
      title: t.landing.hero.cards.primary.title,
      subtitle: t.landing.hero.cards.primary.subtitle,
    },
    secondary: {
      title: t.landing.hero.cards.secondary.title,
      subtitle: t.landing.hero.cards.secondary.subtitle,
    },
  }

  return (
    <main className="w-full bg-background dark:bg-slate-950 text-foreground dark:text-slate-100">
      {/* Enhanced Header Component */}
      <Header activeLink={t.navigation.home} />

      {/* Hero Section */}
      <section id="home" className={`min-h-screen flex items-center justify-center pt-16 ps-6 pe-8 md:ps-8 md:pe-16 lg:pe-24 relative overflow-x-hidden overflow-y-auto bg-gradient-to-b from-white dark:from-slate-950 to-white/50 dark:to-slate-900/50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Animated Background */}
        <AnimatedBackground variant="hero" showParticles showOrbs />

        <div className="max-w-7xl mx-auto mt-6 w-full grid md:grid-cols-2 gap-20 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            {...slideFromLeft}
          >
            <motion.p
              className="text-sm font-semibold text-primary uppercase tracking-wider mb-4"
              variants={itemVariants}
            >
              {t.landing.hero.title}
            </motion.p>

            <h1 className="text-xl md:text-2xl lg:text-5xl font-black leading-tight mb-6 text-foreground dark:text-slate-100">
              <motion.span
                className="bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent inline-block"
                style={{
                  backgroundSize: '200% auto',
                }}
                animate={{
                  backgroundPosition: ['0% center', '200% center', '0% center'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {t.landing.hero.heading}
              </motion.span>
            </h1>

            <p className="text-xl text-foreground/70 dark:text-slate-400 mb-8 leading-relaxed max-w-lg">
              {t.landing.hero.subtitle}
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-lg blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-500"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                />
                <Button className="relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 text-white border-0">
                  <span className="relative z-10">{t.landing.hero.cta}</span>
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: 'easeInOut',
                    }}
                  />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <Button
                  variant="outline"
                  className="relative overflow-hidden hover:shadow-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 border-2"
                >
                  <span className="relative z-10">{t.landing.hero.ctaSecondary}</span>
                  {/* Gradient border animation */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(125, 90, 180, 0.1), transparent)',
                    }}
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}

            <motion.section
              className="w-full mt-16 md:mt-24 flex justify-center overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col items-center w-full max-w-4xl">
                {/* separator */}
                <div className="w-full max-w-3xl h-px bg-primary/20 dark:bg-primary/10 mb-8 md:mb-10" />

                {/* stats - 2x2 grid on mobile, row on larger screens */}
                <div className="grid grid-cols-2 md:flex md:flex-row gap-6 md:gap-10 lg:gap-14 w-full md:w-auto md:flex-wrap md:justify-center text-center">
                  <div className="min-w-0 px-1">
                    <p className="text-2xl md:text-3xl font-bold text-primary dark:text-blue-400">{stats[0].value}</p>
                    <p className="text-xs md:text-sm opacity-60 dark:opacity-50 dark:text-slate-400">{stats[0].label}</p>
                  </div>

                  <div className="min-w-0 px-1">
                    <p className="text-2xl md:text-3xl font-bold text-primary dark:text-blue-400">{stats[1].value}</p>
                    <p className="text-xs md:text-sm opacity-60 dark:opacity-50 dark:text-slate-400">{stats[1].label}</p>
                  </div>

                  <div className="min-w-0 px-1">
                    <p className="text-2xl md:text-3xl font-bold text-primary dark:text-blue-400">{stats[2].value}</p>
                    <p className="text-xs md:text-sm opacity-60 dark:opacity-50 dark:text-slate-400">{stats[2].label}</p>
                  </div>

                  <div className="min-w-0 px-1">
                    <p className="text-2xl md:text-3xl font-bold text-primary dark:text-blue-400">{stats[3].value}</p>
                    <p className="text-xs md:text-sm opacity-60 dark:opacity-50 dark:text-slate-400">{stats[3].label}</p>
                  </div>
                </div>
              </div>
            </motion.section>

          </motion.div>

          {/* Right - Phone Screens */}
          <motion.div
            className="relative hidden md:flex -mt-16 -mr-30 lg:-mt-24 justify-center items-center overflow-visible ps-4"
            {...slideFromRight}
          >
            <div className="relative w-full max-w-md perspective min-h-[22rem]">
              {/* Phone 1 */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-56 h-72 lg:w-64 lg:h-80 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl border-8 border-white/80 dark:border-slate-700 flex items-center justify-center overflow-hidden left-0"
                animate={{ y: [0, -20, 0], rotate: [-5, 0, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-center text-white">
                  <Heart className="w-12 h-12 mx-auto mb-2 animate-pulse" fill="white" />
                  <p className="text-sm font-semibold">{heroCards.primary.title}</p>
                  <p className="text-xs opacity-70">{heroCards.primary.subtitle}</p>
                </div>
              </motion.div>

              {/* Phone 2 */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-56 h-72 lg:w-64 lg:h-80 bg-gradient-to-br from-accent to-primary rounded-3xl shadow-2xl border-8 border-white/80 flex items-center justify-center overflow-hidden left-16 lg:left-20"
                animate={{ y: [0, 20, 0], rotate: [5, 0, 5] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              >
                <div className="text-center text-white">
                  <Users className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm font-semibold">{heroCards.secondary.title}</p>
                  <p className="text-xs opacity-70">{heroCards.secondary.subtitle}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-transparent via-primary/5 to-transparent dark:via-primary/10 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">{t.landing.features.title}</p>
            <h2 className="text-5xl font-black mb-6 text-foreground">
              {t.landing.features.subtitle}
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              {t.landing.features.description}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  {...(index % 2 === 0 ? slideFromLeft : slideFromRight)}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px -12px rgba(88, 28, 135, 0.2)', scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-primary/10 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/50 transition-colors duration-300 group cursor-pointer"
                >
                  <motion.div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    whileHover={{ rotate: 10 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 text-foreground dark:text-slate-100">{feature.title}</h3>
                  <p className="text-foreground/70 dark:text-slate-400 mb-4 leading-relaxed">{feature.description}</p>
                  <motion.p className="text-sm font-semibold text-primary dark:text-blue-400 flex items-center gap-2">
                    <Check className="w-4 h-4" /> {feature.details}
                  </motion.p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/30" />

      {/* Cancer Types Section */}
      <section id="cancer" className="py-24 px-6 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">{t.landing.cancerTypes.title}</p>
            <h2 className="text-5xl font-black mb-6 text-foreground dark:text-slate-100">
              {t.landing.cancerTypes.subtitle}
            </h2>
            <p className="text-xl text-foreground/70 dark:text-slate-400 max-w-2xl mx-auto">
              {t.landing.cancerTypes.subtitle}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {cancerTypes.map((type, index) => {
              const Icon = type.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  {...(index % 2 === 0 ? slideFromLeft : slideFromRight)}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px -12px rgba(88, 28, 135, 0.2)', scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-primary/10 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/50 transition-colors duration-300 group"
                >
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center mb-4 group-hover:bg-primary/30"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <Icon className="w-6 h-6 text-primary dark:text-blue-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground dark:text-slate-100">{type.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-primary/10 dark:border-slate-700">
                      <span className="text-foreground/70 dark:text-slate-400">Patients</span>
                      <span className="font-bold text-primary dark:text-blue-400">{type.patients}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-primary/10 dark:border-slate-700">
                      <span className="text-foreground/70 dark:text-slate-400">Ressources</span>
                      <span className="font-bold text-primary dark:text-blue-400">{type.resources}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/70 dark:text-slate-400">Survivants</span>
                      <span className="font-bold text-primary dark:text-blue-400">{type.survivors}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">{t.landing.benefits.title}</p>
            <h2 className="text-5xl font-black mb-6 text-foreground">
              {t.landing.benefits.title}
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              {t.landing.benefits.title}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  {...(index % 2 === 0 ? slideFromLeft : slideFromRight)}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px -12px rgba(88, 28, 135, 0.2)', scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-colors duration-300 group"
                >
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: 10 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">{benefit.title}</h3>
                  <p className="text-foreground/70 mb-6 leading-relaxed">{benefit.description}</p>
                  <div className="pt-4 border-t border-primary/20">
                    <p className="text-2xl font-bold text-primary mb-1">{benefit.stat}</p>
                    <p className="text-sm text-foreground/70">{benefit.statLabel}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-primary/5 to-transparent dark:via-primary/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">{t.landing.steps.title}</p>
            <h2 className="text-5xl font-black mb-6 text-foreground dark:text-slate-100">
              {t.landing.steps.title}
            </h2>
            <p className="text-xl text-foreground/70 dark:text-slate-400 max-w-2xl mx-auto">
              {t.landing.steps.subtitle}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                {...(index % 2 === 0 ? slideFromLeft : slideFromRight)}
                whileHover={{ y: -8, boxShadow: '0 20px 40px -12px rgba(88, 28, 135, 0.2)', scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-primary/10 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/50 transition-colors duration-300 relative"
              >
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-primary shadow-lg z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <ArrowRight className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </motion.div>
                )}

                <motion.div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-lg mb-4"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {step.number}
                </motion.div>

                <h3 className="text-lg font-bold text-foreground dark:text-slate-100 mb-3">{step.title}</h3>
                <p className="text-foreground/70 dark:text-slate-400 mb-4 text-sm leading-relaxed">{step.description}</p>
                <motion.p className="text-xs font-semibold text-primary dark:text-blue-400 flex items-center gap-2">
                  <Check className="w-3 h-3" /> {step.details}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-background dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">{t.landing.testimonials.title}</p>
            <h2 className="text-5xl font-black mb-6 text-foreground dark:text-slate-100">
              {t.landing.testimonials.title}
            </h2>
            <p className="text-xl text-foreground/70 dark:text-slate-400 max-w-2xl mx-auto">
              {t.landing.testimonials.subtitle}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                {...(index % 2 === 0 ? slideFromLeft : slideFromRight)}
                whileHover={{ y: -8, boxShadow: '0 20px 40px -12px rgba(88, 28, 135, 0.2)', scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-primary/10 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/50 transition-colors duration-300"
              >
                <motion.div
                  className="flex gap-1 mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </motion.div>

                <div className="relative">
                  <span className="absolute -top-2 -start-2 text-4xl text-primary/20 dark:text-primary/30 font-serif leading-none select-none">"</span>
                  <p className="text-foreground dark:text-slate-100 mb-6 leading-relaxed text-lg ps-6">
                    {testimonial.content}
                  </p>
                </div>

                <div className="border-t border-primary/10 dark:border-slate-700 pt-4 flex items-center gap-3">
                  <div className="text-3xl">{testimonial.image}</div>
                  <div>
                    <p className="font-bold text-foreground dark:text-slate-100">{testimonial.name}</p>
                    <p className="text-sm text-foreground/70 dark:text-slate-400">{testimonial.role}</p>
                    <motion.p className="text-xs text-primary dark:text-blue-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {testimonial.location}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-gradient-to-b from-transparent via-primary/5 to-transparent dark:via-primary/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">{t.landing.faqs.title}</p>
            <h2 className="text-5xl font-black mb-6 text-foreground dark:text-slate-100">
              {t.landing.faqs.title}
            </h2>
            <p className="text-xl text-foreground/70 dark:text-slate-400 max-w-2xl mx-auto">
              {t.landing.faqs.subtitle}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  {...(index % 2 === 0 ? slideFromLeft : slideFromRight)}
                >
                  <AccordionItem value={`item-${index}`} className="border border-primary/10 dark:border-slate-700 px-6 rounded-xl data-[state=open]:border-primary/30 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 data-[state=open]:bg-gradient-to-r data-[state=open]:from-primary/10 data-[state=open]:to-accent/10 dark:data-[state=open]:from-primary/20 dark:data-[state=open]:to-accent/20 transition-all duration-300">
                    <AccordionTrigger className="text-lg font-bold text-foreground dark:text-slate-100 hover:text-primary dark:hover:text-blue-400 transition-colors py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/70 dark:text-slate-400 leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-background dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-primary/10 pointer-events-none" />
        <motion.div
          className="max-w-4xl mx-auto text-center relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div
            className="inline-block mb-8"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            viewport={{ once: true }}
          >
            <div className="px-6 py-2.5 rounded-full border border-primary/30 dark:border-primary/50 bg-primary/10 dark:bg-primary/20 shadow-sm">
              <p className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-widest">{t.landing.cta.title}</p>
            </div>
          </motion.div>

          <h2 className="text-5xl font-black mb-6 text-foreground dark:text-slate-100 leading-tight">
            {t.landing.cta.title}
          </h2>

          <p className="text-xl text-foreground/70 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.landing.cta.subtitle}
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className=" hover:shadow-lg transition-shadow text-white border-0">
              {t.landing.cta.button}
            </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className=" hover:shadow-lg transition-shadow text-white border-0">
              {t.landing.hero.ctaSecondary}
            </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-foreground/60 dark:text-slate-500"
          >
            Gratuit • Sans Publicités • Sécurisé • Pas de Limite
          </motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
