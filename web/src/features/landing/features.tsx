import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Menu, X, Moon, Sun, Heart, BookText, Utensils, Phone, Users, FileText, Home, Info, Check, Download, Search, Filter, Star, Bell, Share2, Bookmark } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'

export function Features() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'À Propos', href: '/about' },
    { name: 'Fonctionnalités', href: '/features' },
    { name: 'Contact', href: '/contact' },
  ]

  const modules = [
    {
      id: 'i3lam',
      icon: BookText,
      title: 'I3lam - إعلام',
      subtitle: 'Actualités',
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Section d\'articles informatifs sur le cancer, gérée par l\'administration. Restez informé des dernières actualités, recherches et témoignages.',
      features: [
        'Affichage d\'articles informatifs avec photo, titre et date',
        'Filtrage par catégories (prévention, traitement, témoignages)',
        'Barre de recherche par titre ou mot-clé',
        'Tri par date (récent) ou par popularité',
        'Fiche article complète avec images et contenu riche',
        'Système de favoris pour sauvegarder les articles',
        'Partage via réseaux sociaux et WhatsApp',
        'Notifications pour nouveaux articles',
      ],
      mockupIcons: [BookText, Search, Bookmark, Share2],
    },
    {
      id: 'ghida2ak',
      icon: Utensils,
      title: 'Ghida2ak Dawa2ak',
      subtitle: 'غذاؤك دواؤك - Nutrition',
      gradient: 'from-green-500 to-emerald-500',
      description: 'Conseils nutritionnels adaptés par type de cancer. Découvrez des recettes santé et des plans alimentaires personnalisés.',
      features: [
        'Informations pour 5 types de cancer (sein, poumon, côlon, prostate, utérus)',
        'Recommandations alimentaires spécifiques par type',
        'Plans alimentaires détaillés et régimes recommandés',
        'Liste d\'aliments à privilégier avec explications des bienfaits',
        'Liste d\'aliments à éviter avec explications des risques',
        'Conseils nutritionnels généraux pour tous les cancers',
        'Recettes santé adaptées avec ingrédients et préparation',
        'Système de favoris pour sauvegarder conseils et recettes',
        'Recherche par aliment ou catégorie',
        'Calculateur de portions et valeurs nutritionnelles',
      ],
      mockupIcons: [Utensils, Search, Star, Bookmark],
    },
    {
      id: 'tawassol',
      icon: Phone,
      title: 'Tawassol - تواصل',
      subtitle: 'Annuaire',
      gradient: 'from-purple-500 to-pink-500',
      description: 'Annuaire complet des professionnels et structures de santé. Trouvez facilement les médecins, centres et associations près de chez vous.',
      features: [
        'Catégories : Médecins, Centres cancer, Psychologues, Laboratoires, Pharmacies, Associations',
        'Filtrage par wilaya pour toutes les catégories',
        'Recherche par nom, spécialité ou wilaya',
        'Fiches détaillées : nom, spécialité, adresse, téléphone, email, horaires',
        'Bouton d\'appel direct sur chaque fiche',
        'Système de favoris pour sauvegarder les contacts',
        'Gestion de profil pour les professionnels',
        'Modification des informations affichées',
        'Avis et évaluations des patients',
        'Carte interactive pour localiser les professionnels',
      ],
      mockupIcons: [Phone, Search, Filter, Star],
    },
    {
      id: 'khibrati',
      icon: Users,
      title: 'Khibrati - خبرتي',
      subtitle: 'Publications',
      gradient: 'from-orange-500 to-red-500',
      description: 'Espace de partage d\'expertise par les médecins. Accédez aux connaissances médicales partagées par des professionnels vérifiés.',
      features: [
        'Articles publiés par les médecins vérifiés',
        'Filtrage par spécialité médicale ou date',
        'Recherche par titre ou mot-clé',
        'Fiche article avec auteur, date et contenu complet',
        'Section commentaires sous chaque article',
        'Système de favoris et de partage',
        'Interface de publication pour les médecins',
        'Création d\'articles avec contenu riche et images',
        'Validation par l\'administration avant publication',
        'Statistiques de lecture et engagement',
      ],
      mockupIcons: [Users, BookText, Star, Share2],
    },
    {
      id: 'nassa2ih',
      icon: FileText,
      title: 'Nassa2ih - نصائح',
      subtitle: 'Conseils & Guides',
      gradient: 'from-indigo-500 to-blue-500',
      description: 'Informations administratives et guides pratiques. Toutes les démarches et aides disponibles pour les patients.',
      features: [
        'Catégories : Démarches administratives, droits, couverture santé, aides financières',
        'Articles informatifs détaillés par catégorie',
        'Fiches guides avec documents nécessaires',
        'Recherche par mot-clé ou type de démarche',
        'Système de favoris pour sauvegarder les guides utiles',
        'Informations sur les droits des patients',
        'Guide des aides financières disponibles',
        'Procédures pas à pas illustrées',
        'Contacts utiles pour chaque démarche',
      ],
      mockupIcons: [FileText, Search, Bookmark, Check],
    },
    {
      id: 'logements',
      icon: Home,
      title: 'Logements Gratuits',
      subtitle: 'Hébergements',
      gradient: 'from-teal-500 to-green-500',
      description: 'Liste des hébergements gratuits pour les patients en traitement. Trouvez un logement près de votre centre de soins.',
      features: [
        'Liste complète des logements par wilaya',
        'Filtrage et recherche par wilaya ou adresse',
        'Fiches détaillées : contact, téléphone, email, adresse',
        'Informations sur la capacité et les conditions',
        'Bouton d\'appel direct pour chaque logement',
        'Disponibilité en temps réel',
        'Photos et descriptions des hébergements',
        'Avis et témoignages des patients',
        'Carte interactive pour localiser les logements',
      ],
      mockupIcons: [Home, Search, Phone, Star],
    },
    {
      id: 'qui-sommes-nous',
      icon: Info,
      title: 'Qui Sommes-Nous',
      subtitle: 'À Propos',
      gradient: 'from-pink-500 to-rose-500',
      description: 'Page de présentation de la plateforme Canstory. Découvrez notre mission, nos valeurs et notre équipe.',
      features: [
        'Présentation complète de la plateforme',
        'Mission et objectifs de Canstory',
        'Valeurs et engagement',
        'Informations de contact (email, téléphone, réseaux sociaux)',
        'Présentation de l\'équipe',
        'Historique et évolution du projet',
        'Partenaires et collaborations',
      ],
      mockupIcons: [Info, Heart, Users, Phone],
    },
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
          <Badge className='mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'>
            7 Modules Complets
          </Badge>
          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight'>
            Découvrez toutes les <span className='text-primary'>fonctionnalités</span>
          </h1>
          <p className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
            Une plateforme complète avec 7 modules essentiels pour accompagner les patients
            atteints de cancer dans leur parcours de soins en Algérie.
          </p>
        </div>
      </section>

      {/* Modules Tabs */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20'>
        <Tabs defaultValue='i3lam' className='w-full'>
          <TabsList className='grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-2 bg-background/50 backdrop-blur-sm mb-12'>
            {modules.map((module) => {
              const Icon = module.icon
              return (
                <TabsTrigger
                  key={module.id}
                  value={module.id}
                  className='flex flex-col items-center gap-2 p-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all'
                >
                  <Icon className='w-5 h-5' />
                  <span className='text-xs font-medium text-center leading-tight'>{module.title.split(' - ')[0]}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {modules.map((module) => {
            const Icon = module.icon
            return (
              <TabsContent key={module.id} value={module.id} className='mt-8'>
                <div className='grid lg:grid-cols-2 gap-12 items-start'>
                  {/* Module Info */}
                  <div className='space-y-8 animate-in fade-in slide-in-from-left duration-500'>
                    <div className='flex items-start gap-4'>
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${module.gradient} flex items-center justify-center shadow-2xl flex-shrink-0`}>
                        <Icon className='w-10 h-10 text-white' />
                      </div>
                      <div className='flex-1'>
                        <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-2'>{module.title}</h2>
                        <p className='text-xl text-muted-foreground font-medium'>{module.subtitle}</p>
                      </div>
                    </div>

                    <p className='text-lg text-muted-foreground leading-relaxed'>
                      {module.description}
                    </p>

                    <div>
                      <h3 className='text-2xl font-semibold text-foreground mb-6'>Fonctionnalités principales</h3>
                      <div className='grid gap-3'>
                        {module.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className='flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 hover:bg-primary/10 transition-all animate-in fade-in slide-in-from-left'
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <div className='w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                              <Check className='w-4 h-4 text-primary' />
                            </div>
                            <span className='text-muted-foreground leading-relaxed'>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Mockup */}
                  <div className='relative animate-in fade-in slide-in-from-right duration-500 delay-200'>
                    <div className='sticky top-24'>
                      <div className='relative mx-auto w-full max-w-sm'>
                        {/* Phone Frame */}
                        <div className='relative z-10 rounded-[3rem] bg-gradient-to-br from-gray-900 to-gray-800 p-3 shadow-2xl'>
                          <div className='rounded-[2.5rem] bg-background overflow-hidden'>
                            {/* Status Bar */}
                            <div className={`bg-gradient-to-r ${module.gradient} px-6 py-3 flex items-center justify-between text-white text-xs`}>
                              <span className='font-semibold'>9:41</span>
                              <div className='flex items-center gap-1'>
                                <Bell className='w-3 h-3' />
                                <div className='w-4 h-3 border border-current rounded-sm' />
                              </div>
                            </div>

                            {/* App Content */}
                            <div className='p-6 space-y-4 bg-gradient-to-br from-background to-primary/5 min-h-[600px]'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <div className='font-bold text-foreground text-lg'>{module.title.split(' - ')[0]}</div>
                                  <div className='text-xs text-muted-foreground'>{module.subtitle}</div>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center`}>
                                  <Icon className='w-6 h-6 text-white' />
                                </div>
                              </div>

                              {/* Search Bar */}
                              <div className='flex items-center gap-2 p-3 rounded-xl bg-card border border-border'>
                                <Search className='w-4 h-4 text-muted-foreground' />
                                <input
                                  type='text'
                                  placeholder='Rechercher...'
                                  className='flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground'
                                  disabled
                                />
                              </div>

                              {/* Content Cards */}
                              <div className='space-y-3'>
                                {[1, 2, 3].map((item) => (
                                  <div
                                    key={item}
                                    className='p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all'
                                  >
                                    <div className='flex items-start gap-3'>
                                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center flex-shrink-0`}>
                                        {(() => {
                                          const IconComponent = module.mockupIcons[item - 1]
                                          return IconComponent ? <IconComponent className='w-6 h-6 text-white' /> : null
                                        })()}
                                      </div>
                                      <div className='flex-1 min-w-0'>
                                        <div className='text-sm font-semibold text-foreground mb-1 line-clamp-1'>
                                          {module.features[item - 1]?.split(' ')[0]} {module.features[item - 1]?.split(' ')[1]}
                                        </div>
                                        <div className='text-xs text-muted-foreground line-clamp-2'>
                                          {module.features[item - 1]}
                                        </div>
                                        <div className='flex items-center gap-2 mt-2'>
                                          <Badge variant='secondary' className='text-[10px] h-5'>
                                            Nouveau
                                          </Badge>
                                          <div className='flex items-center gap-1'>
                                            <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                                            <span className='text-[10px] text-muted-foreground'>4.9</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Bottom Nav */}
                              <div className='absolute bottom-6 left-6 right-6 p-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border flex items-center justify-around'>
                                {module.mockupIcons.map((IconComponent, i) => (
                                  <div
                                    key={i}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      i === 0
                                        ? `bg-gradient-to-br ${module.gradient}`
                                        : 'bg-transparent'
                                    }`}
                                  >
                                    <IconComponent
                                      className={`w-5 h-5 ${i === 0 ? 'text-white' : 'text-muted-foreground'}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Floating Badge */}
                        <div className='absolute -top-4 -right-4 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-xl animate-bounce'>
                          Gratuit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </section>

      {/* CTA Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 md:p-16 text-center'>
          <div className='absolute inset-0 bg-grid-white/10' />
          <div className='relative z-10 space-y-6'>
            <h2 className='text-3xl md:text-4xl font-bold text-primary-foreground'>
              Téléchargez Canstory maintenant
            </h2>
            <p className='text-lg text-primary-foreground/90 max-w-2xl mx-auto'>
              Accédez à toutes ces fonctionnalités gratuitement sur Android et iOS.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center pt-4'>
              <Button
                size='lg'
                variant='secondary'
                className='text-lg shadow-xl group'
              >
                <Download className='w-5 h-5 mr-2 group-hover:animate-bounce' />
                Télécharger sur Android
              </Button>
              <Button
                size='lg'
                variant='secondary'
                className='text-lg shadow-xl group'
              >
                <Download className='w-5 h-5 mr-2 group-hover:animate-bounce' />
                Télécharger sur iOS
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
