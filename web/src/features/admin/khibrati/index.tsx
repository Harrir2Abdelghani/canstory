import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Search, Check, X, Eye, FileEdit, Archive, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { apiClient } from '@/lib/api-client'

interface Publication {
  id: string
  title: string
  content: string
  excerpt: string | null
  featured_image: string | null
  images: string[] | null
  specialty_id: string | null
  tags: string[] | null
  publication_references: string | null
  status: 'en_attente' | 'en_revision' | 'modifications_demandees' | 'approuvee' | 'rejetee' | 'archivee'
  moderated_by: string | null
  moderated_at: string | null
  rejection_reason: string | null
  modification_notes: string | null
  views_count: number
  likes_count: number
  published_at: string | null
  created_at: string
  updated_at: string
  author: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    phone: string | null
  }
  specialty: {
    id: string
    name_fr: string
    name_ar: string
    slug: string
  } | null
  moderator: {
    id: string
    full_name: string
    email: string
  } | null
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]



export function KhibratiManagement() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false)
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [modificationNotes, setModificationNotes] = useState('')

  useEffect(() => {
    fetchPublications()
  }, [filterStatus, filterSpecialty])

  const fetchPublications = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus
      if (filterSpecialty && filterSpecialty !== 'all') params.specialty = filterSpecialty

      const { data } = await apiClient.instance.get('/admin/khibrati/publications', {
        params
      })

      // Backend now returns a flat array of publications
      setPublications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch publications error:', error)
      toast.error('Erreur lors du chargement des publications')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPublications = useMemo(() => {
    if (!searchTerm.trim()) return publications

    const normalizedSearch = searchTerm.trim().toLowerCase()
    return publications.filter((pub) =>
      [pub.title, pub.author?.full_name, pub.specialty?.name_fr]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch))
    )
  }, [publications, searchTerm])



  const handleApprove = async (id: string) => {
    try {
      const { data } = await apiClient.instance.put(`/admin/khibrati/publications/${id}/approve`)

      // Backend returns { message, publication }
      setPublications((prev) => prev.map((p) => (p.id === id ? data.publication : p)))
      toast.success('Publication approuvée avec succès')
    } catch (error) {
      console.error('Approve error:', error)
      toast.error("Erreur lors de l'approbation")
    }
  }

  const handleReject = async () => {
    if (!selectedPublication || !rejectionReason.trim()) {
      toast.error('Veuillez fournir une raison de rejet')
      return
    }

    try {
      const { data } = await apiClient.instance.put(`/admin/khibrati/publications/${selectedPublication.id}/reject`, {
        reason: rejectionReason,
      })

      setPublications((prev) => prev.map((p) => (p.id === selectedPublication.id ? data.publication : p)))
      toast.success('Publication rejetée')
      setIsRejectDialogOpen(false)
      setRejectionReason('')
      setSelectedPublication(null)
    } catch (error) {
      console.error('Reject error:', error)
      toast.error('Erreur lors du rejet')
    }
  }

  const handleRequestModifications = async () => {
    if (!selectedPublication || !modificationNotes.trim()) {
      toast.error('Veuillez fournir des notes de modification')
      return
    }

    try {
      const { data } = await apiClient.instance.put(`/admin/khibrati/publications/${selectedPublication.id}/request-modifications`, {
        notes: modificationNotes,
      })

      setPublications((prev) => prev.map((p) => (p.id === selectedPublication.id ? data.publication : p)))
      toast.success('Demande de modification envoyée')
      setIsModifyDialogOpen(false)
      setModificationNotes('')
    } catch (error) {
      console.error('Request modifications error:', error)
      toast.error('Erreur lors de la demande de modifications')
    }
  }

  const getStatusBadge = (status: Publication['status']) => {
    const statusConfig = {
      en_attente: { label: 'En attente', className: 'bg-yellow-500 hover:bg-yellow-600', icon: Clock },
      en_revision: { label: 'En révision', className: 'bg-blue-500 hover:bg-blue-600', icon: Eye },
      modifications_demandees: { label: 'Modifications demandées', className: 'bg-orange-500 hover:bg-orange-600', icon: FileEdit },
      approuvee: { label: 'Approuvée', className: 'bg-green-500 hover:bg-green-600', icon: CheckCircle2 },
      rejetee: { label: 'Rejetée', className: 'bg-red-500 hover:bg-red-600', icon: XCircle },
      archivee: { label: 'Archivée', className: 'bg-gray-500 hover:bg-gray-600', icon: Archive },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.className} gap-1`}>
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    )
  }

  const stats = useMemo(() => ({
    total: publications.length,
    en_attente: publications.filter((p) => p.status === 'en_attente').length,
    en_revision: publications.filter((p) => p.status === 'en_revision').length,
    modifications_demandees: publications.filter((p) => p.status === 'modifications_demandees').length,
    approuvee: publications.filter((p) => p.status === 'approuvee').length,
    rejetee: publications.filter((p) => p.status === 'rejetee').length,
    archivee: publications.filter((p) => p.status === 'archivee').length,
  }), [publications])

  const uniqueSpecialties = useMemo(() => {
    const specialties = publications
      .map((p) => p.specialty)
      .filter((s): s is NonNullable<typeof s> => s !== null)
    const uniqueMap = new Map(specialties.map((s) => [s.id, s]))
    return Array.from(uniqueMap.values())
  }, [publications])

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
              <h1 className='text-3xl font-bold tracking-tight'>Khibrati - Publications</h1>
              <p className='text-muted-foreground mt-2'>
                Modérez les publications médicales des professionnels
              </p>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-6'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total</CardTitle>
                <BookOpen className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total}</div>
                <p className='text-xs text-muted-foreground'>Publications</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>En attente</CardTitle>
                <Clock className='h-4 w-4 text-yellow-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.en_attente}</div>
                <p className='text-xs text-muted-foreground'>À modérer</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>En révision</CardTitle>
                <Eye className='h-4 w-4 text-blue-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.en_revision}</div>
                <p className='text-xs text-muted-foreground'>En cours</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Modifications</CardTitle>
                <FileEdit className='h-4 w-4 text-orange-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.modifications_demandees}</div>
                <p className='text-xs text-muted-foreground'>Demandées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Approuvées</CardTitle>
                <CheckCircle2 className='h-4 w-4 text-green-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.approuvee}</div>
                <p className='text-xs text-muted-foreground'>Publiées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Rejetées</CardTitle>
                <XCircle className='h-4 w-4 text-red-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.rejetee}</div>
                <p className='text-xs text-muted-foreground'>Refusées</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Publications médicales</CardTitle>
              <CardDescription>
                Modérez et validez les publications des médecins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Rechercher par titre, auteur ou spécialité...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder='Filtrer par statut' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tous les statuts</SelectItem>
                    <SelectItem value='en_attente'>En attente</SelectItem>
                    <SelectItem value='en_revision'>En révision</SelectItem>
                    <SelectItem value='modifications_demandees'>Modifications demandées</SelectItem>
                    <SelectItem value='approuvee'>Approuvée</SelectItem>
                    <SelectItem value='rejetee'>Rejetée</SelectItem>
                    <SelectItem value='archivee'>Archivée</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder='Filtrer par spécialité' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Toutes les spécialités</SelectItem>
                    {uniqueSpecialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id}>
                        {specialty.name_fr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead>Spécialité</TableHead>
                      <TableHead>Badge</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de soumission</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                          Chargement...
                        </TableCell>
                      </TableRow>
                    ) : filteredPublications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                          Aucune publication trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPublications.map((pub) => (
                        <TableRow key={pub.id}>
                          <TableCell className='font-medium max-w-md'>{pub.title}</TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              {pub.author?.avatar_url && (
                                <img src={pub.author.avatar_url} alt='' className='w-8 h-8 rounded-full object-cover' />
                              )}
                              <span>{pub.author?.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {pub.specialty ? (
                              <Badge variant='outline'>{pub.specialty.name_fr}</Badge>
                            ) : (
                              <span className='text-muted-foreground text-sm'>N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {pub.author && (
                              <Badge variant='secondary' className='gap-1'>
                                <CheckCircle2 className='h-3 w-3' />
                                Vérifié
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(pub.status)}</TableCell>
                          <TableCell>{new Date(pub.created_at).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0'
                                onClick={() => {
                                  setSelectedPublication(pub)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                              {pub.status === 'en_attente' && (
                                <>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50'
                                    onClick={() => handleApprove(pub.id)}
                                  >
                                    <Check className='h-3 w-3' />
                                    Approuver
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-8 gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                    onClick={() => {
                                      setSelectedPublication(pub)
                                      setIsModifyDialogOpen(true)
                                    }}
                                  >
                                    <FileEdit className='h-3 w-3' />
                                    Modifier
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50'
                                    onClick={() => {
                                      setSelectedPublication(pub)
                                      setIsRejectDialogOpen(true)
                                    }}
                                  >
                                    <X className='h-3 w-3' />
                                    Rejeter
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* View Publication Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Détails de la publication</DialogTitle>
            <DialogDescription>Informations complètes sur la publication</DialogDescription>
          </DialogHeader>
          {selectedPublication && (
            <div className='space-y-4'>
              <div>
                <Label className='text-sm font-semibold'>Titre</Label>
                <p className='text-sm mt-1'>{selectedPublication.title}</p>
              </div>
              <div>
                <Label className='text-sm font-semibold'>Auteur</Label>
                <div className='flex items-center gap-2 mt-1'>
                  {selectedPublication.author?.avatar_url && (
                    <img src={selectedPublication.author.avatar_url} alt='' className='w-10 h-10 rounded-full object-cover' />
                  )}
                  <div>
                    <p className='text-sm font-medium'>{selectedPublication.author?.full_name}</p>
                    <p className='text-xs text-muted-foreground'>{selectedPublication.author?.email}</p>
                  </div>
                </div>
              </div>
              <div>
                <Label className='text-sm font-semibold'>Spécialité</Label>
                <p className='text-sm mt-1'>{selectedPublication.specialty?.name_fr || 'N/A'}</p>
              </div>
              <div>
                <Label className='text-sm font-semibold'>Contenu</Label>
                <div className='text-sm mt-1 p-3 bg-muted rounded-md max-h-60 overflow-y-auto'>
                  {selectedPublication.content}
                </div>
              </div>
              {selectedPublication.publication_references && (
                <div>
                  <Label className='text-sm font-semibold'>Références</Label>
                  <p className='text-sm mt-1'>{selectedPublication.publication_references}</p>
                </div>
              )}
              {selectedPublication.rejection_reason && (
                <div>
                  <Label className='text-sm font-semibold text-red-600'>Raison du rejet</Label>
                  <p className='text-sm mt-1 text-red-600'>{selectedPublication.rejection_reason}</p>
                </div>
              )}
              {selectedPublication.modification_notes && (
                <div>
                  <Label className='text-sm font-semibold text-orange-600'>Notes de modification</Label>
                  <p className='text-sm mt-1 text-orange-600'>{selectedPublication.modification_notes}</p>
                </div>
              )}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-semibold'>Statut</Label>
                  <div className='mt-1'>{getStatusBadge(selectedPublication.status)}</div>
                </div>
                <div>
                  <Label className='text-sm font-semibold'>Date de soumission</Label>
                  <p className='text-sm mt-1'>{new Date(selectedPublication.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Publication Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la publication</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet. Le médecin verra cette raison.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='rejection-reason'>Raison du rejet *</Label>
              <Textarea
                id='rejection-reason'
                placeholder='Expliquez pourquoi cette publication est rejetée...'
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className='mt-1'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => {
              setIsRejectDialogOpen(false)
              setRejectionReason('')
            }}>
              Annuler
            </Button>
            <Button variant='destructive' onClick={handleReject}>
              Rejeter la publication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Modifications Dialog */}
      <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander des modifications</DialogTitle>
            <DialogDescription>
              Indiquez les modifications nécessaires. Le médecin verra ces notes.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='modification-notes'>Notes de modification *</Label>
              <Textarea
                id='modification-notes'
                placeholder='Décrivez les modifications nécessaires...'
                value={modificationNotes}
                onChange={(e) => setModificationNotes(e.target.value)}
                rows={4}
                className='mt-1'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => {
              setIsModifyDialogOpen(false)
              setModificationNotes('')
            }}>
              Annuler
            </Button>
            <Button onClick={handleRequestModifications}>
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
