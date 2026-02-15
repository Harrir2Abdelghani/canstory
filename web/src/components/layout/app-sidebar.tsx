import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CSSProperties } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { auth } = useAuthStore()
  const authUser = auth.user
  const fallbackUser = sidebarData.user
  const displayName = authUser?.fullName?.trim() || fallbackUser.name
  const displayEmail = authUser?.email || fallbackUser.email
  const avatarUrl = authUser?.avatarUrl || '' // Force fallback if no avatar URL
  const avatarFallback = authUser?.fullName?.charAt(0).toUpperCase() || authUser?.email?.charAt(0).toUpperCase() || 'A'
  const fallbackStyle: CSSProperties = {
    background: '#fff',
    border: '2px solid #7C4DFF',
    color: '#7C4DFF',
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' className='cursor-default hover:bg-transparent'>
              <div className="flex aspect-square size-10 items-center justify-center rounded-full border-2 border-purple-600 bg-transparent">
                <img
                  src="/images/canstory_logo.png"
                  className="size-6 object-contain"
                  alt="Canstory Logo"
                />
              </div>

              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>Canstory Admin</span>
                <span className='truncate text-xs'>Admin Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' className='cursor-default hover:bg-transparent'>
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback style={fallbackStyle} className='rounded-lg text-xs font-semibold'>
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{displayName}</span>
                <span className='truncate text-xs'>{displayEmail}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
