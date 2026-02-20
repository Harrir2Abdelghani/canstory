import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { 
  TrendingUp, 
  Download, 
  MousePointer2, 
  Clock, 
  Search, 
  Monitor,
  Smartphone,
  Tablet,
  Share2,
  PieChart
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AnalyticsChart } from './analytics-chart'

export function Analytics({ data }: { data?: any }) {
  if (!data) return (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      Chargemement des statistiques...
    </div>
  )

  return (
    <div className='space-y-4'>
      <Card className="border-none shadow-sm bg-white dark:bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Aperçu du Trafic</CardTitle>
          <CardDescription>Vues du site web vs Téléchargements mobiles</CardDescription>
        </CardHeader>
        <CardContent className='px-6'>
          <AnalyticsChart data={data.trend} />
        </CardContent>
      </Card>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className="border-none shadow-sm bg-white dark:bg-card">
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Vues Site Web</CardTitle>
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <TrendingUp className='h-4 w-4 text-violet-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-black tracking-tight'>{data.cards.totalViews.value}</div>
            <p className='text-xs text-green-600 font-bold mt-1 flex items-center gap-1'>
              {data.cards.totalViews.change} <span className="text-muted-foreground font-normal">vs sem. dernière</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-card">
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Téléchargements App</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Download className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-black tracking-tight'>{data.cards.totalDownloads.value}</div>
            <p className='text-xs text-green-600 font-bold mt-1 flex items-center gap-1'>
              {data.cards.totalDownloads.change} <span className="text-muted-foreground font-normal">vs sem. dernière</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-card">
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Taux de Rebond</CardTitle>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30">
              <MousePointer2 className='h-4 w-4 text-slate-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-black tracking-tight'>{data.cards.bounceRate.value}</div>
            <p className='text-xs text-amber-600 font-bold mt-1 flex items-center gap-1'>
              {data.cards.bounceRate.change} <span className="text-muted-foreground font-normal">vs sem. dernière</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-card">
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Session Moyenne</CardTitle>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30">
              <Clock className='h-4 w-4 text-slate-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-black tracking-tight'>{data.cards.avgSession.value}</div>
            <p className='text-xs text-green-600 font-bold mt-1 flex items-center gap-1'>
              {data.cards.avgSession.change} <span className="text-muted-foreground font-normal">vs sem. dernière</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4 border-none shadow-sm bg-white dark:bg-card'>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Sources de Trafic</CardTitle>
            <CardDescription>Principales sources de provenance des utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={data.referrers}
              barClass='bg-violet-600'
              valueFormatter={(n) => `${n.toLocaleString()}`}
            />
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3 border-none shadow-sm bg-white dark:bg-card'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <div>
              <CardTitle className="text-xl font-bold text-primary">Appareils</CardTitle>
              <CardDescription>Méthodes d'accès privilégiées</CardDescription>
            </div>
            <PieChart className="h-5 w-5 text-muted-foreground opacity-50" />
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={data.devices}
              barClass='bg-blue-600'
              valueFormatter={(n) => `${n}%`}
              showIcons
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
  showIcons = false
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
  showIcons?: boolean
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  
  const getIcon = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('google')) return <Search className="h-3.5 w-3.5" />
    if (n.includes('direct')) return <Monitor className="h-3.5 w-3.5" />
    if (n.includes('mobile')) return <Smartphone className="h-3.5 w-3.5" />
    if (n.includes('desktop')) return <Monitor className="h-3.5 w-3.5" />
    if (n.includes('tablet')) return <Tablet className="h-3.5 w-3.5" />
    if (n.includes('facebook') || n.includes('instagram')) return <Share2 className="h-3.5 w-3.5" />
    return null
  }

  return (
    <ul className='space-y-4'>
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className='flex flex-col space-y-1.5'>
            <div className='flex items-center justify-between text-xs font-bold'>
              <div className='flex items-center gap-2 text-muted-foreground truncate'>
                {showIcons && <span className="text-primary/60">{getIcon(i.name)}</span>}
                <span className="uppercase tracking-tighter">{i.name}</span>
              </div>
              <div className='tabular-nums text-foreground'>
                {valueFormatter(i.value)}
              </div>
            </div>
            <div className='h-2 w-full rounded-full bg-muted/50 overflow-hidden'>
               <motion.div
                initial={{ width: 0 }}
                animate={{ width }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${barClass}`}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
