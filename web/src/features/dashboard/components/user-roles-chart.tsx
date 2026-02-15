import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '@/stores/auth-store'

export function UserRolesChart() {
  const { auth } = useAuthStore()
  const [data, setData] = useState<Array<{ role: string; count: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!auth.user) {
        setIsLoading(false)
        return
      }
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const url = origin ? `${origin}/api/admin/users?pageSize=500` : '/api/admin/users?pageSize=500'
        const response = await fetch(url, { credentials: 'include' })

        if (!response.ok) {
          setIsLoading(false)
          return
        }

        const result = await response.json()
        const users = result.data || []

        const roleMap: Record<string, number> = {}
        users.forEach((user: any) => {
          const role = user.role || 'unknown'
          roleMap[role] = (roleMap[role] || 0) + 1
        })

        const roleLabels: Record<string, string> = {
          admin: 'Admin',
          superadmin: 'Super Admin',
          doctor: 'Doctors',
          pharmacy: 'Pharmacies',
          association: 'Associations',
          cancer_center: 'Cancer Centers',
          laboratory: 'Laboratories',
          patient: 'Patients',
        }

        const chartData = Object.entries(roleMap)
          .map(([role, count]) => ({
            role: roleLabels[role] || role,
            count,
          }))
          .sort((a, b) => b.count - a.count)

        setData(chartData)
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRoles()
  }, [])

  if (isLoading) {
    return (
      <div className='flex h-[300px] items-center justify-center text-sm text-muted-foreground'>
        Loading chart data...
      </div>
    )
  }

  console.log('UserRolesChart render - data:', data)

  if (data.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-sm text-muted-foreground'>
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='role' angle={-45} textAnchor='end' height={80} />
        <YAxis />
        <Tooltip formatter={(value) => `${value} users`} />
        <Bar dataKey='count' fill='#06b6d4' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
