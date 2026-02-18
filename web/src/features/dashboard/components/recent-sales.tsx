import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AnnuaireEntry {
  id: string
  name: string
  email: string
  avatar_url?: string
  annuaire_role: string
  status: string
}

interface RecentSalesProps {
  data: AnnuaireEntry[]
}

export function RecentSales({ data }: RecentSalesProps) {
  const getInitials = (name: string) => {
    if (!name) return '??'
    return name
      .split(' ')
      .filter(n => n)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      medecin: 'Médecin',
      centre_cancer: 'Centre Cancer',
      psychologue: 'Psychologue',
      laboratoire: 'Laboratoire',
      pharmacie: 'Pharmacie',
      association: 'Association',
    }
    return roleLabels[role] || role
  }

  if (!data || data.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
        No entries available
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {data.map((entry) => (
        <div key={entry.id} className='flex items-center gap-4 group transition-all'>
          <Avatar className='h-9 w-9 border-2 border-background shadow-sm'>
            <AvatarImage src={entry.avatar_url} alt={entry.name} />
            <AvatarFallback className="bg-muted text-xs font-semibold">{getInitials(entry.name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between gap-x-2'>
            <div className='space-y-0.5'>
              <p className='text-sm font-semibold leading-none group-hover:text-primary transition-colors'>{entry.name}</p>
              <p className='text-xs text-muted-foreground font-medium'>{getRoleLabel(entry.annuaire_role)}</p>
            </div>
            <div className='text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full'>{entry.email}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
