import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { 
  Users, 
  BookOpen, 
  Home, 
  FileText, 
  TrendingUp,
  ArrowUpRight,
  Megaphone,
  Download,
  Zap,
  RefreshCw,
  Cpu,
  Database,
  Lock,
  Archive,
  CheckCircle2,
  Terminal,
  ShieldAlert,
  Server,
  Activity,
  Filter,
  LayoutGrid,
  List,
  Clock,
  X
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { AnnuaireDistribution } from './components/annuaire-distribution'
import { AccommodationStats } from './components/accommodation-stats'
import { KhibratiChart } from './components/khibrati-chart'
import { AdsChart } from './components/ads-chart'
import { DownloadReportDialog } from './components/download-report-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'

interface DashboardStats {
  annuaire: {
    total: number
    approved: number
    pending: number
    rejected: number
    roles: Record<string, number>
  }
  users: {
    total: number
    active: number
    roles: Record<string, number>
    trends: Array<{ name: string; signups: number }>
  }
  accommodations: {
    total: number
    available_beds: number
    total_capacity: number
    active: number
  }
  publications: {
    total: number
    approved: number
    pending: number
  }
  comments: {
    total: number
    approved: number
    pending: number
  }
  advertisements: {
    total: number
    approved: number
    pending: number
  }
  content: {
    guides: number
    articles: number
    nutrition: number
  }
  recentEntries: any[]
  analytics?: {
    trend: Array<{ name: string; views: number; downloads: number }>
    cards: {
      totalViews: { value: string; change: string }
      totalDownloads: { value: string; change: string }
      bounceRate: { value: string; change: string }
      avgSession: { value: string; change: string }
    }
    referrers: Array<{ name: string; value: number }>
    devices: Array<{ name: string; value: number }>
  }
  reports?: {
    monthlyReports: Array<{ id: string; name: string; date: string; size: string; status: string; type: string; downloadCount: number }>
    weeklyReports: Array<{ id: string; name: string; date: string; status: string }>
    systemMetrics: { 
      uptime: string; 
      responseTime: string; 
      serverLoad: string; 
      activeProcesses: number;
      cpuUsage: string;
      memoryUsage: string;
      storageUsage: string;
      sslStatus: string;
      networkIO: { in: string; out: string };
      dbConnections: number;
      cacheHitRate: string;
      nodeVersion?: string;
      storageBreakdown?: {
        bdd: number;
        media: number;
        free: number;
      };
    }
    activityMetrics: { 
      activeRate: string; 
      engagementScore: number; 
      retentionRate: string;
      newUsersToday: number;
      activeAdminDaily: number;
      avgResponseTime: string;
    }
    securityMetrics: {
      threatsBlocked: number;
      lastBreachAttempt: string;
      vulnerabilities: number;
      securityScore: string;
    }
    liveLogs: Array<{ id: number; time: string; type: string; message: string }>
  }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

function DashboardSkeleton() {
  return (
    <div className='p-8 pt-6 space-y-8 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-10 w-32' />
      </div>
      
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-32 w-full rounded-xl' />
        ))}
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
        <Skeleton className='col-span-4 h-[450px] rounded-xl' />
        <Skeleton className='col-span-3 h-[450px] rounded-xl' />
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-[400px] w-full rounded-xl' />
        ))}
      </div>
    </div>
  )
}

