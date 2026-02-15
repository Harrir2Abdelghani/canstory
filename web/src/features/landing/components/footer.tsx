'use client'

import { motion } from 'framer-motion'
import { Heart, Send, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/context/language-provider'
import { useNavigate } from '@tanstack/react-router'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function Footer() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const footerLinks = [
    {
      title: t.landing.footer.quickLinks,
      links: [
        { label: t.navigation.features, href: '/features' },
        { label: t.navigation.cancerTypes, href: '/cancer-types' },
        { label: t.navigation.testimonials, href: '/testimonials' },
        { label: t.navigation.faq, href: '/faq' },
      ],
    },
    {
      title: t.landing.footer.resources,
      links: [
        { label: t.landing.footer.blog, href: '/blog' },
        { label: t.landing.footer.guide, href: '/guide' },
        { label: t.landing.footer.community, href: '/community' },
        { label: t.landing.footer.articles, href: '/articles' },
      ],
    },
    {
      title: t.landing.footer.company,
      links: [
        { label: t.navigation.about, href: '/about' },
        { label: t.landing.footer.careers, href: '/careers' },
        { label: t.landing.footer.press, href: '/press' },
        { label: t.navigation.contact, href: '/contact' },
      ],
    },
    {
      title: t.landing.footer.legal,
      links: [
        { label: t.landing.footer.terms, href: '/terms' },
        { label: t.landing.footer.privacy, href: '/privacy' },
        { label: t.landing.footer.cookies, href: '/cookies' },
        { label: t.landing.footer.legalNotice, href: '/legal-notice' },
      ],
    },
  ]

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-500' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-500' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-500' },
  ]

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setEmail('')
  }

  const handleNavigation = (href: string) => {
    navigate({ to: href as any })
  }

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black dark:from-slate-950 dark:via-black dark:to-black text-white py-20 px-6 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 to-purple-600/10 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '-10%', right: '10%' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          style={{ bottom: '-10%', left: '15%' }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Main Footer Content */}
        <motion.div
          className="grid md:grid-cols-6 gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-lg blur-xl opacity-50"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Heart className="w-7 h-7 fill-white text-white" />
                </div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                Canstory
              </span>
            </motion.div>
            
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              {t.about.mission.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <motion.a
                href="mailto:contact@canstory.com"
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors text-sm group"
                whileHover={{ x: 5 }}
              >
                <Mail className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span>contact@canstory.com</span>
              </motion.a>
              <motion.a
                href="tel:+213555123456"
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors text-sm group"
                whileHover={{ x: 5 }}
              >
                <Phone className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span>+213 555 123 456</span>
              </motion.a>
              <motion.div
                className="flex items-center gap-3 text-white/60 text-sm"
                whileHover={{ x: 5 }}
              >
                <MapPin className="w-4 h-4" />
                <span>Algiers, Algeria</span>
              </motion.div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className={`p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all ${social.color}`}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {footerLinks.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants} className="md:col-span-1">
              <h4 className="font-bold text-lg mb-6 text-white">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <motion.button
                      onClick={() => handleNavigation(link.href)}
                      className="text-white/70 hover:text-white transition-colors text-sm block"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.label}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Newsletter Section */}
        <motion.div
          className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3">{t.landing.footer.restInformed}</h3>
            <p className="text-white/70 mb-6 text-sm">
              Subscribe to our newsletter for the latest updates and resources
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t.landing.footer.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 backdrop-blur-sm"
              />
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Subscribe</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="border-t border-white/10 mb-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ originX: 0.5 }}
        />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-white/60 text-center md:text-left">
            © {new Date().getFullYear()} Canstory. {t.landing.footer.copyright} {t.landing.footer.designedWith}
          </p>
          
          <div className="flex gap-6 flex-wrap justify-center">
            {[
              { label: t.landing.footer.terms, href: '/terms' },
              { label: t.landing.footer.privacy, href: '/privacy' },
              { label: t.landing.footer.cookies, href: '/cookies' },
              { label: t.landing.footer.sitemap, href: '/sitemap' },
            ].map((link, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleNavigation(link.href)}
                className="text-sm text-white/60 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {link.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
