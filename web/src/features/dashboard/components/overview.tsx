import { memo } from 'react'
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts'

interface OverviewProps {
  data: Array<{ name: string; signups: number }>
}

const MONTH_MAP: Record<string, string> = {
  Jan: 'Jan', Feb: 'Fév', Mar: 'Mar', Apr: 'Avr', May: 'Mai', Jun: 'Juin',
  Jul: 'Juil', Aug: 'Août', Sep: 'Sep', Oct: 'Oct', Nov: 'Nov', Dec: 'Déc'
}

export const Overview = memo(function Overview({ data }: OverviewProps) {
  if (!data || data.length === 0) {
    return (
      <div className='flex h-[350px] items-center justify-center text-sm text-muted-foreground'>
        Aucune donnée disponible
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    name: MONTH_MAP[d.name] || d.name
  }))

  return (
    <ResponsiveContainer width='100%' height={350}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }}
          itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
          formatter={(value) => [`${value} nouveaux utilisateurs`, 'Inscriptions']}
        />
        <Area
          type="monotone"
          dataKey="signups"
          stroke="#8b5cf6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorSignups)"
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})
