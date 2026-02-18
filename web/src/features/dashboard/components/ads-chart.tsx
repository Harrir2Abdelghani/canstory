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
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }}
          formatter={(value) => [`${value} publicités`, 'Quantité']}
        />
        <Bar 
          dataKey="value" 
          radius={[6, 6, 0, 0]} 
          barSize={40}
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
