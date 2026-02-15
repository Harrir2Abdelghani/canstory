'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTheme } from '@/context/theme-provider'
import { useLanguage } from '@/context/language-provider'
import { LanguageSwitch } from '@/components/language-switch'
import { useCanstoryLogo } from '../hooks/use-canstory-logo'

interface HeaderProps {
  activeLink?: string
}

export function Header({ activeLink }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const logoSources = useCanstoryLogo()
  const { scrollY } = useScroll()

  // Transform values based on scroll
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.95)']
  )
  
  const headerBackgroundDark = useTransform(
    scrollY,
    [0, 100],
    ['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.95)']
  )

  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 0 0 0 rgba(0, 0, 0, 0)', '0 4px 20px 0 rgba(0, 0, 0, 0.1)']
  )

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: t.navigation.home, href: '/' },
    { label: t.navigation.features, href: '/features' },
    { label: t.navigation.cancerTypes, href: '/cancer-types' },
    { label: t.navigation.testimonials, href: '/testimonials' },
    { label: t.navigation.faq, href: '/faq' },
    { label: t.navigation.contact, href: '/contact' },
  ]

  const handleNavigation = (href: string) => {
    navigate({ to: href as any })
  }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-300"
      style={{
        backgroundColor: theme === 'dark' ? headerBackgroundDark : headerBackground,
        boxShadow: headerShadow,
        borderColor: scrolled ? 'rgba(125, 90, 180, 0.2)' : 'rgba(125, 90, 180, 0.1)',
      }}
    >
      {/* Animated gradient line at top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigation('/')}
        >
          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          <div className="relative h-10 w-10">
            <img
              src={logoSources.light}
              alt="Canstory logo"
              className="block h-full w-full object-contain dark:hidden"
            />
            <img
              src={logoSources.dark}
              alt="Canstory logo"
              className="hidden h-full w-full object-contain dark:block drop-shadow-[0_4px_16px_rgba(125,90,180,0.45)]"
              aria-hidden="true"
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent dark:from-white dark:to-purple-300">
            Canstory
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleNavigation(link.href)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                activeLink === link.label
                  ? 'text-primary'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {link.label}
              
              {/* Animated underline for active link */}
              {activeLink === link.label && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full"
                  layoutId="activeLink"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 bg-primary/5 rounded-lg -z-10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <LanguageSwitch />

          {/* Theme Toggle */}
          <motion.button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="relative p-2 rounded-lg hover:bg-primary/10 transition-colors overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-xl"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground relative z-10" />
              ) : (
                <Sun className="w-5 h-5 text-foreground relative z-10" />
              )}
            </motion.div>
          </motion.button>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Navigation */}
      <motion.nav
        className="md:hidden overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-primary/10"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isMenuOpen ? 'auto' : 0,
          opacity: isMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="px-6 py-4 space-y-2">
          {navLinks.map((link, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                handleNavigation(link.href)
                setIsMenuOpen(false)
              }}
              className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${
                activeLink === link.label
                  ? 'bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border border-primary/20'
                  : 'text-foreground/70 hover:bg-primary/5 border border-transparent'
              }`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 5 }}
            >
              {link.label}
            </motion.button>
          ))}
        </div>
      </motion.nav>
    </motion.header>
  )
}
