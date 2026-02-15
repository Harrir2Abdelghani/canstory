import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useAuthStore } from '@/stores/auth-store'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export function AnnuaireDistribution() {
  const { auth } = useAuthStore()
  const [data, setData] = useState<Array<{ name: string; value: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnnuaireDistribution = async () => {
      if (!auth.user) {
        setIsLoading(false)
        return
      }
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const url = origin ? `${origin}/api/admin/annuaire` : '/api/admin/annuaire'
        const response = await fetch(url, { credentials: 'include' })

        if (!response.ok) {
          setIsLoading(false)
          return
        }

        const result = await response.json()
        const entries = result.data || []

        const roleMap: Record<string, number> = {}
        entries.forEach((entry: any) => {
          const role = entry.annuaire_role || 'unknown'
          roleMap[role] = (roleMap[role] || 0) + 1
        })

        const roleLabels: Record<string, string> = {
          medecin: 'Médecins',
          centre_cancer: 'Centres Cancer',
          psychologue: 'Psychologues',
          laboratoire: 'Laboratoires',
          pharmacie: 'Pharmacies',
          association: 'Associations',
        }

        const chartData = Object.entries(roleMap).map(([role, count]) => ({
          name: roleLabels[role] || role,
          value: count,
        }))

        setData(chartData)
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnuaireDistribution()
  }, [])

  if (isLoading) {
    return (
      <div className='flex h-[300px] items-center justify-center text-sm text-muted-foreground'>
        Loading chart data...
      </div>
    )
  }

  console.log('AnnuaireDistribution render - data:', data)

  if (data.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-sm text-muted-foreground'>
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={80}
          fill='#8884d8'
          dataKey='value'
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} entries`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
