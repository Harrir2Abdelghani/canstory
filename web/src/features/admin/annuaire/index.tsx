import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Check, X, Edit, Trash2, Filter, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { annuaireService, AnnuaireEntry, AnnuaireRole, AnnuaireStatus } from '@/services/annuaire.service'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import wilayasData from '@/assets/Wilaya_Of_Algeria.json'
import communesData from '@/assets/Commune_Of_Algeria.json'
import { AnnuaireFormDialog } from './form-dialog'

interface Wilaya {
  id: string
  code: string
  name: string
  ar_name: string
}

interface Commune {
  id: string
  post_code: string
  name: string
  wilaya_id: string
  ar_name: string
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

const ANNUAIRE_ROLES: { value: AnnuaireRole; label: string }[] = [
  { value: 'medecin', label: 'Médecins' },
  { value: 'centre_cancer', label: 'Centres cancer' },
  { value: 'psychologue', label: 'Psychologues' },
  { value: 'laboratoire', label: 'Laboratoires' },
  { value: 'pharmacie', label: 'Pharmacies' },
  { value: 'association', label: 'Associations' },
]

export function AnnuaireManagement() {
  const [entries, setEntries] = useState<AnnuaireEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterWilaya, setFilterWilaya] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedEntry, setSelectedEntry] = useState<AnnuaireEntry | null>(null)
  const [viewEntry, setViewEntry] = useState<AnnuaireEntry | null>(null)
  const [deleteEntry, setDeleteEntry] = useState<AnnuaireEntry | null>(null)

  const wilayas = wilayasData as Wilaya[]
  const communes = communesData as Commune[]

  const wilayaNameMap = useMemo(() => {
    return new Map(wilayas.map((wilaya) => [wilaya.id, wilaya.name]))
  }, [wilayas])

  const communeNameMap = useMemo(() => {
    return new Map(communes.map((commune) => [commune.id, commune.name]))
  }, [communes])

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      setIsLoading(true)
      const data = await annuaireService.getAnnuaireEntries()
      setEntries(data)
      if (data.length === 0) {
        console.log('No annuaire entries found')
      }
    } catch (error) {
      console.error('Annuaire fetch error:', error)
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenCreateDialog = () => {
    setDialogMode('create')
    setSelectedEntry(null)
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (entry: AnnuaireEntry) => {
    setDialogMode('edit')
    setSelectedEntry(entry)
    setIsDialogOpen(true)
  }

  const handleOpenViewDialog = (entry: AnnuaireEntry) => {
    setViewEntry(entry)
    setIsViewDialogOpen(true)
  }

  const handleOpenDeleteDialog = (entry: AnnuaireEntry) => {
    setDeleteEntry(entry)
    setIsDeleteDialogOpen(true)
  }

  const resolveWilayaName = (wilayaId?: string | null) => {
    if (!wilayaId) return 'Wilaya inconnue'
    return wilayaNameMap.get(wilayaId) || wilayaId
  }

  const resolveCommuneName = (communeId?: string | null) => {
    if (!communeId) return 'Commune inconnue'
    return communeNameMap.get(communeId) || communeId
  }

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return entries.filter((entry) => {
      const matchesSearch = normalizedSearch
        ? [entry.name, entry.email, entry.wilaya, entry.commune]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedSearch))
        : true

      const matchesStatus = filterStatus === 'all' || entry.status === filterStatus
      const matchesRole = filterRole === 'all' || entry.annuaire_role === filterRole
      const matchesWilaya = filterWilaya === 'all' || entry.wilaya === filterWilaya

      return matchesSearch && matchesStatus && matchesRole && matchesWilaya
    })
  }, [entries, searchTerm, filterStatus, filterRole, filterWilaya])

  const handleStatusChange = async (id: string, status: AnnuaireStatus) => {
    try {
      const updatedEntry = await annuaireService.updateAnnuaireStatus(id, status)
      setEntries((prev) => prev.map((entry) => (entry.id === id ? updatedEntry : entry)))
      toast.success(
        status === 'approved'
          ? 'Entrée approuvée avec succès'
          : status === 'rejected'
            ? 'Entrée rejetée'
            : 'Statut mis à jour'
      )
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await annuaireService.deleteAnnuaireEntry(id)
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      toast.success('Entrée supprimée')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: AnnuaireStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className='bg-green-500 hover:bg-green-600'>Approuvé</Badge>
      case 'pending':
        return <Badge className='bg-yellow-500 hover:bg-yellow-600'>En attente</Badge>
      case 'rejected':
        return <Badge className='bg-red-500 hover:bg-red-600'>Rejeté</Badge>
    }
  }

  const stats = useMemo(() => ({
    total: entries.length,
    approved: entries.filter((e) => e.status === 'approved').length,
    pending: entries.filter((e) => e.status === 'pending').length,
    rejected: entries.filter((e) => e.status === 'rejected').length,
  }), [entries])

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
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Gestion de l'Annuaire</h1>
              <p className='text-muted-foreground mt-2'>
                Gérez les professionnels de santé et organisations
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='gap-2' onClick={handleOpenCreateDialog}>
                  <Plus className='h-4 w-4' />
                  Ajouter un utilisateur
                </Button>
              </DialogTrigger>
              <AnnuaireFormDialog
                mode={dialogMode}
                entry={selectedEntry}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={async () => {
                  setIsDialogOpen(false)
                  await fetchEntries()
                }}
                wilayas={wilayas}
                communes={communes}
              />
            </Dialog>
          </div>

          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total</CardTitle>
                <Filter className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total}</div>
                <p className='text-xs text-muted-foreground'>Entrées enregistrées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Approuvés</CardTitle>
                <Check className='h-4 w-4 text-green-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.approved}</div>
                <p className='text-xs text-muted-foreground'>Comptes actifs</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>En attente</CardTitle>
                <Filter className='h-4 w-4 text-yellow-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.pending}</div>
                <p className='text-xs text-muted-foreground'>À valider</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Rejetés</CardTitle>
                <X className='h-4 w-4 text-red-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.rejected}</div>
                <p className='text-xs text-muted-foreground'>Comptes refusés</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste de l'annuaire</CardTitle>
              <CardDescription>
                Gérez et validez les entrées de l'annuaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Rechercher par nom, email ou wilaya...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <div className='flex gap-4 flex-wrap'>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Filtrer par statut' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Tous</SelectItem>
                      <SelectItem value='approved'>Approuvés</SelectItem>
                      <SelectItem value='pending'>En attente</SelectItem>
                      <SelectItem value='rejected'>Rejetés</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Filtrer par rôle' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Tous les rôles</SelectItem>
                      {ANNUAIRE_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterWilaya} onValueChange={setFilterWilaya}>
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Filtrer par wilaya' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Toutes les wilayas</SelectItem>
                      {wilayas.map((wilaya) => (
                        <SelectItem key={wilaya.id} value={wilaya.id}>
                          {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className='py-12 text-center text-muted-foreground'>
                          Chargement de l'annuaire...
                        </TableCell>
                      </TableRow>
                    ) : filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                          Aucune entrée trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map((entry) => {
                        const wilayaDisplay = resolveWilayaName(entry.wilaya)
                        const communeDisplay = resolveCommuneName(entry.commune)
                        return (
                          <TableRow key={entry.id}>
                            <TableCell className='font-medium'>
                              <div className='flex items-center gap-2'>
                                {entry.avatar_url && (
                                  <img src={entry.avatar_url} alt={entry.name} className='w-8 h-8 rounded-full object-cover' />
                                )}
                                <div>
                                  <div>{entry.name}</div>
                                  {entry.bio && entry.bio.length > 0 && (
                                    <div className='text-xs text-muted-foreground'>
                                      {entry.bio.length > 42 ? `${entry.bio.slice(0, 42)}…` : entry.bio}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline'>{ANNUAIRE_ROLES.find(r => r.value === entry.annuaire_role)?.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>
                                <div>{wilayaDisplay}</div>
                                <div className='text-muted-foreground text-xs'>{communeDisplay}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
                            <TableCell>
                              {entry.created_at ? new Date(entry.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-2'>
                                {entry.status === 'pending' && (
                                  <>
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      className='h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50'
                                      onClick={() => handleStatusChange(entry.id, 'approved')}
                                    >
                                      <Check className='h-3 w-3' />
                                      Approuver
                                    </Button>
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      className='h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50'
                                      onClick={() => handleStatusChange(entry.id, 'rejected')}
                                    >
                                      <X className='h-3 w-3' />
                                      Rejeter
                                    </Button>
                                  </>
                                )}
                                {entry.status === 'approved' && (
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-8 gap-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                                    onClick={() => handleStatusChange(entry.id, 'pending')}
                                  >
                                    <Filter className='h-3 w-3' />
                                    Mettre en attente
                                  </Button>
                                )}
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='h-8 w-8 p-0'
                                  onClick={() => handleOpenViewDialog(entry)}
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='h-8 w-8 p-0'
                                  onClick={() => handleOpenEditDialog(entry)}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                                  onClick={() => handleOpenDeleteDialog(entry)}
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* View User Details Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        if (!open) setViewEntry(null)
        setIsViewDialogOpen(open)
      }}>
        <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {viewEntry && (
            <div className='space-y-6 py-4'>
              <div className='flex items-center gap-4'>
                {viewEntry.avatar_url ? (
                  <img
                    src={viewEntry.avatar_url}
                    alt={viewEntry.name}
                    className='w-24 h-24 rounded-full object-cover border-4 border-slate-200 shadow-lg'
                  />
                ) : (
                  <div className='w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-200 shadow-lg text-2xl font-semibold text-slate-600'>
                    {viewEntry.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className='flex-1'>
                  <h2 className='text-2xl font-bold'>{viewEntry.name}</h2>
                  <p className='text-muted-foreground'>{viewEntry.email}</p>
                  <div className='mt-3 flex gap-2'>
                    <Badge variant='outline'>{ANNUAIRE_ROLES.find(r => r.value === viewEntry.annuaire_role)?.label}</Badge>
                    {viewEntry.status === 'approved' && <Badge className='bg-green-500'>Approuvé</Badge>}
                    {viewEntry.status === 'pending' && <Badge className='bg-yellow-500'>En attente</Badge>}
                    {viewEntry.status === 'rejected' && <Badge className='bg-red-500'>Rejeté</Badge>}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
                <div>
                  <h3 className='text-sm font-semibold text-slate-700 mb-2'>Téléphone</h3>
                  <p className='text-sm'>{viewEntry.phone || 'N/A'}</p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-slate-700 mb-2'>Email</h3>
                  <p className='text-sm'>{viewEntry.email}</p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-slate-700 mb-2'>Wilaya</h3>
                  <p className='text-sm'>{wilayaNameMap.get(viewEntry.wilaya || '') || 'N/A'}</p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-slate-700 mb-2'>Commune</h3>
                  <p className='text-sm'>{communeNameMap.get(viewEntry.commune || '') || 'N/A'}</p>
                </div>
                <div className='col-span-2'>
                  <h3 className='text-sm font-semibold text-slate-700 mb-2'>Biographie</h3>
                  <p className='text-sm'>{viewEntry.bio || 'N/A'}</p>
                </div>
                <div className='col-span-2'>
                  <h3 className='text-sm font-semibold text-slate-700 mb-2'>Date d'inscription</h3>
                  <p className='text-sm'>{viewEntry.created_at ? new Date(viewEntry.created_at).toLocaleDateString('fr-FR') : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!open) setDeleteEntry(null)
        setIsDeleteDialogOpen(open)
      }}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Supprimer l'entrée</DialogTitle>
            <DialogDescription>
              Cette action est définitive. Le compte sera supprimé.
            </DialogDescription>
          </DialogHeader>
          {deleteEntry && (
            <div className='py-4 text-sm'>
              <p>
                Êtes-vous certain de vouloir supprimer <span className='font-semibold'>{deleteEntry.name}</span> ?
              </p>
            </div>
          )}
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Annuler
            </Button>
            <Button
              variant='destructive'
              disabled={isDeleting}
              onClick={async () => {
                if (!deleteEntry) return
                try {
                  setIsDeleting(true)
                  await handleDelete(deleteEntry.id)
                  setIsDeleteDialogOpen(false)
                } finally {
                  setIsDeleting(false)
                }
              }}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
