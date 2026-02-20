import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CSSProperties } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { state, isMobile } = useSidebar()
  const { auth } = useAuthStore()
  const isCollapsed = state === 'collapsed' && !isMobile
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
      <SidebarHeader className={isCollapsed ? 'items-center p-2' : ''}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' className='cursor-default hover:bg-transparent'>
              <div className={`flex aspect-square ${isCollapsed ? 'size-8' : 'size-10'} items-center justify-center rounded-full border-2 border-purple-600 bg-transparent shrink-0 transition-all`}>
                <img
                  src="/images/canstory_logo.png"
                  className={isCollapsed ? 'size-5' : 'size-6'}
                  alt="Canstory Logo"
                />
              </div>

              {!isCollapsed && (
                <div className='grid flex-1 text-start text-sm leading-tight animate-in fade-in duration-300'>
                  <span className='truncate font-semibold text-primary'>Canstory Admin</span>
                  <span className='truncate text-xs text-muted-foreground'>Tableau de bord</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className={isCollapsed ? 'items-center p-2' : ''}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' className='cursor-default hover:bg-transparent'>
              <Avatar className={`${isCollapsed ? 'h-8 w-8' : 'h-8 w-8'} rounded-lg shrink-0 transition-all`}>
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback style={fallbackStyle} className='rounded-lg text-xs font-semibold'>
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className='grid flex-1 text-start text-sm leading-tight animate-in fade-in duration-300'>
                  <span className='truncate font-semibold'>{displayName}</span>
                  <span className='truncate text-xs text-muted-foreground'>{displayEmail}</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
