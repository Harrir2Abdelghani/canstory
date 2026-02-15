import { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { useAuthStore } from '@/stores/auth-store'

export function Overview() {
  const { auth } = useAuthStore()
  const [data, setData] = useState<Array<{ name: string; signups: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserSignupData = async () => {
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

        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          const month = new Date(new Date().getFullYear(), i, 1)
          const monthName = month.toLocaleString('en-US', { month: 'short' })
          const count = users.filter((user: any) => {
            try {
              const userDate = new Date(user.created_at)
              return userDate.getMonth() === i && userDate.getFullYear() === new Date().getFullYear()
            } catch (e) {
              return false
            }
          }).length

          return {
            name: monthName,
            signups: count,
          }
        })

        console.log('Monthly data:', monthlyData)
        setData(monthlyData)
      } catch (error) {
        console.error('Failed to fetch user signup data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserSignupData()
  }, [])

  if (isLoading) {
    return (
      <div className='flex h-[350px] items-center justify-center text-sm text-muted-foreground'>
        Loading chart data...
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
          }}
          formatter={(value) => [`${value} signups`, 'Users']}
        />
        <Bar
          dataKey='signups'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
