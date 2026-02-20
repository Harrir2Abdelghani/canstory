import { memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface AdsChartProps {
  data: {
    total: number
    approved: number
    pending: number
  }
}

export const AdsChart = memo(function AdsChart({ data }: AdsChartProps) {
  const chartData = [
    { name: 'Total', value: data.total, color: '#6d28d9' },
    { name: 'Approuvées', value: data.approved, color: '#7c3aed' },
    { name: 'En attente', value: data.pending, color: '#a78bfa' },
  ]

  if (data.total === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-sm text-muted-foreground'>
        Aucune donnée publicitaire
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart 
        data={chartData} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false}
          fontSize={11}
          fontWeight={600}
          tick={{ fill: '#94a3b8' }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false}
          fontSize={11}
          fontWeight={600}
          tick={{ fill: '#94a3b8' }}
        />
        <Tooltip
          cursor={{ fill: '#f1f5f9', radius: 8 }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white/90 dark:bg-card/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xl">
                   <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 border-b pb-2">{label}</p>
                   <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                       <span className="text-xs font-bold text-slate-600">Demandes</span>
                    </div>
                    <span className="text-xs font-black tabular-nums">
                      {payload[0].value}
                    </span>
                   </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar 
          dataKey="value" 
          radius={[8, 8, 4, 4]} 
          barSize={50}
          animationDuration={1500}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
})
