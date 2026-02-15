import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Menu, X, Moon, Sun, Heart, Target, Users, Globe, Shield, Sparkles, ArrowRight } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import { useLanguage } from '@/context/language-provider'
import { LanguageSwitch } from '@/components/language-switch'

export function About() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: t.navigation.home, href: '/' },
    { name: t.navigation.about, href: '/about' },
    { name: t.navigation.features, href: '/features' },
    { name: t.navigation.contact, href: '/contact' },
  ]

  const values = [
    {
      icon: Heart,
      title: t.about.values.solidarity.title,
      description: t.about.values.solidarity.description,
    },
    {
      icon: Shield,
      title: t.about.values.reliability.title,
      description: t.about.values.reliability.description,
    },
    {
      icon: Globe,
      title: t.about.values.accessibility.title,
      description: t.about.values.accessibility.description,
    },
    {
      icon: Users,
      title: t.about.values.community.title,
      description: t.about.values.community.description,
    },
  ]

  const objectives = [
    t.about.objectives.obj1,
    t.about.objectives.obj2,
    t.about.objectives.obj3,
    t.about.objectives.obj4,
    t.about.objectives.obj5,
    t.about.objectives.obj6,
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-primary/5'>
      {/* Navigation */}
      <nav className='border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate({ to: '/' })}>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg'>
                <Heart className='w-6 h-6 text-primary-foreground' />
              </div>
              <span className='text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                Canstory
              </span>
            </div>

            <div className='hidden md:flex items-center gap-8'>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
                >
                  {link.name}
                </Link>
              ))}
              
              <LanguageSwitch />

              <Button
                variant='ghost'
                size='icon'
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className='rounded-full'
              >
                {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
              </Button>

              <Button
                onClick={() => navigate({ to: '/sign-in' })}
                className='bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25'
              >
                {t.common.admin}
              </Button>
            </div>

            <div className='md:hidden flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className='rounded-full'
              >
                {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className='md:hidden py-4 space-y-2 animate-in slide-in-from-top'>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className='block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className='px-4 pt-2'>
                <Button
                  onClick={() => {
                    navigate({ to: '/sign-in' })
                    setMobileMenuOpen(false)
                  }}
                  className='w-full bg-primary hover:bg-primary/90'
                >
                  Admin
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32'>
        <div className='absolute inset-0 -z-10'>
          <div className='absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse' />
          <div className='absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000' />
        </div>

        <div className='text-center space-y-6 animate-in fade-in slide-in-from-bottom duration-1000'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4'>
            <Sparkles className='w-4 h-4' />
            À propos de Canstory
          </div>

          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight'>
            Notre <span className='text-primary'>Vision</span> et{' '}
            <span className='text-primary'>Mission</span>
          </h1>

          <p className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
            Canstory est née d'une volonté de faciliter le parcours de soins des patients atteints de cancer en Algérie
            en centralisant toutes les ressources essentielles en un seul endroit accessible.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <div className='space-y-6 animate-in fade-in slide-in-from-left duration-1000'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary'>
              <Target className='w-4 h-4' />
              Notre Vision
            </div>
            <h2 className='text-3xl md:text-4xl font-bold text-foreground'>
              Une plateforme d'information complète et accessible
            </h2>
            <p className='text-lg text-muted-foreground leading-relaxed'>
              Canstory est une plateforme d'information destinée aux patients atteints de cancer en Algérie,
              regroupant toutes les ressources utiles en un seul endroit accessible. Notre vision est de devenir
              la référence pour tous les patients et leurs familles dans leur parcours de soins.
            </p>
            <p className='text-lg text-muted-foreground leading-relaxed'>
              Nous croyons que l'accès à l'information et aux ressources est un droit fondamental pour tous les patients,
              et nous nous engageons à rendre cette information facilement accessible, fiable et actualisée.
            </p>
          </div>

          <div className='relative animate-in fade-in slide-in-from-right duration-1000'>
            <div className='aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-12 flex items-center justify-center'>
              <div className='text-center space-y-6'>
                <div className='w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-2xl'>
                  <Heart className='w-16 h-16 text-primary-foreground' />
                </div>
                <p className='text-2xl font-bold text-foreground'>
                  Ensemble pour un meilleur accès aux soins
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            Nos Objectifs
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Six objectifs principaux guident notre action quotidienne
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {objectives.map((objective, index) => (
            <Card
              key={index}
              className='border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 animate-in fade-in slide-in-from-bottom'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className='w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4'>
                  <span className='text-2xl font-bold text-primary'>{index + 1}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-base text-muted-foreground leading-relaxed'>{objective}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            Nos Valeurs
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Les principes qui guident notre action au quotidien
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <Card
                key={index}
                className='text-center border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-in fade-in zoom-in'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-lg'>
                    <Icon className='w-8 h-8 text-primary-foreground' />
                  </div>
                  <CardTitle className='text-xl'>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-base leading-relaxed'>
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 md:p-16 text-center'>
          <div className='absolute inset-0 bg-grid-white/10' />
          <div className='relative z-10 space-y-6'>
            <h2 className='text-3xl md:text-4xl font-bold text-primary-foreground'>
              Rejoignez notre communauté
            </h2>
            <p className='text-lg text-primary-foreground/90 max-w-2xl mx-auto'>
              Téléchargez Canstory et accédez à toutes les ressources pour vous accompagner dans votre parcours de soins.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center pt-4'>
              <Button
                size='lg'
                variant='secondary'
                className='text-lg shadow-xl'
                onClick={() => navigate({ to: '/' })}
              >
                Découvrir l'application
                <ArrowRight className='w-5 h-5 ml-2' />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-border/40 bg-background/50 mt-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='text-center text-muted-foreground'>
            <p>&copy; 2026 Canstory. Tous droits réservés. Fait avec <Heart className='w-4 h-4 inline text-primary' /> pour les patients en Algérie.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
