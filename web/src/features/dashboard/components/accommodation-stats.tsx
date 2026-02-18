import { memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface AccommodationStatsProps {
  data: {
    totalActiveCenters: number
    totalCapacity: number
    totalAvailableBeds: number
    occupiedBeds: number
  }
}

export const AccommodationStats = memo(function AccommodationStats({ data }: AccommodationStatsProps) {
  const chartData = [
    { name: 'Lits Disponibles', value: data.totalAvailableBeds, color: '#8b5cf6' },
    { name: 'Lits Occupés', value: data.occupiedBeds, color: '#c4b5fd' },
    { name: 'Centres Actifs', value: data.totalActiveCenters, color: '#6d28d9' },
  ]

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted/30" />
        <XAxis type="number" axisLine={false} tickLine={false} hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={100} 
          axisLine={false} 
          tickLine={false}
          fontSize={11}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            fontSize: '12px'
          }}
        />
        <Bar 
          dataKey="value" 
          radius={[0, 4, 4, 0]} 
          barSize={24}
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
