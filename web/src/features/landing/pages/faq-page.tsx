'use client'

import { motion } from 'framer-motion'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
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

export function FAQPage() {
  const { t } = useLanguage()
  const faqs = [
    {
      question: 'Est-ce que Canstory est vraiment gratuit ?',
      answer: 'Oui, Canstory est entièrement gratuit pour tous les utilisateurs en Algérie et dans le monde. Nous croyons que l\'accès à l\'information médicale ne devrait pas dépendre de la capacité financière. Aucun frais caché, aucune publicité, aucune limite.',
    },
    {
      question: 'Mes données personnelles et médicales sont-elles vraiment sécurisées ?',
      answer: 'Absolument. Nous utilisons le chiffrement AES-256 de bout en bout, sommes conformes au RGPD, et nos serveurs sont hébergés dans des datacenters sécurisés. Vos données ne seront jamais vendues ou partagées à des tiers sans votre consentement explicite.',
    },
    {
      question: 'Comment puis-je accéder à Canstory ?',
      answer: 'Vous pouvez télécharger l\'application depuis l\'App Store (iOS) ou Google Play (Android). L\'inscription prend moins de 2 minutes. Vous pouvez également accéder à la plateforme web sur www.canstory.app depuis n\'importe quel ordinateur.',
    },
    {
      question: 'Y a-t-il une limite d\'accès au contenu ou aux forums ?',
      answer: 'Non, vous avez accès illimité à tous nos articles, ressources, forums communautaires, guides et outils de suivi. Aucune limite, aucune restriction. L\'accès à l\'information est un droit fondamental.',
    },
    {
      question: 'Puis-je rester complètement anonyme sur la plateforme ?',
      answer: 'Oui, vous pouvez utiliser un pseudonyme complètement anonyme dans les forums et discussions. Votre identité réelle reste complètement privée et n\'est jamais révélée à moins que vous ne le souhaitiez.',
    },
    {
      question: 'Qui modère les contenus des utilisateurs et comment ?',
      answer: 'Notre équipe dédiée composée de professionnels médicaux, psychologues et modérateurs vérifies régulièrement tous les contenus pour assurer la qualité, l\'exactitude médicale et l\'atmosphère de respect et de bienveillance.',
    },
    {
      question: 'Quels types de cancer sont couverts dans l\'application ?',
      answer: 'Nous couvrons les cancers les plus courants comme le sein, le poumon, la prostate, le côlon, la peau et le foie, avec des ressources complètes pour chacun. Nous ajoutons régulièrement de nouveaux types et mise à jour du contenu.',
    },
    {
      question: 'L\'application fonctionne-t-elle hors ligne ?',
      answer: 'Oui, vous pouvez télécharger les articles pour les lire hors ligne. Cependant, les forums et les discussions en temps réel nécessitent une connexion internet active.',
    },
  ]

  return (
    <main className="w-full bg-background -mt-4 dark:bg-slate-950 text-foreground dark:text-slate-100 pt-20">
      <Header activeLink={t.navigation.faq} />

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
            {t.navigation.faq}
          </motion.p>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-foreground dark:text-slate-100">
            <motion.span
              className="bg-gradient-to-r from-primary  to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {t.navigation.faq}
            </motion.span>
          </h1>
          <p className="text-xl text-foreground/70 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            {t.landing.cta.subtitle}
          </p>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                >
                  <AccordionItem 
                    value={`item-${index}`} 
                    className="border border-primary/10 dark:border-slate-700 px-6 rounded-xl data-[state=open]:border-primary/30 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 data-[state=open]:bg-gradient-to-r data-[state=open]:from-primary/10 data-[state=open]:to-accent/10 dark:data-[state=open]:from-primary/20 dark:data-[state=open]:to-accent/20 transition-all duration-300"
                  >
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
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
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
          <motion.a
            href="/contact"
            className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-primary text-white font-semibold hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t.navigation.contact}
          </motion.a>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
