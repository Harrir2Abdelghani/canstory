import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cog, MapPin } from 'lucide-react'
import { WilayasTab } from './wilayas-tab'
import { GeneralTab } from './general-tab'

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: true, disabled: false },
]

export function PlatformConfig() {
  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <SearchBar />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Configuration Plateforme</h1>
            <p className='text-muted-foreground mt-2'>
              Gérez les paramètres globaux de la plateforme
            </p>
          </div>

          <Tabs defaultValue='wilayas' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='wilayas' className='flex items-center gap-2'>
                <MapPin className='h-4 w-4' />
                Wilayas
              </TabsTrigger>
              <TabsTrigger value='general' className='flex items-center gap-2'>
                <Cog className='h-4 w-4' />
                Général
              </TabsTrigger>
            </TabsList>

            <TabsContent value='wilayas' className='space-y-4'>
              <WilayasTab />
            </TabsContent>

            <TabsContent value='general' className='space-y-4'>
              <GeneralTab />
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
