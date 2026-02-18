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
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
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
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
          }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          formatter={(value: any, name: string) => [
            Number(value || 0).toLocaleString(), 
            name === 'views' ? 'Vues Site Web' : 'Téléchargements App'
          ]}
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
