import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth-store'

interface AnnuaireEntry {
  id: string
  name: string
  email: string
  avatar_url?: string
  annuaire_role: string
  status: string
}

export function RecentSales() {
  const { auth } = useAuthStore()
  const [entries, setEntries] = useState<AnnuaireEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentEntries = async () => {
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
        const data = (result.data || []).slice(0, 5)
        setEntries(data)
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentEntries()
  }, [auth.user])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      medecin: 'Médecin',
      centre_cancer: 'Centre Cancer',
      psychologue: 'Psychologue',
      laboratoire: 'Laboratoire',
      pharmacie: 'Pharmacie',
      association: 'Association',
    }
    return roleMap[role] || role
  }

  if (isLoading) {
    return (
      <div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
        Loading entries...
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
        No entries available
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {entries.map((entry) => (
        <div key={entry.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={entry.avatar_url} alt={entry.name} />
            <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>{entry.name}</p>
              <p className='text-xs text-muted-foreground'>{getRoleLabel(entry.annuaire_role)}</p>
            </div>
            <div className='text-xs font-medium text-primary'>{entry.email}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
