import { memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const VIOLET_COLORS = [
  '#6d28d9', // primary
  '#7c3aed', // violet-600
  '#8b5cf6', // violet-500
  '#a78bfa', // violet-400
  '#c4b5fd', // violet-300
  '#ddd6fe', // violet-200
]

interface AnnuaireDistributionProps {
  data: Record<string, number>
}

const ROLE_LABELS: Record<string, string> = {
  medecin: 'Médecins',
  centre_cancer: 'Centres de Cancer',
  psychologue: 'Psychologues',
  laboratoire: 'Laboratoires',
  pharmacie: 'Pharmacies',
  association: 'Associations',
  unknown: 'Inconnu'
}

export const AnnuaireDistribution = memo(function AnnuaireDistribution({ data }: AnnuaireDistributionProps) {
  const chartData = Object.entries(data || {}).map(([role, count]) => ({
    name: ROLE_LABELS[role] || role,
    value: count,
  }))

  if (chartData.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-sm text-muted-foreground'>
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx='50%'
          cy='50%'
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey='value'
          animationDuration={1500}
        >
          {chartData.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={VIOLET_COLORS[index % VIOLET_COLORS.length]} 
              stroke="rgba(255,255,255,0.1)" 
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            fontSize: '12px'
          }}
          itemStyle={{ fontWeight: '600' }}
          formatter={(value) => [`${value} entrées`, 'Quantité']}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          formatter={(value) => <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '11px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
})
