import type { CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useAuthStore } from '@/stores/auth-store'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { auth } = useAuthStore()

  const authUser = auth.user
  const displayName = authUser?.fullName?.trim() || authUser?.email?.split('@')[0] || 'Administrateur'
  const displayEmail = authUser?.email || 'admin@canstory.com'
  const avatarUrl = authUser?.avatarUrl || '' // Force fallback if no avatar URL
  const avatarFallback = authUser?.fullName?.charAt(0).toUpperCase() || authUser?.email?.charAt(0).toUpperCase() || 'A'
  const fallbackStyle: CSSProperties = {
    background: '#fff',
    border: '2px solid #7C4DFF',
    color: '#7C4DFF',
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback style={fallbackStyle} className='text-xs font-semibold'>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' sideOffset={4} forceMount>
          <DropdownMenuLabel className='p-0 font-normal'>
            <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback style={fallbackStyle} className='rounded-lg text-xs font-semibold'>
                {avatarFallback}
              </AvatarFallback>
              </Avatar>
              <div className='flex flex-col gap-1.5'>
                <p className='text-sm leading-none font-medium'>{displayName}</p>
                <p className='text-xs leading-none text-muted-foreground'>{displayEmail}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            Sign out
            <DropdownMenuShortcut className='text-current'>
              ⇧⌘Q
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