export function Dashboard() {
  const { auth } = useAuthStore()
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    let isMounted = true
    const fetchStats = async () => {
      if (!auth.user) return

      try {
        setLoading(true)
        const { data } = await apiClient.instance.get('/admin/stats/dashboard', {
          params: { period: dateFilter }
        })
        if (isMounted) {
          console.log('[DASHBOARD] Stats received:', data)
          setStats(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        if (isMounted) setLoading(false)
      }
    }

    fetchStats()
    return () => { isMounted = false }
  }, [auth.user, dateFilter])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.instance.get('/admin/stats/dashboard', {
        params: { period: dateFilter }
      })
      setStats(data)
      toast.success('Données actualisées avec succès')
    } catch (error) {
      console.error('Failed to refresh stats:', error)
      toast.error('Erreur lors de l’actualisation des données')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (reportName: string) => {
    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([600, 800])
      const { width, height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      
      // Header
      page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(0.3, 0.2, 0.6) })
      page.drawText('CANSTORY - RAPPORT ADMINISTRATIVE', { x: 50, y: height - 45, size: 18, font: boldFont, color: rgb(1, 1, 1) })
      page.drawText(`Généré le: ${new Date().toLocaleString('fr-FR')}`, { x: 50, y: height - 65, size: 10, font, color: rgb(0.9, 0.9, 0.9) })

      let yPos = height - 120

      const drawSection = (title: string, data: string[]) => {
        page.drawText(title, { x: 50, y: yPos, size: 14, font: boldFont, color: rgb(0.2, 0.2, 0.2) })
        yPos -= 20
        data.forEach(line => {
          page.drawText(`• ${line}`, { x: 70, y: yPos, size: 11, font, color: rgb(0.3, 0.3, 0.3) })
          yPos -= 18
        })
        yPos -= 10
      }

      drawSection('STATISTIQUES PLATEFORME', [
        `Vues totales: ${stats?.analytics?.cards.totalViews.value || '0'}`,
        `Utilisateurs: ${stats?.users.total || '0'}`,
        `Taux de Rebond: ${stats?.analytics?.cards.bounceRate.value || '0%'}`,
        `Session Moyenne: ${stats?.analytics?.cards.avgSession.value || '0m'}`
      ])

      drawSection('SANTÉ DU SYSTÈME', [
        `Uptime: ${stats?.reports?.systemMetrics.uptime || 'N/A'}`,
        `CPU: ${stats?.reports?.systemMetrics.cpuUsage || '0%'}`,
        `RAM: ${stats?.reports?.systemMetrics.memoryUsage || 'N/A'}`,
        `Version Node: ${stats?.reports?.systemMetrics.nodeVersion || 'N/A'}`
      ])

      drawSection('LISTE DES RESSOURCES', [
        `Annuaire (Approuvé): ${stats?.annuaire.approved || 0}`,
        `Guides & Articles: ${(stats?.content.guides || 0) + (stats?.content.articles || 0)}`,
        `Logements: ${stats?.accommodations.total || 0}`
      ])

      // Footer
      page.drawText('Propriété de Canstory Admin Management. Document Confidentiel.', {
        x: width / 2 - 150,
        y: 40,
        size: 9,
        font,
        color: rgb(0.6, 0.6, 0.6)
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rapport_${reportName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Le rapport PDF "${reportName}" a été généré avec succès.`)
    } catch (err) {
      console.error('PDF Generation Error:', err)
      toast.error('Erreur lors de la génération du PDF.')
    }
  }

  const renderContent = () => {
    if (loading && !stats) {
      return <DashboardSkeleton />
    }

    if (!stats) {
      return (
        <div className='flex flex-col items-center justify-center h-[50vh] space-y-4'>
           <div className='p-4 rounded-full bg-red-50 text-red-600'>
              <X className='h-12 w-12' />
           </div>
           <h2 className='text-xl font-bold'>Échec du chargement des statistiques</h2>
           <p className='text-muted-foreground'>Une erreur est survenue lors de la récupération des données.</p>
           <Button onClick={() => handleRefresh()}>Réessayer</Button>
        </div>
      )
    }

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={`space-y-8 transition-opacity duration-300 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}
      >
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>Tableau de bord</h1>
            <p className="text-muted-foreground">Bienvenue, {auth.user?.fullName}. Voici l'état actuel de votre plateforme.</p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
              onClick={() => setDownloadDialogOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Générer Rapport
            </Button>
          </div>
        </div>

        <DownloadReportDialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen} />

        <Tabs defaultValue='overview' className='space-y-6'>
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value='overview' className="px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-background">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value='analytics' className="px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-background">Analytiques</TabsTrigger>
              <TabsTrigger value='reports' className="px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-background">Rapports</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='overview' className='space-y-8 mt-0 border-none p-0 outline-none'>
             {/* Dashboard Controls */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 font-bold text-xs">
                        <Filter className="mr-2 h-3.5 w-3.5" /> 
                        {dateFilter === 'all' ? 'Filtrer' : `Filtre: ${dateFilter}`}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel>Période</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={dateFilter} onValueChange={(val) => {
                        setDateFilter(val)
                        handleRefresh()
                      }}>
                        <DropdownMenuRadioItem value="all">Tout le temps</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="today">Aujourd'hui</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="7d">7 derniers jours</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="30d">30 derniers jours</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'outline'} 
                    size="sm" 
                    className="h-8 font-bold text-xs"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? (
                      <><LayoutGrid className="mr-2 h-3.5 w-3.5" /> Grille</>
                    ) : (
                      <><List className="mr-2 h-3.5 w-3.5" /> Liste</>
                    )}
                  </Button>
               </div>
               <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold bg-green-50 text-green-600 border-green-200">Système Operational</Badge>
                  <span className="text-[10px] text-muted-foreground font-medium italic">Dernière mise à jour: {new Date().toLocaleTimeString()}</span>
               </div>
            </div>

            {/* Main Metrics */}
             <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}
            >
              {/* Users Card */}
              <motion.div variants={item}>
                <Card className="group relative overflow-hidden border-none shadow-md transition-all hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-card">
                  <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
                    <div className="rounded-xl bg-violet-100 dark:bg-violet-900/30 p-2.5 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                      <Users className='h-5 w-5' />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                         <ArrowUpRight className="h-3 w-3" />
                         +{Math.floor(stats.users.total * 0.05)}%
                       </div>
                       <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">vs mois dernier</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className='text-4xl font-black tracking-tighter text-primary'>{stats.users.total}</div>
                    <CardDescription className="text-xs font-bold mt-1 uppercase tracking-widest text-muted-foreground">Utilisateurs inscrits</CardDescription>
                    <div className="mt-4 pt-4 border-t border-muted/50 flex justify-between items-center text-[10px] font-bold">
                       <span className="text-muted-foreground">ACTIFS AUJOURD'HUI</span>
                       <span className="text-violet-600">{stats.users.active}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Directory Card */}
              <motion.div variants={item}>
                <Card className="group relative overflow-hidden border-none shadow-md transition-all hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-card">
                  <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
                    <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-2.5 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <BookOpen className='h-5 w-5' />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                         <LayoutGrid className="h-3 w-3" />
                         {Object.keys(stats.annuaire.roles).length} CATS
                       </div>
                       <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Répartition active</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className='text-4xl font-black tracking-tighter text-blue-600'>{stats.annuaire.total}</div>
                    <CardDescription className="text-xs font-bold mt-1 uppercase tracking-widest text-muted-foreground">Prestataires validés</CardDescription>
                    <div className="mt-4 pt-4 border-t border-muted/50 flex justify-between items-center text-[10px] font-bold">
                       <span className="text-muted-foreground uppercase tracking-tighter">Attente Validation</span>
                       <span className="text-amber-500 font-black">{stats.annuaire.pending}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Accommodations Card */}
              <motion.div variants={item}>
                <Card className="group relative overflow-hidden border-none shadow-md transition-all hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-card">
                  <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
                    <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/30 p-2.5 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                      <Home className='h-5 w-5' />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                         <CheckCircle2 className="h-3 w-3" />
                         {stats.accommodations.active} SITES
                       </div>
                       <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Opérationnels</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className='text-4xl font-black tracking-tighter text-emerald-600'>{(stats.accommodations.total_capacity - stats.accommodations.available_beds)}</div>
                    <CardDescription className="text-xs font-bold mt-1 uppercase tracking-widest text-muted-foreground">Lits occupés</CardDescription>
                    <div className="mt-4 space-y-2 pt-4 border-t border-muted/50">
                       <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-muted-foreground uppercase">Capacité Totale</span>
                          <span className="font-black text-emerald-600">{stats.accommodations.total_capacity}</span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Advertisements Card */}
              <motion.div variants={item}>
                <Card className="group relative overflow-hidden border-none shadow-md transition-all hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-card">
                  <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
                    <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-2.5 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                      <Megaphone className='h-5 w-5' />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                         <Zap className="h-3 w-3" />
                         +12% REV
                       </div>
                       <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Performance Ads</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className='text-4xl font-black tracking-tighter text-amber-600'>{stats.advertisements.total}</div>
                    <CardDescription className="text-xs font-bold mt-1 uppercase tracking-widest text-muted-foreground">Campagnes actives</CardDescription>
                    <div className="mt-4 pt-4 border-t border-muted/50 flex justify-between items-center text-[10px] font-bold">
                       <span className="text-muted-foreground uppercase">Demandes en cours</span>
                       <span className="text-amber-600 font-black">+{stats.advertisements.pending}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Main Visualizations Row 1 */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
              <Card className='col-span-1 border-none shadow-sm lg:col-span-4 bg-white dark:bg-card'>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">Inscriptions Utilisateurs</CardTitle>
                    <CardDescription>Croissance mensuelle (Dès Janvier 2026)</CardDescription>
                  </div>
                  <div className="rounded-full bg-violet-100 p-2 dark:bg-violet-900/30">
                    <TrendingUp className="h-5 w-5 text-violet-600" />
                  </div>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview data={stats.users.trends} />
                </CardContent>
              </Card>

              <Card className='col-span-1 border-none shadow-sm lg:col-span-3 bg-white dark:bg-card'>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-primary">Dernières Inscriptions</CardTitle>
                      <CardDescription>Professionnels récemment approuvés</CardDescription>
                    </div>
                    <Activity className="h-5 w-5 text-primary opacity-50" />
                  </div>
                </CardHeader>
                <CardContent>
                  <RecentSales data={stats.recentEntries} />
                </CardContent>
              </Card>
            </div>

            {/* Specialized Content Charts Row 2 */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
                      <FileText className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-primary">Khibrati - Publications</CardTitle>
                      <CardDescription>Statistiques de validation des articles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <KhibratiChart data={stats.publications} />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
                      <Megaphone className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-primary">Gestion Publicitaire</CardTitle>
                      <CardDescription>Analyse des demandes d'annonces</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AdsChart data={stats.advertisements} />
                </CardContent>
              </Card>
            </div>

            {/* Secondary Visualizations Row 3 */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
                      <BookOpen className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-primary">Répartition de l'Annuaire</CardTitle>
                      <CardDescription>Distribution par catégorie professionnelle</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnnuaireDistribution data={stats.annuaire.roles} />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
                      <Home className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-primary">Statistiques Hébergement</CardTitle>
                      <CardDescription>Occupation et capacités des centres</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AccommodationStats
                    data={{
                      totalActiveCenters: stats.accommodations.active,
                      totalCapacity: stats.accommodations.total_capacity,
                      totalAvailableBeds: stats.accommodations.available_beds,
                      occupiedBeds: stats.accommodations.total_capacity - stats.accommodations.available_beds
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='analytics' className='space-y-4'>
            <Analytics data={stats.analytics} />
          </TabsContent>

          <TabsContent value='reports' className='space-y-6 outline-none pb-12'>
            {!stats.reports ? (
              <Card className="p-16 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2 bg-muted/5">
                <div className="p-6 rounded-full bg-primary/10 animate-pulse">
                  <Server className="h-12 w-12 text-primary/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-foreground">Initialisation du Centre de Command...</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connexion aux services de monitoring en cours. Si cet état persiste, vérifiez les journaux du serveur ou rafraîchissez manuellement.
                  </p>
                </div>
                <Button onClick={handleRefresh} variant="default" className="shadow-lg shadow-primary/20">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser la Connexion
                </Button>
              </Card>
            ) : (
              <div className='grid gap-6 lg:grid-cols-12'>
                {/* Left Column - System Control & Reports */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Performance Indicators Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-none shadow-sm bg-white dark:bg-card p-6">
                        <div className="flex items-center justify-between mb-4">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Database className="h-5 w-5" /></div>
                           <Badge variant="outline" className="text-[10px] font-bold border-blue-200 text-blue-600">DB Live</Badge>
                        </div>
                        <div className="space-y-1">
                           <p className="text-2xl font-black">{stats.reports.systemMetrics.dbConnections}</p>
                           <p className="text-xs font-bold text-muted-foreground uppercase">Connexions Actives</p>
                        </div>
                     </Card>
                     <Card className="border-none shadow-sm bg-white dark:bg-card p-6">
                        <div className="flex items-center justify-between mb-4">
                           <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Zap className="h-5 w-5" /></div>
                           <Badge variant="outline" className="text-[10px] font-bold border-amber-200 text-amber-600">Optimisé</Badge>
                        </div>
                        <div className="space-y-1">
                           <p className="text-2xl font-black">{stats.reports.systemMetrics.cacheHitRate}</p>
                           <p className="text-xs font-bold text-muted-foreground uppercase">Taux de Cache (Hit)</p>
                        </div>
                     </Card>
                     <Card className="border-none shadow-sm bg-white dark:bg-card p-6">
                        <div className="flex items-center justify-between mb-4">
                           <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Activity className="h-5 w-5" /></div>
                           <Badge variant="outline" className="text-[10px] font-bold border-green-200 text-green-600">Stable</Badge>
                        </div>
                        <div className="space-y-1">
                           <p className="text-2xl font-black">{stats.reports.activityMetrics.avgResponseTime}</p>
                           <p className="text-xs font-bold text-muted-foreground uppercase">Temps de Réponse Moyen</p>
                        </div>
                     </Card>
                  </div>

                  {/* Main Reports Management */}
                  <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-card">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-600 text-white">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">Archives de Direction & Audits</CardTitle>
                          <CardDescription>Documents consolidés pour la gouvernance</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="outline" size="sm" className="h-8 font-bold text-xs"><Archive className="mr-2 h-3.5 w-3.5" /> Archiver Tout</Button>
                         <Button variant="outline" size="sm" className="h-8 font-bold text-xs"><List className="mr-2 h-3.5 w-3.5" /> Historique</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className='divide-y divide-muted/50'>
                        {stats.reports.monthlyReports.map(report => (
                          <div key={report.id} className='flex items-center justify-between p-4 group hover:bg-muted/30 transition-all'>
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${
                                report.type === 'Security' ? 'bg-red-50 text-red-600' : 
                                report.type === 'Strategy' ? 'bg-indigo-50 text-indigo-600' : 
                                'bg-violet-50 text-violet-600'
                              }`}>
                                {report.type === 'Security' ? <Lock className="h-5 w-5" /> : report.type === 'Strategy' ? <TrendingUp className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className='text-sm font-bold text-foreground'>{report.name}</span>
                                  <Badge variant="secondary" className={`text-[9px] h-4 font-black uppercase ${
                                    report.type === 'Security' ? 'bg-red-100 text-red-700' : 
                                    report.type === 'Strategy' ? 'bg-indigo-100 text-indigo-700' : 
                                    'bg-muted text-muted-foreground'
                                  }`}>{report.type}</Badge>
                                </div>
                                <div className='flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-tight'>
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(report.date).toLocaleDateString('fr-FR')}</span>
                                  <span>•</span>
                                  <span>{report.size}</span>
                                  <span>•</span>
                                  <span className="text-primary">{report.downloadCount} DL</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size='sm' 
                                variant='outline' 
                                className="h-8 text-[11px] font-black border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                onClick={() => handleDownload(report.name)}
                              >
                                <Download className="mr-2 h-3.5 w-3.5" />
                                TÉLÉCHARGER
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Terminal Console */}
                  <Card className="border-none shadow-md bg-[#0d0f12] text-white overflow-hidden">
                     <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                           <Terminal className="h-4 w-4 text-green-400" />
                           <CardTitle className="text-sm font-bold uppercase tracking-widest text-green-400">Console Système en Direct</CardTitle>
                        </div>
                        <div className="flex gap-2">
                           <div className="h-2 w-2 rounded-full bg-red-500" />
                           <div className="h-2 w-2 rounded-full bg-amber-500" />
                           <div className="h-2 w-2 rounded-full bg-green-500" />
                        </div>
                     </CardHeader>
                     <CardContent className="p-4 font-mono text-[11px] space-y-1.5 h-[200px] overflow-y-auto custom-scrollbar">
                        {stats.reports.liveLogs.map(log => (
                           <div key={log.id} className="flex gap-3 relative group/log">
                              <span className="text-white/30 shrink-0">[{log.time}]</span>
                              <span className={`font-black uppercase shrink-0 w-12 ${
                                 log.type === 'error' ? 'text-red-500' : 
                                 log.type === 'warn' ? 'text-amber-400' : 
                                 'text-blue-400'
                              }`}>{log.type}</span>
                              <span className="text-white/80">{log.message}</span>
                              {log.type === 'error' && <Badge className="absolute right-0 opacity-0 group-hover/log:opacity-100 transition-opacity bg-red-600 text-[8px] h-3 px-1 uppercase font-black">Critique</Badge>}
                           </div>
                        ))}
                        <div className="flex gap-3 animate-pulse">
                           <span className="text-white/30">[{new Date().toLocaleTimeString('fr-FR')}]</span>
                           <span className="text-green-500 font-bold">PRÊT</span>
                           <span className="text-green-400 font-medium">Surveillance du bus système...</span>
                        </div>
                     </CardContent>
                     <div className="p-2 border-t border-white/5 bg-black/40 text-center">
                        <Button variant="link" size="sm" className="h-4 text-[9px] font-black uppercase text-white/40 hover:text-green-400 transition-colors">Explorer tous les logs système</Button>
                     </div>
                  </Card>
               </div>

               {/* Right Column - Status & Actions */}
               <div className="lg:col-span-4 space-y-6">
                  {/* High Density Resource Monitor */}
                  <Card className="border-none shadow-xl bg-[#090a0b] text-white overflow-hidden relative border border-white/5">
                    <div className="absolute -top-12 -right-12 opacity-5 scale-150 grayscale rotate-12">
                       <Cpu className="h-48 w-48" />
                    </div>
                    <CardHeader className="border-b border-white/5 bg-white/2 pb-3">
                      <div className="flex items-center justify-between">
                         <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Télémétrie des Ressources</CardTitle>
                         <div className="flex gap-1.5 items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                             <span className="text-[9px] font-black uppercase text-white/50">NODE.JS {stats.reports?.systemMetrics.nodeVersion || 'v20.1'}</span>
                          </div>
                       </div>
                     </CardHeader>
                     <CardContent className="pt-6 space-y-7">
                       <div className="space-y-5">
                         <div className="space-y-2.5">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                             <span className="text-white/30">Charge Processeur</span>
                             <span className="text-violet-500 font-mono tracking-tighter">{stats.reports?.systemMetrics.cpuUsage}</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: stats.reports?.systemMetrics.cpuUsage }}
                              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/30">Allocation Buffer (RAM)</span>
                            <span className="text-blue-500 font-mono tracking-tighter">{stats.reports.systemMetrics.memoryUsage}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '48%' }}
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
                                  <span>Flux Entrant</span>
                                  <span className="text-emerald-500">{stats.reports?.systemMetrics.networkIO.in}</span>
                               </div>
                               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500/50" style={{ width: '40%' }} />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
                                  <span>Flux Sortant</span>
                                  <span className="text-amber-500">{stats.reports?.systemMetrics.networkIO.out}</span>
                               </div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-amber-500/50" style={{ width: '25%' }} />
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
                         <div className="p-3 bg-white/2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
                             <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 group-hover:text-emerald-400">Temps de Fonctionnement</p>
                             <p className="text-sm font-black text-emerald-400 font-mono">{stats.reports?.systemMetrics.uptime}</p>
                          </div>
                          <div className="p-3 bg-white/2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
                             <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 group-hover:text-white">Processus Actifs</p>
                             <p className="text-sm font-black font-mono">{stats.reports?.systemMetrics.activeProcesses}</p>
                          </div>
                       </div>

                       {/* Storage Breakdown Overlay */}
                       <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Matrice de Stockage</span>
                             <span className="text-[10px] font-black text-white/60">{stats.reports?.systemMetrics.storageUsage}</span>
                          </div>
                          <div className="flex h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                             <div className="h-full bg-blue-500" style={{ width: `${stats.reports?.systemMetrics.storageBreakdown?.bdd || 30}%` }} title="Base de données" />
                             <div className="h-full bg-indigo-500" style={{ width: `${stats.reports?.systemMetrics.storageBreakdown?.media || 15}%` }} title="Médias" />
                             <div className="h-full bg-white/10" style={{ width: `${stats.reports?.systemMetrics.storageBreakdown?.free || 55}%` }} title="Libre" />
                          </div>
                         <div className="flex gap-3 mt-2">
                            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-white/30"><div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> BDD</div>
                            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-white/30"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Stockage</div>
                         </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security Center */}
                  <Card className="border-none shadow-md bg-white dark:bg-card">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4" />
                          Centre de Sécurité
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
                           <div>
                               <p className="text-2xl font-black text-red-600">{(stats.reports?.securityMetrics.threatsBlocked || 0) + (stats.comments?.pending || 0)}</p>
                              <p className="text-[10px] font-bold text-red-700 uppercase">Menaces Bloquées</p>
                           </div>
                           <div className="text-right">
                              <p className="text-xs font-bold text-red-600">Score</p>
                              <p className="text-xl font-black text-red-600">{stats.reports?.securityMetrics.securityScore}</p>
                           </div>
                       </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[11px] font-medium border-b border-muted pb-2">
                              <span className="text-muted-foreground">Dernière tentative d'intrusion</span>
                              <span className="font-bold">{stats.reports?.securityMetrics.lastBreachAttempt}</span>
                           </div>
                          <div className="flex justify-between text-[11px] font-medium border-b border-muted pb-2">
                             <span className="text-muted-foreground">Faille critique</span>
                             <span className="font-bold text-green-600">0 détecté</span>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                 
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {renderContent()}
      </Main>
    </div>
  )
}

const topNav = [
  {
    title: 'Vue d\'ensemble',
    href: '/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Utilisateurs',
    href: '/users',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Configuration',
    href: '/platform-config',
    isActive: false,
    disabled: false,
  },
]
