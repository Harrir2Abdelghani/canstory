import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarDays, Mail, Phone, MapPin, Shield, User } from 'lucide-react'
import { useAdminUsersContext } from './admin-users-provider'
import { cn } from '@/lib/utils'
import wilayasData from '@/assets/Wilaya_Of_Algeria.json'
import communesData from '@/assets/Commune_Of_Algeria.json'

const roleColors = {
  superadmin: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  doctor: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  pharmacy: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  patient: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
  association: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300',
  cancer_center: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
  laboratory: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300',
}

export function AdminUserDetailDialog() {
  const { detailDialogOpen, setDetailDialogOpen, editingUser } = useAdminUsersContext()

  if (!editingUser) return null

  const initials = editingUser.full_name
    ? editingUser.full_name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  const formattedDate = new Date(editingUser.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Resolve Wilaya and Commune names
  const wilaya = wilayasData.find(w => w.id === String(editingUser.wilaya) || w.code === String(editingUser.wilaya))
  const wilayaName = wilaya ? wilaya.name : editingUser.wilaya

  const commune = communesData.find(c => c.id === String(editingUser.commune))
  const communeName = commune ? commune.name : editingUser.commune

  return (
    <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
      <DialogContent className='sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl'>
        <div className='absolute top-0 left-0 w-full h-32 bg-primary' />
        
        <DialogHeader className='relative pt-16 px-6 pb-4'>
           <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <Avatar className='h-24 w-24 border-4 border-background shadow-xl'>
                <AvatarImage src={editingUser.avatar_url || ''} alt={editingUser.full_name} />
                <AvatarFallback className='text-2xl bg-purple-100 text-purple-700 font-bold'>{initials}</AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-background",
                editingUser.is_active ? "bg-emerald-500" : "bg-slate-400"
              )} />
            </div>
            
            <div className='text-center space-y-1 mt-2'>
              <DialogTitle className='text-2xl font-bold tracking-tight'>
                {editingUser.full_name}
              </DialogTitle>
              <Badge 
                variant='outline' 
                className={cn(
                  'capitalize font-semibold px-3 py-0.5', 
                  roleColors[editingUser.role as keyof typeof roleColors] || roleColors.patient
                )}
              >
                {editingUser.role === 'admin' ? 'Administrateur' : 
                 editingUser.role === 'superadmin' ? 'Super Admin' : 
                 editingUser.role}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className='px-8 py-6 space-y-6 bg-background'>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
             {/* Contact Info */}
             <div className='space-y-4 col-span-2 sm:col-span-1'>
              <h3 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <User className='h-4 w-4 text-primary' /> Informations
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center gap-3 text-sm'>
                  <Mail className='h-4 w-4 text-slate-400' />
                  <span className='font-medium truncate'>{editingUser.email}</span>
                </div>
                <div className='flex items-center gap-3 text-sm'>
                   <Phone className='h-4 w-4 text-slate-400' />
                   <span className='font-medium'>{editingUser.phone || 'Non renseigné'}</span>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className='space-y-4 col-span-2 sm:col-span-1'>
               <h3 className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-primary' /> Localisation
              </h3>
              <div className='space-y-3'>
                <div className='text-sm'>
                   <span className='text-muted-foreground'>Wilaya:</span>{' '}
                   <span className='font-medium'>{wilayaName || 'N/A'}</span>
                </div>
                <div className='text-sm'>
                   <span className='text-muted-foreground'>Commune:</span>{' '}
                   <span className='font-medium'>{communeName || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className='space-y-4 col-span-2 pt-2 border-t'>
               <div className='flex items-center justify-between'>
                 <div className='flex items-center gap-3 text-sm text-muted-foreground italic font-medium'>
                    <CalendarDays className='h-4 w-4' />
                    Membre depuis le {formattedDate}
                 </div>
                 <div className='flex items-center gap-2'>
                    <Shield className={cn(
                      "h-4 w-4",
                      editingUser.is_active ? "text-emerald-500" : "text-slate-400"
                    )} />
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      editingUser.is_active ? "text-emerald-600" : "text-slate-500"
                    )}>
                      {editingUser.is_active ? 'Compte Actif' : 'Compte Inactif'}
                    </span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className='px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 border-t'>
           <button 
            onClick={() => setDetailDialogOpen(false)}
            className='px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors'
           >
             Fermer
           </button>
           <button 
             onClick={() => setDetailDialogOpen(false)}
             className='px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all'
           >
             Terminé
           </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
