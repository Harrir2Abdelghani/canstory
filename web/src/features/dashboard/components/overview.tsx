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
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
        <XAxis
          dataKey='name'
          stroke='#94a3b8'
          fontSize={11}
          fontWeight={600}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke='#94a3b8'
          fontSize={11}
          fontWeight={600}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white/90 dark:bg-card/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xl">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 border-b pb-2">{label}</p>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-600" />
                      <span className="text-xs font-bold text-slate-600">Inscriptions</span>
                    </div>
                    <span className="text-xs font-black tabular-nums">
                      {Number(payload[0].value).toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="signups"
          stroke="#8b5cf6"
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorSignups)"
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})
