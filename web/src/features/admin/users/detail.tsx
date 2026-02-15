import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Mail, MapPin, Phone, Calendar, Shield, Trash2, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAdminUsers, useDeleteUser, useSuspendUser, useActivateUser } from '@/hooks/use-admin-users'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const roleColors: Record<string, string> = {
  superadmin: 'bg-purple-100/30 text-purple-900 dark:text-purple-200',
  admin: 'bg-blue-100/30 text-blue-900 dark:text-blue-200',
  doctor: 'bg-green-100/30 text-green-900 dark:text-green-200',
  pharmacy: 'bg-orange-100/30 text-orange-900 dark:text-orange-200',
  patient: 'bg-cyan-100/30 text-cyan-900 dark:text-cyan-200',
  association: 'bg-pink-100/30 text-pink-900 dark:text-pink-200',
}

const statusColors = {
  active: 'bg-green-100/30 text-green-900 dark:text-green-200',
  inactive: 'bg-gray-100/30 text-gray-900 dark:text-gray-200',
}

export function UserDetail() {
  const { id } = useParams({ from: '/_authenticated/users/$id' })
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const { data: usersData } = useAdminUsers({ page: 1, pageSize: 1000 })
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()
  const { mutate: suspendUser, isPending: isSuspending } = useSuspendUser()
  const { mutate: activateUser, isPending: isActivating } = useActivateUser()

  const user = usersData?.data.find(u => u.id === id)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Utilisateur non trouvé</h2>
          <Button onClick={() => navigate({ to: '/users' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux utilisateurs
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    deleteUser(user.id, {
      onSuccess: () => {
        toast.success('Utilisateur supprimé avec succès')
        navigate({ to: '/users' })
      },
    })
  }

  const handleDeactivate = () => {
    suspendUser(user.id, {
      onSuccess: () => {
        toast.success('Utilisateur désactivé')
        setDeactivateOpen(false)
      },
    })
  }

  const handleActivate = () => {
    activateUser(user.id, {
      onSuccess: () => {
        toast.success('Utilisateur activé')
        setDeactivateOpen(false)
      },
    })
  }

  const initials = user.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/users' })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        {/* User Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.full_name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className={roleColors[user.role]}>
                  {user.role}
                </Badge>
                <Badge
                  variant="outline"
                  className={statusColors[user.is_active ? 'active' : 'inactive']}
                >
                  {user.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* User Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.wilaya && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Localisation</p>
                    <p className="font-medium">
                      {user.commune}, {user.wilaya}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détails du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Rôle</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Créé le</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mis à jour le</p>
                  <p className="font-medium">
                    {new Date(user.updated_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mt-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg">Actions de gestion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {user.is_active ? (
              <Button
                variant="outline"
                className="text-orange-600 hover:text-orange-700"
                onClick={() => setDeactivateOpen(true)}
              >
                <Power className="mr-2 h-4 w-4" />
                Désactiver
              </Button>
            ) : (
              <Button
                variant="outline"
                className="text-green-600 hover:text-green-700"
                onClick={handleActivate}
                disabled={isActivating}
              >
                <Power className="mr-2 h-4 w-4" />
                Activer
              </Button>
            )}

            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{user.full_name}</strong> ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Cet utilisateur sera supprimé définitivement.
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.is_active ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.is_active ? (
                <>
                  Êtes-vous sûr de vouloir désactiver <strong>{user.full_name}</strong> ? Il ne
                  pourra plus accéder à la plateforme.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir activer <strong>{user.full_name}</strong> ? Il aura
                  accès à la plateforme.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div
            className={`rounded-lg p-3 text-sm ${
              user.is_active
                ? 'bg-orange-100/30 text-orange-900 dark:text-orange-200'
                : 'bg-green-100/30 text-green-900 dark:text-green-200'
            }`}
          >
            {user.is_active
              ? 'Cet utilisateur ne pourra plus accéder à la plateforme.'
              : 'Cet utilisateur aura accès à la plateforme.'}
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={user.is_active ? handleDeactivate : handleActivate}
              disabled={isSuspending || isActivating}
              className={user.is_active ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              {isSuspending || isActivating
                ? 'Traitement...'
                : user.is_active
                  ? 'Désactiver'
                  : 'Activer'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
