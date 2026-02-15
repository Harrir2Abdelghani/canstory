'use client'

import { motion } from 'framer-motion'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { Star } from 'lucide-react'
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

export function TestimonialsPage() {
  const { t } = useLanguage()
  const testimonials = [
    {
      name: 'Fatima Benhadj',
      role: 'Patiente - Alger',
      location: 'Algérie',
      content: 'Canstory m\'a complètement transformée ma vie. Pendant mon traitement du cancer du sein, j\'ai trouvé non seulement des informations fiables mais aussi une communauté extraordinaire de femmes qui comprennent exactement ce que je traversais. Le soutien émotionnel que j\'ai reçu a été aussi important que le traitement médical lui-même.',
      rating: 5,
      image: '👩‍⚕️',
    },
    {
      name: 'Mohamed Kassab',
      role: 'Aidant & Membre Actif',
      location: 'Oran',
      content: 'En tant que mari d\'une patiente atteinte de cancer, j\'ai utilisé Canstory pour mieux comprendre la condition de ma femme et trouver des moyens de la soutenir. Les articles sont clairs, précis et vraiment utiles. La communauté m\'a donné la force de continuer.',
      rating: 5,
      image: '👨‍💼',
    },
    {
      name: 'Aïcha Saïdi',
      role: 'Soignante Professionnelle',
      location: 'Constantine',
      content: 'En tant qu\'infirmière, je recommande Canstory à tous mes patients. L\'application offre des informations médicales précises et à jour, et elle comble vraiment l\'écart dans les ressources de santé disponibles en Algérie.',
      rating: 5,
      image: '👩‍⚕️',
    },
    {
      name: 'Ahmed Djamel',
      role: 'Survivant - 3 ans libre de cancer',
      location: 'Tlemcen',
      content: 'Après ma rémission, je suis resté actif dans la communauté Canstory pour aider d\'autres patients. C\'est incroyable de voir comment cette plateforme crée de l\'espoir et de la solidarité. Je suis fier de faire partie de ce mouvement.',
      rating: 5,
      image: '👨‍🦱',
    },
    {
      name: 'Leila Amara',
      role: 'Patiente en Rémission',
      location: 'Béjaïa',
      content: 'Canstory a été mon compagnon constant pendant les moments les plus difficiles. Les forums m\'ont permis de me sentir moins seule et les articles m\'ont aidée à comprendre mon traitement. Je recommande cette application à tous les patients que je rencontre.',
      rating: 5,
      image: '👩‍🦰',
    },
    {
      name: 'Dr. Karim Belkaid',
      role: 'Oncologue',
      location: 'Alger',
      content: 'En tant que médecin, j\'apprécie la qualité des informations sur Canstory. C\'est une ressource précieuse pour mes patients et cela améliore vraiment leur compréhension de leur condition et de leur traitement.',
      rating: 5,
      image: '👨‍⚕️',
    },
  ]
  const statsSection = t.landing.stats ?? {}
  const stats = [
    {
      number: statsSection.members?.value ?? '50K+',
      label: statsSection.members?.label ?? 'Membres actifs',
    },
    {
      number: statsSection.articles?.value ?? '1000+',
      label: statsSection.articles?.label ?? 'Articles médicaux',
    },
    {
      number: statsSection.countries?.value ?? '150+',
      label: statsSection.countries?.label ?? 'Pays représentés',
    },
    {
      number: statsSection.satisfaction?.value ?? '98%',
      label: statsSection.satisfaction?.label ?? 'Satisfaction utilisateur',
    },
  ]

  return (
    <main className="w-full -mt-4 bg-background dark:bg-slate-950 text-foreground dark:text-slate-100 pt-20">
      <Header activeLink={t.navigation.testimonials} />

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
            {t.landing.testimonials.title}
          </motion.p>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-foreground dark:text-slate-100">
            <motion.span
              className="bg-gradient-to-r from-primary  to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {t.landing.testimonials.title}
            </motion.span>
          </h1>
          <p className="text-xl text-foreground/70 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            {t.landing.testimonials.subtitle}
          </p>
        </motion.div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative p-8 rounded-2xl border border-primary/10 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="relative mb-6">
                    <span className="absolute -top-1 -start-1 text-3xl text-primary/20 dark:text-primary/30 font-serif leading-none select-none">"</span>
                    <p className="text-foreground/80 dark:text-slate-300 leading-relaxed italic ps-5">
                      {testimonial.content}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-primary/10 dark:border-slate-700">
                    <div className="text-4xl">{testimonial.image}</div>
                    <div>
                      <p className="font-bold text-foreground dark:text-slate-100">{testimonial.name}</p>
                      <p className="text-sm text-foreground/60 dark:text-slate-500">{testimonial.role}</p>
                      <p className="text-xs text-primary dark:text-blue-400 font-semibold">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-foreground dark:text-slate-100">
              {statsSection.heading ?? 'Impact Mesurable'}
            </h2>
            {(statsSection.subtitle ?? '').length > 0 && (
              <p className="text-lg text-foreground/70 dark:text-slate-400">
                {statsSection.subtitle}
              </p>
            )}
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="text-center p-8 rounded-xl border border-primary/10 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary/30 dark:hover:border-primary/50 transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.number}
                </p>
                <p className="text-foreground/70 dark:text-slate-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
