import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Menu, X, Moon, Sun, Heart, Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import { toast } from 'sonner'

export function Contact() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'À Propos', href: '/about' },
    { name: 'Fonctionnalités', href: '/features' },
    { name: 'Contact', href: '/contact' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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
                Admin
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
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32'>
        <div className='text-center space-y-6 animate-in fade-in slide-in-from-bottom duration-1000'>
          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight'>
            Contactez <span className='text-primary'>Nous</span>
          </h1>
          <p className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
            Une question, une suggestion ou besoin d'aide ? Notre équipe est là pour vous répondre.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20'>
        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Contact Info Cards */}
          <div className='lg:col-span-1 space-y-6'>
            <Card className='border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 animate-in fade-in slide-in-from-left'>
              <CardHeader>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4'>
                  <Mail className='w-6 h-6 text-white' />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-base'>
                  contact@canstory.app
                </CardDescription>
                <CardDescription className='text-base mt-2'>
                  support@canstory.app
                </CardDescription>
              </CardContent>
            </Card>

            <Card className='border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 animate-in fade-in slide-in-from-left delay-100'>
              <CardHeader>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4'>
                  <Phone className='w-6 h-6 text-white' />
                </div>
                <CardTitle>Téléphone</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-base'>
                  +213 XXX XXX XXX
                </CardDescription>
                <CardDescription className='text-sm mt-2 text-muted-foreground'>
                  Lun - Ven : 9h00 - 17h00
                </CardDescription>
              </CardContent>
            </Card>

            <Card className='border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 animate-in fade-in slide-in-from-left delay-200'>
              <CardHeader>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4'>
                  <MapPin className='w-6 h-6 text-white' />
                </div>
                <CardTitle>Adresse</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-base'>
                  Alger, Algérie
                </CardDescription>
              </CardContent>
            </Card>

            <Card className='border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 animate-in fade-in slide-in-from-left delay-300'>
              <CardHeader>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4'>
                  <MessageSquare className='w-6 h-6 text-white' />
                </div>
                <CardTitle>Réseaux Sociaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <CardDescription className='text-base'>Facebook: @canstory</CardDescription>
                  <CardDescription className='text-base'>Instagram: @canstory_dz</CardDescription>
                  <CardDescription className='text-base'>Twitter: @canstory</CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className='lg:col-span-2 animate-in fade-in slide-in-from-right duration-1000'>
            <Card className='border-border/40'>
              <CardHeader>
                <CardTitle className='text-2xl'>Envoyez-nous un message</CardTitle>
                <CardDescription className='text-base'>
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='name'>Nom complet *</Label>
                      <Input
                        id='name'
                        name='name'
                        placeholder='Votre nom'
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className='h-11'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email *</Label>
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        placeholder='votre.email@exemple.com'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className='h-11'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='subject'>Sujet *</Label>
                    <Input
                      id='subject'
                      name='subject'
                      placeholder='Objet de votre message'
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className='h-11'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='message'>Message *</Label>
                    <Textarea
                      id='message'
                      name='message'
                      placeholder='Écrivez votre message ici...'
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={8}
                      className='resize-none'
                    />
                  </div>

                  <Button
                    type='submit'
                    size='lg'
                    className='w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 group'
                  >
                    <Send className='w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform' />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            Questions Fréquentes
          </h2>
          <p className='text-lg text-muted-foreground'>
            Trouvez rapidement des réponses à vos questions
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          {[
            {
              q: 'Canstory est-elle vraiment gratuite ?',
              a: 'Oui, Canstory est 100% gratuite pour tous les utilisateurs. Notre mission est de rendre l\'information accessible à tous les patients.',
            },
            {
              q: 'Sur quelles plateformes est disponible Canstory ?',
              a: 'Canstory est disponible sur Android et iOS. Vous pouvez télécharger l\'application depuis Google Play Store et Apple App Store.',
            },
            {
              q: 'Comment puis-je contribuer en tant que professionnel de santé ?',
              a: 'Les professionnels de santé peuvent créer un compte et publier des articles dans le module Khibrati après validation par notre équipe.',
            },
            {
              q: 'Les informations sont-elles vérifiées ?',
              a: 'Oui, toutes les informations médicales sont vérifiées et validées par des professionnels de santé qualifiés avant publication.',
            },
          ].map((faq, index) => (
            <Card
              key={index}
              className='border-border/40 hover:border-primary/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <CardTitle className='text-lg'>{faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-base leading-relaxed'>
                  {faq.a}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
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
