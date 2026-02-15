import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Lock, Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface AdminUser {
  id: string
  email: string
  full_name: string
  phone: string | null
  wilaya: string
  commune: string
  avatar_url: string | null
}

export function ProfileForm() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [editData, setEditData] = useState({
    full_name: '',
    phone: '',
    wilaya: '',
    commune: '',
  })
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Admin',
          phone: authUser.user_metadata?.phone || null,
          wilaya: authUser.user_metadata?.wilaya || 'Algiers',
          commune: authUser.user_metadata?.commune || 'Algiers',
          avatar_url: authUser.user_metadata?.avatar_url || null,
        })
      } else {
        // Fallback: use default admin data
        setUser({
          id: 'admin-default',
          email: 'admin@canstory.com',
          full_name: 'Admin User',
          phone: null,
          wilaya: 'Algiers',
          commune: 'Algiers',
          avatar_url: null,
        })
      }
    } catch (error) {
      console.error('Error loading user:', error)
      // Fallback on error
      setUser({
        id: 'admin-default',
        email: 'admin@canstory.com',
        full_name: 'Admin User',
        phone: null,
        wilaya: 'Algiers',
        commune: 'Algiers',
        avatar_url: null,
      })
    }
  }

  const handleEditOpen = () => {
    if (user) {
      setEditData({
        full_name: user.full_name,
        phone: user.phone || '',
        wilaya: user.wilaya,
        commune: user.commune,
      })
    }
    setIsEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editData.full_name || !editData.wilaya || !editData.commune) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (!user) return

    setIsEditLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editData.full_name,
          phone: editData.phone || null,
          wilaya: editData.wilaya,
          commune: editData.commune,
        })
        .eq('id', user.id)

      if (error) throw error

      setUser({ ...user, ...editData })
      toast.success('Profil mis à jour avec succès')
      setIsEditOpen(false)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setIsEditLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordData.new.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setIsPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new,
      })

      if (error) throw error

      toast.success('Mot de passe changé avec succès')
      setPasswordData({ current: '', new: '', confirm: '' })
      setIsPasswordOpen(false)
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error('Erreur lors du changement de mot de passe')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return

    setIsDeleteLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (error) throw error

      toast.success('Compte supprimé avec succès')
      setIsDeleteOpen(false)
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error('Erreur lors de la suppression du compte')
    } finally {
      setIsDeleteLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <p className='text-muted-foreground'>Chargement du profil...</p>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className='items-center'>
      {/* Profile Header Card */}
      <Card className='border-0'>
        <CardContent className='pt-8'>
          <div className='flex flex-col md:flex-row gap-8  md:items-center'>
            {/* Avatar */}
            <div className='flex flex-col items-center gap-4'>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className='h-32 w-32 rounded-full object-cover border-4 border-primary'
                />
              ) : (
                <div className='h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-primary'>
                  <span className='text-4xl font-bold text-white'>{getInitials(user.full_name)}</span>
                </div>
              )}
              <Badge className='bg-blue-500 hover:bg-blue-600'>Admin</Badge>
            </div>

            {/* Profile Info */}
            <div className='flex-1 space-y-4'>
              <div>
                <h2 className='text-3xl font-bold'>{user.full_name}</h2>
                <p className='text-muted-foreground flex items-center gap-2 mt-1'>
                  <Mail className='h-4 w-4' />
                  {user.email}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4 pt-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>Téléphone</Label>
                  <p className='text-sm font-medium mt-1 flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    {user.phone || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Statut</Label>
                  <Badge className='mt-1 bg-green-500 hover:bg-green-600'>
                    Actif
                  </Badge>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Wilaya</Label>
                  <p className='text-sm font-medium mt-1 flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    {user.wilaya}
                  </p>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Commune</Label>
                  <p className='text-sm font-medium mt-1'>{user.commune}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex gap-2 flex-wrap'>
        <Button onClick={handleEditOpen} className='gap-2'>
          <Edit2 className='h-4 w-4' />
          Modifier le profil
        </Button>
        <Button onClick={() => setIsPasswordOpen(true)} variant='outline' className='gap-2'>
          <Lock className='h-4 w-4' />
          Changer le mot de passe
        </Button>
        <Button onClick={() => setIsDeleteOpen(true)} variant='destructive' className='gap-2'>
          <Trash2 className='h-4 w-4' />
          Supprimer le compte
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>Mettez à jour vos informations administrateur</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Nom Complet *</Label>
              <Input
                id='name'
                value={editData.full_name}
                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                placeholder='Votre nom complet'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='phone'>Téléphone</Label>
              <Input
                id='phone'
                type='tel'
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                placeholder='Votre numéro de téléphone'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='wilaya'>Wilaya *</Label>
                <Input
                  id='wilaya'
                  value={editData.wilaya}
                  onChange={(e) => setEditData({ ...editData, wilaya: e.target.value })}
                  placeholder='Wilaya'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='commune'>Commune *</Label>
                <Input
                  id='commune'
                  value={editData.commune}
                  onChange={(e) => setEditData({ ...editData, commune: e.target.value })}
                  placeholder='Commune'
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditSave} disabled={isEditLoading}>
              {isEditLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>Entrez votre mot de passe actuel et le nouveau mot de passe</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='current'>Mot de passe actuel</Label>
              <Input
                id='current'
                type='password'
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                placeholder='Entrez votre mot de passe actuel'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='new'>Nouveau mot de passe</Label>
              <Input
                id='new'
                type='password'
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                placeholder='Entrez le nouveau mot de passe'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='confirm'>Confirmer le mot de passe</Label>
              <Input
                id='confirm'
                type='password'
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                placeholder='Confirmez le nouveau mot de passe'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsPasswordOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handlePasswordChange} disabled={isPasswordLoading}>
              {isPasswordLoading ? 'Changement...' : 'Changer le mot de passe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Supprimer le compte</DialogTitle>
            <DialogDescription className='text-red-600'>
              Cette action est irréversible. Tous vos données seront supprimées.
            </DialogDescription>
          </DialogHeader>
          <p className='text-sm text-muted-foreground'>
            Êtes-vous sûr de vouloir supprimer votre compte administrateur ? Cette action ne peut pas être annulée.
          </p>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant='destructive' onClick={handleDelete} disabled={isDeleteLoading}>
              {isDeleteLoading ? 'Suppression...' : 'Supprimer le compte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
