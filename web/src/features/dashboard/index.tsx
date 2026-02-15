import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { AnnuaireDistribution } from './components/annuaire-distribution'
import { UserRolesChart } from './components/user-roles-chart'
import { DownloadReportDialog } from './components/download-report-dialog'
import { useAuthStore } from '@/stores/auth-store'

interface DashboardStats {
  totalEntries: number
  approvedEntries: number
  pendingEntries: number
  rejectedEntries: number
}

export function Dashboard() {
  const { auth } = useAuthStore()
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    approvedEntries: 0,
    pendingEntries: 0,
    rejectedEntries: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!auth.user) return

      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const url = origin ? `${origin}/api/admin/annuaire` : '/api/admin/annuaire'
        const response = await fetch(url, { credentials: 'include' })

        if (!response.ok) return

        const result = await response.json()
        const entries = result.data || []

        const approved = entries.filter((e: any) => e.status === 'approved').length
        const pending = entries.filter((e: any) => e.status === 'pending').length
        const rejected = entries.filter((e: any) => e.status === 'rejected').length

        const newStats = {
          totalEntries: entries.length,
          approvedEntries: approved,
          pendingEntries: pending,
          rejectedEntries: rejected,
        }
        console.log('Stats to set:', newStats)
        setStats(newStats)
        console.log('Stats state updated')
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex items-center space-x-2'>
            <Button onClick={() => setDownloadDialogOpen(true)}>Download</Button>
          </div>
        </div>
        <DownloadReportDialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen} />
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
              <TabsTrigger value='reports'>Reports</TabsTrigger>
              <TabsTrigger value='notifications'>Notifications</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Entries
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'
                  >
                    <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.totalEntries}</div>
                  <p className='text-xs text-muted-foreground'>
                    All directory entries
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Approved
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'
                  >
                    <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                    <polyline points='22 4 12 14.01 9 11.01' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.approvedEntries}</div>
                  <p className='text-xs text-muted-foreground'>
                    Verified entries
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Pending</CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'
                  >
                    <circle cx='12' cy='12' r='10' />
                    <polyline points='12 6 12 12 16 14' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.pendingEntries}</div>
                  <p className='text-xs text-muted-foreground'>
                    Awaiting review
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Rejected
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'
                  >
                    <circle cx='12' cy='12' r='10' />
                    <line x1='15' y1='9' x2='9' y2='15' />
                    <line x1='9' y1='9' x2='15' y2='15' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.rejectedEntries}</div>
                  <p className='text-xs text-muted-foreground'>
                    Not approved
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>User Signups</CardTitle>
                  <CardDescription>
                    Monthly user registration trends
                  </CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                  <CardDescription>
                    Latest approved directory entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Directory by Role</CardTitle>
                  <CardDescription>
                    Annuaire entries distribution by role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnnuaireDistribution />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                  <CardDescription>
                    System users distribution by role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserRolesChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
          </TabsContent>
          <TabsContent value='reports' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Reports</CardTitle>
                  <CardDescription>Generated reports for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>January 2024</span>
                      <Button size='sm' variant='outline'>Download</Button>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>December 2023</span>
                      <Button size='sm' variant='outline'>Download</Button>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>November 2023</span>
                      <Button size='sm' variant='outline'>Download</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>User engagement reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>89.2%</div>
                  <p className='text-xs text-muted-foreground'>Active user rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>System performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>99.9%</div>
                  <p className='text-xs text-muted-foreground'>Uptime this month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='notifications' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Latest system and user notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-start gap-4'>
                    <div className='rounded-full bg-primary/10 p-2'>
                      <svg className='h-4 w-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                      </svg>
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>New user registration</p>
                      <p className='text-xs text-muted-foreground'>5 new users registered today</p>
                    </div>
                    <span className='text-xs text-muted-foreground'>2h ago</span>
                  </div>
                  <div className='flex items-start gap-4'>
                    <div className='rounded-full bg-primary/10 p-2'>
                      <svg className='h-4 w-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>System update completed</p>
                      <p className='text-xs text-muted-foreground'>All systems running normally</p>
                    </div>
                    <span className='text-xs text-muted-foreground'>5h ago</span>
                  </div>
                  <div className='flex items-start gap-4'>
                    <div className='rounded-full bg-primary/10 p-2'>
                      <svg className='h-4 w-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>Backup completed</p>
                      <p className='text-xs text-muted-foreground'>Daily backup successful</p>
                    </div>
                    <span className='text-xs text-muted-foreground'>1d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: '/users',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/platform-config',
    isActive: false,
    disabled: false,
  },
]
