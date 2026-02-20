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
import { 
  BookOpen, 
  Search, 
  Check, 
  X, 
  Eye, 
  FileEdit, 
  Archive, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
      setActionLoading(id)
      const { data } = await apiClient.instance.put(`/admin/khibrati/publications/${id}/approve`)
      const updatedPublication = data.publication
      setPublications((prev) => prev.map((p) => (p.id === id ? updatedPublication : p)))
      if (selectedPublication?.id === id) {
        setSelectedPublication(updatedPublication)
      }
      toast.success('Publication approuvée et publiée')
    } catch (error) {
      console.error('Approve error:', error)
      toast.error("Erreur lors de l'approbation")
    } finally {
      setActionLoading(null)
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

      const updatedPublication = data.publication
      setPublications((prev) => prev.map((p) => (p.id === selectedPublication.id ? updatedPublication : p)))
      toast.success('Publication rejetée')
      setIsRejectDialogOpen(false)
      setRejectionReason('')
      setSelectedPublication(updatedPublication)
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

      const updatedPublication = data.publication
      setPublications((prev) => prev.map((p) => (p.id === selectedPublication.id ? updatedPublication : p)))
      toast.success('Demande de modification envoyée')
      setIsModifyDialogOpen(false)
      setModificationNotes('')
      setSelectedPublication(updatedPublication)
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
                        <TableRow 
                          key={pub.id}
                          className='hover:bg-muted/50 transition-colors cursor-pointer group'
                          onClick={() => {
                            setSelectedPublication(pub)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <TableCell className='font-medium max-w-sm'>
                            <div className='truncate group-hover:text-primary transition-colors'>
                              {pub.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              {pub.author?.avatar_url ? (
                                <img src={pub.author.avatar_url} alt='' className='w-7 h-7 rounded-full object-cover border border-slate-100 shadow-sm' />
                              ) : (
                                <div className='w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400'>
                                  {pub.author?.full_name?.charAt(0)}
                                </div>
                              )}
                              <span className='text-sm'>{pub.author?.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {pub.specialty ? (
                              <Badge variant='outline' className='bg-slate-50 border-slate-200 text-slate-600 font-normal'>
                                {pub.specialty.name_fr}
                              </Badge>
                            ) : (
                              <span className='text-muted-foreground text-xs italic'>N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(pub.status)}</TableCell>
                          <TableCell className='text-slate-500 text-sm'>
                            {new Date(pub.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className='text-right' onClick={(e) => e.stopPropagation()}>
                            <div className='flex items-center justify-end gap-1'>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size='icon'
                                      variant='ghost'
                                      className='h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                      onClick={() => {
                                        setSelectedPublication(pub)
                                        setIsViewDialogOpen(true)
                                      }}
                                    >
                                      <Eye className='h-4 w-4' />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Voir les détails</TooltipContent>
                                </Tooltip>

                                {['en_attente', 'en_revision', 'modifications_demandees', 'rejetee'].includes(pub.status) && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size='icon'
                                        variant='ghost'
                                        disabled={actionLoading === pub.id}
                                        className='h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50'
                                        onClick={() => handleApprove(pub.id)}
                                      >
                                        {actionLoading === pub.id ? (
                                          <div className='h-3 w-3 animate-spin rounded-full border-2 border-green-600 border-t-transparent' />
                                        ) : (
                                          <Check className='h-4 w-4' />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Approuver</TooltipContent>
                                  </Tooltip>
                                )}

                                {['en_attente', 'en_revision', 'modifications_demandees'].includes(pub.status) && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size='icon'
                                        variant='ghost'
                                        className='h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                        onClick={() => {
                                          setSelectedPublication(pub)
                                          setIsModifyDialogOpen(true)
                                        }}
                                      >
                                        <FileEdit className='h-4 w-4' />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Demander modifications</TooltipContent>
                                  </Tooltip>
                                )}

                                {pub.status !== 'rejetee' && pub.status !== 'archivee' && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size='icon'
                                        variant='ghost'
                                        className='h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50'
                                        onClick={() => {
                                          setSelectedPublication(pub)
                                          setIsRejectDialogOpen(true)
                                        }}
                                      >
                                        <X className='h-4 w-4' />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Rejeter</TooltipContent>
                                  </Tooltip>
                                )}
                              </TooltipProvider>
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
        <DialogContent className='max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-2xl'>
          <div className='bg-slate-900 p-6 text-white shrink-0 relative overflow-hidden'>
            <div className='absolute top-0 right-0 p-8 opacity-10 pointer-events-none'>
               <BookOpen className='w-32 h-32' />
            </div>
            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-2'>
                {selectedPublication && getStatusBadge(selectedPublication.status)}
                {selectedPublication?.specialty && (
                   <Badge variant='outline' className='text-white/70 border-white/20 uppercase text-[10px] tracking-widest'>
                      {selectedPublication.specialty.name_fr}
                   </Badge>
                )}
              </div>
              <DialogTitle className='text-xl md:text-2xl font-bold leading-tight'>
                {selectedPublication?.title}
              </DialogTitle>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar'>
            {/* Author Section */}
            <div className='flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100'>
              <div className='flex items-center gap-3'>
                {selectedPublication?.author?.avatar_url ? (
                  <img src={selectedPublication.author.avatar_url} alt='' className='w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm' />
                ) : (
                  <div className='w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-400'>
                    {selectedPublication?.author?.full_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className='font-bold text-slate-900 leading-none mb-1'>{selectedPublication?.author?.full_name}</h4>
                  <p className='text-xs text-slate-500 flex items-center gap-1'><Clock className='w-3 h-3' /> Soumis le {selectedPublication && new Date(selectedPublication.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1'>Vues</p>
                <div className='flex items-center gap-1 text-slate-900 font-bold justify-end'>
                   <Eye className='w-4 h-4' /> {selectedPublication?.views_count || 0}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className='space-y-3'>
              <h3 className='text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2'>
                <FileEdit className='h-4 w-4' /> Contenu de la publication
              </h3>
              <div className='text-slate-700 text-sm leading-relaxed p-4 bg-white rounded-xl border border-slate-100 whitespace-pre-wrap max-h-[300px] overflow-y-auto'>
                {selectedPublication?.content || 'Aucun contenu.'}
              </div>
            </div>

            {/* Meta Info Grid */}
            <div className='grid grid-cols-2 gap-4'>
               {selectedPublication?.publication_references && (
                  <div className='space-y-2'>
                    <h3 className='text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2'>
                      <Archive className='h-4 w-4' /> Références
                    </h3>
                    <p className='text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-snug'>
                       {selectedPublication.publication_references}
                    </p>
                  </div>
               )}
               {selectedPublication?.rejection_reason && (
                  <div className='space-y-2'>
                    <h3 className='text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2'>
                      <AlertCircle className='h-4 w-4' /> Raison du rejet
                    </h3>
                    <p className='text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 leading-snug'>
                       {selectedPublication.rejection_reason}
                    </p>
                  </div>
               )}
               {selectedPublication?.modification_notes && (
                  <div className='space-y-2'>
                    <h3 className='text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-2'>
                      <FileEdit className='h-4 w-4' /> Notes de modification
                    </h3>
                    <p className='text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100 leading-snug'>
                       {selectedPublication.modification_notes}
                    </p>
                  </div>
               )}
            </div>
          </div>

          <DialogFooter className='p-4 border-t bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0'>
            <div className='flex items-center gap-2'>
              {['en_attente', 'en_revision', 'modifications_demandees'].includes(selectedPublication?.status || '') ? (
                <>
                  <Button 
                    variant='outline' 
                    size='sm'
                    className='rounded-full text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50 h-9 px-4'
                    onClick={() => setIsRejectDialogOpen(true)}
                  >
                    Rejeter
                  </Button>
                  <Button 
                    variant='outline' 
                    size='sm'
                    className='rounded-full text-orange-600 hover:text-orange-700 border-orange-100 hover:bg-orange-50 h-9 px-4'
                    onClick={() => setIsModifyDialogOpen(true)}
                  >
                    Modifications
                  </Button>
                </>
              ) : null}
            </div>

            <div className='flex items-center gap-2'>
              {['en_attente', 'en_revision', 'modifications_demandees', 'rejetee'].includes(selectedPublication?.status || '') && (
                <Button 
                  size='sm'
                  className='rounded-full bg-emerald-600 hover:bg-emerald-700 h-9 px-6 shadow-md shadow-emerald-100'
                  onClick={() => selectedPublication && handleApprove(selectedPublication.id)}
                  disabled={actionLoading === selectedPublication?.id}
                >
                  {actionLoading === selectedPublication?.id ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2' />
                  ) : (
                    <Check className='h-4 w-4 mr-2' />
                  )}
                  {selectedPublication?.status === 'rejetee' ? 'Ré-approuver' : 'Approuver'}
                </Button>
              )}
              <Button variant='ghost' size='sm' onClick={() => setIsViewDialogOpen(false)} className='rounded-full h-9 px-4 text-slate-500'>
                Fermer
              </Button>
            </div>
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
