import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import React from 'react'

export const AnalyticsChart = React.memo(({ data }: { data?: any[] }) => {
  if (!data || data.length === 0) return (
    <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">
      Aucune donnée disponible
    </div>
  )

  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
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
          tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
        />
        <Tooltip 
          cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white/90 dark:bg-card/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xl">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 border-b pb-2">{label}</p>
                  <div className="space-y-2">
                    {payload.map((entry: any) => (
                      <div key={entry.name} className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {entry.name === 'views' ? 'Vues Plateforme' : 'Téléchargements Mobile'}
                          </span>
                        </div>
                        <span className="text-xs font-black tabular-nums">
                          {Number(entry.value).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type='monotone'
          dataKey='views'
          name="views"
          stroke='#7c3aed'
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorViews)"
        />
        <Area
          type='monotone'
          dataKey='downloads'
          name="downloads"
          stroke='#2563eb'
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorDownloads)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})

AnalyticsChart.displayName = 'AnalyticsChart'
