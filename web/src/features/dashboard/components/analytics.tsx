import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-violet-600'
            >
              <path d='M3 3v18h18' />
              <path d='M7 15l4-4 4 4 4-6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.cards.totalViews.value}</div>
            <p className='text-xs text-green-600 font-medium'>{data.cards.totalViews.change} vs sem. dernière</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-card">
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Téléchargements App</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-blue-600'
            >
              <circle cx='12' cy='7' r='4' />
              <path d='M6 21v-2a6 6 0 0 1 12 0v2' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.cards.totalDownloads.value}</div>
            <p className='text-xs text-green-600 font-medium'>{data.cards.totalDownloads.change} vs sem. dernière</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-card">
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Taux de Rebond</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M3 12h6l3 6 3-6h6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.cards.bounceRate.value}</div>
            <p className='text-xs text-amber-600 font-medium'>{data.cards.bounceRate.change} vs sem. dernière</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-card">
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Session Moyenne</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <circle cx='12' cy='12' r='10' />
              <path d='M12 6v6l4 2' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.cards.avgSession.value}</div>
            <p className='text-xs text-green-600 font-medium'>{data.cards.avgSession.change} vs sem. dernière</p>
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
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Appareils</CardTitle>
            <CardDescription>Comment vos utilisateurs accèdent à la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={data.devices}
              barClass='bg-blue-600'
              valueFormatter={(n) => `${n}%`}
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
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className='space-y-3'>
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 truncate text-xs text-muted-foreground'>
                {i.name}
              </div>
              <div className='h-2.5 w-full rounded-full bg-muted'>
                <div
                  className={`h-2.5 rounded-full ${barClass}`}
                  style={{ width }}
                />
              </div>
            </div>
            <div className='ps-2 text-xs font-medium tabular-nums'>
              {valueFormatter(i.value)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
