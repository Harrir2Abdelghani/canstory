import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Archive, 
  AlertCircle,
  Clock,
  Layers,
  Users,
  Paperclip,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Info,
  ShieldCheck,
  LayoutList
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { apiClient } from '@/lib/api-client'

interface GuideStep {
  id?: string
  title: string
  description: string
  required_documents?: string
  attachment_url?: string
  external_link?: string
  notes?: string
  order_index: number
}

interface RequiredDoc {
  name: string
  description: string
  is_mandatory: boolean
}

interface Guide {
  id: string
  title: string
  slug: string
  description: string
  category_id: string
  category?: { id: string, name_fr: string }
  difficulty: 'Facile' | 'Moyen' | 'Complexe'
  estimated_time: string
  target_audience: string
  workflow_status: 'brouillon' | 'en_revision' | 'publie' | 'archive'
  required_documents_list: RequiredDoc[]
  steps_count?: number
  steps?: GuideStep[]
  updated_at: string
}

interface Category {
  id: string
  name_fr: string
}

interface Stats {
  total: number
  publie: number
  en_revision: number
  facile: number
  total_steps: number
}

const topNav = [
  { title: 'Aperçu', href: '/admin', isActive: false, disabled: false },
  { title: 'Contenu', href: '/admin/content', isActive: true, disabled: false },
  { title: 'Paramètres', href: '/admin/settings', isActive: false, disabled: false },
]

export function Nassa2ihManagement() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ total: 0, publie: 0, en_revision: 0, facile: 0, total_steps: 0 })
  
  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [guideToDelete, setGuideToDelete] = useState<Guide | null>(null)
  const [editingGuide, setEditingGuide] = useState<Partial<Guide> | null>(null)
  const [viewingGuide, setViewingGuide] = useState<Guide | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [guidesRes, catsRes, statsRes] = await Promise.all([
        apiClient.instance.get('/admin/nassa2ih/guides'),
        apiClient.instance.get('/admin/guide-categories'),
        apiClient.instance.get('/admin/nassa2ih/stats')
      ])
      setGuides(guidesRes.data.data)
      setCategories(catsRes.data)
      setStats(statsRes.data.data)
    } catch (error: any) {
      console.error('Fetch initial data error:', error)
      toast.error(`Erreur lors du chargement des données: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchGuides = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (categoryFilter !== 'all') params.append('category_id', categoryFilter)
      if (statusFilter !== 'all') params.append('workflow_status', statusFilter)
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter)
      
      const res = await apiClient.instance.get(`/admin/nassa2ih/guides?${params.toString()}`)
      setGuides(res.data.data)
    } catch (error: any) {
      console.error('Fetch guides error:', error)
      toast.error(`Erreur lors du filtrage: ${error.response?.data?.error || error.message}`)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => handleFetchGuides(), 500)
    return () => clearTimeout(timer)
  }, [search, categoryFilter, statusFilter, difficultyFilter])

  const handleViewDetails = async (guide: Guide) => {
    setViewingGuide(guide)
    setIsViewDialogOpen(true)
    setIsLoadingDetails(true)
    try {
      const res = await apiClient.instance.get(`/admin/nassa2ih/guides/${guide.id}`)
      setViewingGuide(res.data.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des détails')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleOpenDelete = (guide: Guide) => {
    setGuideToDelete(guide)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!guideToDelete) return
    setIsDeleting(true)
    try {
      await apiClient.instance.delete(`/admin/nassa2ih/guides/${guideToDelete.id}`)
      toast.success('Guide supprimé avec succès')
      setIsDeleteDialogOpen(false)
      fetchInitialData()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
      setGuideToDelete(null)
    }
  }

  const handleCreate = () => {
    setEditingGuide({
      title: '',
      description: '',
      category_id: categories[0]?.id || '',
      difficulty: 'Facile',
      estimated_time: '',
      target_audience: '',
      workflow_status: 'brouillon',
      required_documents_list: [],
      steps: []
    })
    setActiveTab('general')
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingGuide?.title || !editingGuide?.category_id) {
      toast.error('Le titre et la catégorie sont obligatoires')
      return
    }

    setIsSaving(true)
    try {
      if (editingGuide.id) {
        await apiClient.instance.put(`/admin/nassa2ih/guides/${editingGuide.id}`, editingGuide)
        toast.success('Guide mis à jour')
      } else {
        await apiClient.instance.post('/admin/nassa2ih/guides', editingGuide)
        toast.success('Guide créé')
      }
      setIsDialogOpen(false)
      fetchInitialData()
    } catch (error) {
      toast.error('Erreur lors de l’enregistrement')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async (guide: Guide) => {
    try {
      const res = await apiClient.instance.get(`/admin/nassa2ih/guides/${guide.id}`)
      setEditingGuide(res.data.data)
      setActiveTab('general')
      setIsDialogOpen(true)
    } catch (error) {
      toast.error('Erreur lors du chargement du guide')
    }
  }

  const handleAddStep = () => {
    const steps = [...(editingGuide?.steps || [])]
    steps.push({
      title: '',
      description: '',
      order_index: steps.length
    })
    setEditingGuide({ ...editingGuide!, steps })
  }

  const handleAddDoc = () => {
    const docs = [...(editingGuide?.required_documents_list || [])]
    docs.push({ name: '', description: '', is_mandatory: true })
    setEditingGuide({ ...editingGuide!, required_documents_list: docs })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'publie': return <Badge className='bg-green-100 text-green-700 border-green-200'><CheckCircle2 className='w-3 h-3 mr-1' /> Publié</Badge>
      case 'en_revision': return <Badge className='bg-blue-100 text-blue-700 border-blue-200'><Clock className='w-3 h-3 mr-1' /> Révision</Badge>
      case 'archive': return <Badge className='bg-gray-100 text-gray-700 border-gray-200'><Archive className='w-3 h-3 mr-1' /> Archivé</Badge>
      default: return <Badge className='bg-yellow-100 text-yellow-700 border-yellow-200'><AlertCircle className='w-3 h-3 mr-1' /> Brouillon</Badge>
    }
  }

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight text-black'>Nassa2ih - Guides</h1>
              <p className='text-muted-foreground mt-2'>
                Système de gestion des procédures administratives et juridiques.
              </p>
            </div>
            <Button onClick={handleCreate} className='bg-violet-600 hover:bg-violet-700 shadow-md transition-all hover:scale-105'>
              <Plus className='mr-2 h-4 w-4' /> Nouveau guide
            </Button>
          </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-none shadow-sm bg-gradient-to-br from-white to-purple-50/50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-purple-800'>Total Guides</CardTitle>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <FileText className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-950'>{stats.total}</div>
          </CardContent>
        </Card>
        <Card className='border-none shadow-sm bg-gradient-to-br from-white to-emerald-50/50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-emerald-800'>Publiés</CardTitle>
            <div className='p-2 bg-emerald-100 rounded-lg'>
              <CheckCircle2 className='h-4 w-4 text-emerald-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-950'>{stats.publie}</div>
          </CardContent>
        </Card>
        <Card className='border-none shadow-sm bg-gradient-to-br from-white to-amber-50/50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-amber-800'>Étapes Totales</CardTitle>
            <div className='p-2 bg-amber-100 rounded-lg'>
              <Layers className='h-4 w-4 text-amber-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-amber-950'>{stats.total_steps}</div>
          </CardContent>
        </Card>
        <Card className='border-none shadow-sm bg-gradient-to-br from-white to-violet-50/50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-violet-800'>Faciles</CardTitle>
            <div className='p-2 bg-violet-100 rounded-lg'>
              <Users className='h-4 w-4 text-violet-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-violet-950'>{stats.facile}</div>
          </CardContent>
        </Card>
      </div>

      <Card className='border-none shadow-md overflow-hidden'>
        <CardHeader className='border-b bg-white pb-6'>
          <div className='flex flex-col xl:flex-row xl:items-center gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Rechercher par titre ou description...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10 border-slate-200 focus-visible:ring-violet-500 rounded-full bg-slate-50/50 focus:bg-white transition-all'
              />
            </div>
            <div className='flex flex-wrap items-center gap-3'>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className='w-full sm:w-[200px] border-slate-200 rounded-full bg-slate-50/50'>
                  <SelectValue placeholder='Catégorie' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Toutes les catégories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name_fr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-full sm:w-[150px] border-slate-200 rounded-full bg-slate-50/50'>
                  <SelectValue placeholder='Statut' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tous les statuts</SelectItem>
                  <SelectItem value='brouillon'>Brouillon</SelectItem>
                  <SelectItem value='en_revision'>En révision</SelectItem>
                  <SelectItem value='publie'>Publié</SelectItem>
                  <SelectItem value='archive'>Archivé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className='w-full sm:w-[150px] border-slate-200 rounded-full bg-slate-50/50'>
                  <SelectValue placeholder='Difficulté' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Difficulté</SelectItem>
                  <SelectItem value='Facile'>Facile</SelectItem>
                  <SelectItem value='Moyen'>Moyen</SelectItem>
                  <SelectItem value='Complexe'>Complexe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0 overflow-x-auto'>
          <Table>
            <TableHeader className='bg-slate-50/50'>
              <TableRow className='hover:bg-transparent border-b border-slate-100'>
                <TableHead className='font-bold text-slate-800 py-4'>Titre</TableHead>
                <TableHead className='font-bold text-slate-800 py-4'>Catégorie</TableHead>
                <TableHead className='font-bold text-slate-800 py-4'>Étapes</TableHead>
                <TableHead className='font-bold text-slate-800 py-4'>Difficulté</TableHead>
                <TableHead className='font-bold text-slate-800 py-4'>Statut</TableHead>
                <TableHead className='font-bold text-slate-800 py-4'>Mise à jour</TableHead>
                <TableHead className='text-right font-bold text-slate-800 py-4 px-6'>Actions</TableHead>
              </TableRow>
            </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-12'>
                        <div className='flex flex-col items-center gap-2'>
                          <div className='h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent'></div>
                          <span className='text-muted-foreground'>Chargement des guides...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : guides.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-12 text-muted-foreground space-y-2'>
                        <FileText className='h-12 w-12 text-slate-200 mx-auto' />
                        <p>Aucun guide trouvé</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    guides.map((guide) => (
                      <TableRow 
                        key={guide.id} 
                        className='hover:bg-violet-50/30 transition-colors cursor-pointer group border-b border-slate-50'
                        onClick={() => handleViewDetails(guide)}
                      >
                        <TableCell className='font-medium py-4 group-hover:text-violet-600 transition-colors'>{guide.title}</TableCell>
                        <TableCell>
                          <Badge variant='secondary' className='bg-violet-50 text-violet-700 hover:bg-violet-100 border-none transition-colors'>
                            {guide.category?.name_fr || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1.5 text-slate-600 font-medium'>
                            <Layers className='w-4 h-4 text-violet-500' />
                            {guide.steps_count || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className={
                            guide.difficulty === 'Facile' ? 'text-emerald-600 border-emerald-200 bg-emerald-50/30' :
                            guide.difficulty === 'Moyen' ? 'text-amber-600 border-amber-200 bg-amber-50/30' :
                            'text-rose-600 border-rose-200 bg-rose-50/30'
                          }>
                            {guide.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(guide.workflow_status)}</TableCell>
                        <TableCell className='text-slate-500 text-sm'>
                          {new Date(guide.updated_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className='text-right py-4 px-6' onClick={(e) => e.stopPropagation()}>
                          <div className='flex items-center justify-end gap-2'>
                            <Button size='icon' variant='ghost' className='h-9 w-9 text-violet-600 hover:bg-violet-100 hover:text-violet-700 rounded-full' onClick={() => handleEdit(guide)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-9 w-9 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full'
                              onClick={() => handleOpenDelete(guide)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-xl'>
          <div className='bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold tracking-tight text-white mb-1'>
                {editingGuide?.id ? 'Modifier le guide' : 'Nouveau guide'}
              </DialogTitle>
              <DialogDescription className='text-purple-100'>
                Configurez les détails, les étapes et les documents requis pour ce guide administratif.
              </DialogDescription>
            </DialogHeader>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className='flex-1 flex flex-col min-h-0'>
            <div className='px-6 border-b bg-white pt-2'>
              <TabsList className='flex w-full justify-start gap-8 bg-transparent p-0 h-auto rounded-none'>
                <TabsTrigger 
                  value='general' 
                  className='rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-violet-600 px-1 pb-3 transition-all'
                >
                  <FileText className='w-4 h-4 mr-2' /> Informations Générales
                </TabsTrigger>
                <TabsTrigger 
                  value='procedure' 
                  className='rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-violet-600 px-1 pb-3 transition-all'
                >
                  <Layers className='w-4 h-4 mr-2' /> Étapes de la Procédure
                </TabsTrigger>
                <TabsTrigger 
                  value='documents' 
                  className='rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-violet-600 px-1 pb-3 transition-all'
                >
                  <Paperclip className='w-4 h-4 mr-2' /> Documents Requis
                </TabsTrigger>
              </TabsList>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200'>
              <TabsContent value='general' className='space-y-6 mt-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label className='text-slate-700 font-semibold'>Titre du guide</Label>
                    <Input 
                      value={editingGuide?.title} 
                      onChange={e => setEditingGuide({...editingGuide!, title: e.target.value})}
                      placeholder='Ex: Demande de carte Chifa'
                      className='border-slate-200 focus-visible:ring-violet-500 rounded-lg shadow-sm transition-all focus:border-violet-300'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-slate-700 font-semibold'>Catégorie</Label>
                    <Select 
                      value={editingGuide?.category_id} 
                      onValueChange={v => setEditingGuide({...editingGuide!, category_id: v})}
                    >
                      <SelectTrigger className='border-slate-200 rounded-lg shadow-sm'>
                        <SelectValue placeholder='Sélectionner une catégorie' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name_fr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-slate-700 font-semibold'>Description (Courte)</Label>
                  <Textarea 
                    value={editingGuide?.description} 
                    onChange={e => setEditingGuide({...editingGuide!, description: e.target.value})}
                    placeholder='Expliquez brièvement l’objectif de cette procédure...'
                    className='border-slate-200 min-h-[100px] rounded-lg shadow-sm transition-all focus:border-violet-300'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                  <div className='space-y-2'>
                    <Label className='text-slate-700 font-semibold'>Difficulté</Label>
                    <Select 
                      value={editingGuide?.difficulty} 
                      onValueChange={(v: any) => setEditingGuide({...editingGuide!, difficulty: v})}
                    >
                      <SelectTrigger className='border-slate-200 rounded-lg'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Facile'>Facile</SelectItem>
                        <SelectItem value='Moyen'>Moyen</SelectItem>
                        <SelectItem value='Complexe'>Complexe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-slate-700 font-semibold'>Temps estimé</Label>
                    <div className='relative'>
                      <Clock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                      <Input 
                        value={editingGuide?.estimated_time} 
                        onChange={e => setEditingGuide({...editingGuide!, estimated_time: e.target.value})}
                        placeholder='Ex: 15 jours'
                        className='pl-10 border-slate-200 rounded-lg'
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-slate-700 font-semibold'>Public cible</Label>
                    <div className='relative'>
                      <Users className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                      <Input 
                        value={editingGuide?.target_audience} 
                        onChange={e => setEditingGuide({...editingGuide!, target_audience: e.target.value})}
                        placeholder='Ex: Assurés sociaux'
                        className='pl-10 border-slate-200 rounded-lg'
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                  <Label className='text-slate-700 font-semibold'>Statut de publication</Label>
                  <Select 
                    value={editingGuide?.workflow_status} 
                    onValueChange={(v: any) => setEditingGuide({...editingGuide!, workflow_status: v})}
                  >
                    <SelectTrigger className='border-slate-200 bg-white rounded-lg shadow-sm w-full sm:w-[250px]'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='brouillon'>Brouillon</SelectItem>
                      <SelectItem value='en_revision'>En révision</SelectItem>
                      <SelectItem value='publie'>🚀 Publié</SelectItem>
                      <SelectItem value='archive'>📦 Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-2'>
                    Seuls les guides <span className='text-emerald-600'>"Publié"</span> sont visibles par les utilisateurs finaux.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value='procedure' className='space-y-6 mt-0'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center bg-violet-50 p-4 rounded-xl border border-violet-100 gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold'>
                      {editingGuide?.steps?.length || 0}
                    </div>
                    <div>
                      <h4 className='text-sm font-bold text-violet-900'>Étapes définies</h4>
                      <p className='text-xs text-violet-700/70'>Organisez le processus pas à pas</p>
                    </div>
                  </div>
                  <Button size='sm' onClick={handleAddStep} className='bg-violet-600 hover:bg-violet-700 shadow-sm'>
                    <Plus className='w-4 h-4 mr-2' /> Ajouter une étape
                  </Button>
                </div>

                <div className='space-y-4 pb-4'>
                  {(editingGuide?.steps || []).length === 0 ? (
                    <div className='text-center py-12 border-2 border-dashed rounded-2xl border-slate-200 bg-slate-50/50'>
                      <Layers className='h-12 w-12 text-slate-300 mx-auto mb-3' />
                      <p className='text-slate-500 font-medium'>Aucune étape pour le moment</p>
                      <p className='text-xs text-slate-400'>Cliquez sur le bouton ci-dessus pour commencer.</p>
                    </div>
                  ) : (
                    (editingGuide?.steps || []).map((step, index) => (
                      <div key={index} className='group border border-slate-100 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all hover:border-violet-200 relative'>
                        <div className='flex justify-between items-start gap-4'>
                          <div className='flex-1 space-y-4'>
                            <div className='flex items-center gap-3'>
                              <span className='bg-slate-100 text-slate-600 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black'>
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <Input 
                                value={step.title} 
                                placeholder='Titre de l’étape'
                                className='font-bold border-none bg-transparent p-0 text-lg focus-visible:ring-0 placeholder:text-slate-300'
                                onChange={e => {
                                  const steps = [...(editingGuide?.steps || [])]
                                  steps[index].title = e.target.value
                                  setEditingGuide({...editingGuide!, steps})
                                }}
                              />
                            </div>
                            <Textarea 
                              value={step.description}
                              placeholder='Description détaillée de ce qu’il faut faire...'
                              className='min-h-[80px] text-sm border-slate-100 bg-slate-50/50 focus:bg-white transition-colors rounded-lg focus:border-violet-300'
                              onChange={e => {
                                const steps = [...(editingGuide?.steps || [])]
                                steps[index].description = e.target.value
                                setEditingGuide({...editingGuide!, steps})
                              }}
                            />
                            
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                              <div className='space-y-1.5'>
                                <Label className='text-[11px] uppercase tracking-wider font-bold text-slate-400'>Pièces jointes requis</Label>
                                <Input 
                                  value={step.required_documents || ''}
                                  placeholder='Ex: Photo d’identité, CIN'
                                  className='text-xs border-slate-200'
                                  onChange={e => {
                                    const steps = [...(editingGuide?.steps || [])]
                                    steps[index].required_documents = e.target.value
                                    setEditingGuide({...editingGuide!, steps})
                                  }}
                                />
                              </div>
                              <div className='space-y-1.5'>
                                <Label className='text-[11px] uppercase tracking-wider font-bold text-slate-400'>Lien externe (URL)</Label>
                                <div className='relative'>
                                  <ExternalLink className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400' />
                                  <Input 
                                    value={step.external_link || ''}
                                    placeholder='https://...'
                                    className='text-xs pl-8 border-slate-200'
                                    onChange={e => {
                                      const steps = [...(editingGuide?.steps || [])]
                                      steps[index].external_link = e.target.value
                                      setEditingGuide({...editingGuide!, steps})
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg group-hover:bg-rose-50'
                              onClick={() => {
                                const steps = (editingGuide?.steps || []).filter((_, i) => i !== index)
                                setEditingGuide({...editingGuide!, steps})
                              }}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-8 w-8 rounded-lg'
                              disabled={index === 0}
                              onClick={() => {
                                const steps = [...(editingGuide?.steps || [])]
                                const temp = steps[index]
                                steps[index] = steps[index - 1]
                                steps[index - 1] = temp
                                setEditingGuide({...editingGuide!, steps})
                              }}
                            >
                              <ChevronUp className='h-4 w-4' />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-8 w-8 rounded-lg'
                              disabled={index === (editingGuide?.steps || []).length - 1}
                              onClick={() => {
                                const steps = [...(editingGuide?.steps || [])]
                                const temp = steps[index]
                                steps[index] = steps[index + 1]
                                steps[index + 1] = temp
                                setEditingGuide({...editingGuide!, steps})
                              }}
                            >
                              <ChevronDown className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value='documents' className='space-y-6 mt-0'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center bg-violet-50 p-4 rounded-xl border border-violet-100 gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold'>
                      {editingGuide?.required_documents_list?.length || 0}
                    </div>
                    <div>
                      <h4 className='text-sm font-bold text-violet-900'>Checklist Documents</h4>
                      <p className='text-xs text-violet-700/70'>Liste globale des pièces à préparer</p>
                    </div>
                  </div>
                  <Button size='sm' onClick={handleAddDoc} variant='outline' className='border-violet-500 text-violet-600 hover:bg-violet-50'>
                    <Plus className='w-4 h-4 mr-2' /> Nouveau document
                  </Button>
                </div>

                <div className='space-y-4 pb-4'>
                  {(editingGuide?.required_documents_list || []).length === 0 ? (
                    <div className='text-center py-12 border-2 border-dashed rounded-2xl border-slate-200 bg-slate-50/50'>
                      <Paperclip className='h-12 w-12 text-slate-300 mx-auto mb-3' />
                      <p className='text-slate-500 font-medium'>Aucun document requis listé</p>
                      <p className='text-xs text-slate-400'>Ajoutez les documents que l'utilisateur doit avoir avant de commencer.</p>
                    </div>
                  ) : (
                    (editingGuide?.required_documents_list || []).map((doc, index) => (
                      <div key={index} className='flex items-start gap-4 border border-slate-100 rounded-xl p-4 bg-white shadow-sm hover:border-violet-200 transition-all'>
                        <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                          <div className='space-y-1.5'>
                            <Label className='text-[11px] uppercase tracking-wider font-bold text-slate-400'>Nom du document</Label>
                            <Input 
                              value={doc.name} 
                              placeholder='Ex: Acte de naissance'
                              className='border-slate-200 rounded-lg'
                              onChange={e => {
                                const docs = [...(editingGuide?.required_documents_list || [])]
                                docs[index].name = e.target.value
                                setEditingGuide({...editingGuide!, required_documents_list: docs})
                              }}
                            />
                          </div>
                          <div className='space-y-1.5'>
                            <Label className='text-[11px] uppercase tracking-wider font-bold text-slate-400'>Précisions (Optionnel)</Label>
                            <Input 
                              value={doc.description}
                              placeholder='Ex: Original de moins de 3 mois'
                              className='border-slate-200 rounded-lg'
                              onChange={e => {
                                const docs = [...(editingGuide?.required_documents_list || [])]
                                docs[index].description = e.target.value
                                setEditingGuide({...editingGuide!, required_documents_list: docs})
                              }}
                            />
                          </div>
                        </div>
                        <div className='flex flex-col items-center gap-3 pt-6'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox 
                              id={`mandatory-${index}`}
                              checked={doc.is_mandatory}
                              onCheckedChange={(checked) => {
                                const docs = [...(editingGuide?.required_documents_list || [])]
                                docs[index].is_mandatory = checked as boolean
                                setEditingGuide({...editingGuide!, required_documents_list: docs})
                              }}
                            />
                            <Label htmlFor={`mandatory-${index}`} className='text-xs font-bold text-slate-500 cursor-pointer'>Obligatoire</Label>
                          </div>
                          <Button 
                            size='icon' 
                            variant='ghost' 
                            className='h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg'
                            onClick={() => {
                              const docs = (editingGuide?.required_documents_list || []).filter((_, i) => i !== index)
                              setEditingGuide({...editingGuide!, required_documents_list: docs})
                            }}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

            <DialogFooter className='p-6 border-t bg-slate-50 gap-3'>
              <Button 
                variant='outline' 
                onClick={() => {
                  if (activeTab === 'general') {
                    setIsDialogOpen(false)
                  } else {
                    const steps = ['general', 'procedure', 'documents'];
                    setActiveTab(steps[steps.indexOf(activeTab) - 1]);
                  }
                }} 
                className='rounded-full border-slate-300 px-6' 
                disabled={isSaving}
              >
                {activeTab === 'general' ? 'Annuler' : 'Précédent'}
              </Button>
              <Button 
                disabled={isSaving} 
                onClick={() => {
                  if (activeTab === 'general' && (!editingGuide?.title || !editingGuide?.category_id)) {
                    toast.error('Le titre et la catégorie sont obligatoires');
                    return;
                  }
                  if (activeTab !== 'documents') {
                    const steps = ['general', 'procedure', 'documents'];
                    setActiveTab(steps[steps.indexOf(activeTab) + 1]);
                  } else {
                    handleSave();
                  }
                }} 
                className='bg-violet-600 hover:bg-violet-700 shadow-md rounded-full px-8'
              >
                {isSaving ? (
                  <>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2'></div>
                    Enregistrement...
                  </>
                ) : (
                  activeTab === 'documents' ? (editingGuide?.id ? 'Mettre à jour' : 'Créer le guide') : 'Suivant'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog - Simplified & Clean */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className='max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-xl rounded-2xl'>
            <div className='p-6 border-b bg-white flex items-center justify-between'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary' className='bg-violet-50 text-violet-600 rounded-md text-[10px] font-bold px-2 py-0'>
                    {categories.find(c => c.id === viewingGuide?.category_id)?.name_fr || 'Guide'}
                  </Badge>
                  <Badge variant='outline' className='rounded-md text-[10px] font-bold px-2 py-0'>
                    {viewingGuide?.difficulty}
                  </Badge>
                </div>
                <DialogTitle className='text-2xl font-bold tracking-tight text-slate-900'>
                  {viewingGuide?.title}
                </DialogTitle>
              </div>
              <Button 
                variant='outline' 
                size='sm' 
                onClick={() => {
                  setIsViewDialogOpen(false)
                  if (viewingGuide) handleEdit(viewingGuide)
                }}
                className='rounded-full gap-2 border-slate-200'
              >
                <Edit className='h-4 w-4' /> Modifier
              </Button>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/20'>
              <div className='space-y-4'>
                <p className='text-slate-600 leading-relaxed'>
                  {viewingGuide?.description}
                </p>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-slate-100 py-4'>
                  <div className='space-y-1'>
                    <span className='text-[10px] font-bold text-slate-400 uppercase'>Temps estimé</span>
                    <p className='text-sm font-semibold flex items-center gap-2 text-slate-700'><Clock className='w-3.5 h-3.5' /> {viewingGuide?.estimated_time || 'N/A'}</p>
                  </div>
                  <div className='space-y-1'>
                    <span className='text-[10px] font-bold text-slate-400 uppercase'>Public cible</span>
                    <p className='text-sm font-semibold flex items-center gap-2 text-slate-700'><Users className='w-3.5 h-3.5' /> {viewingGuide?.target_audience || 'Tout public'}</p>
                  </div>
                  <div className='space-y-1'>
                    <span className='text-[10px] font-bold text-slate-400 uppercase'>Procédures</span>
                    <p className='text-sm font-semibold flex items-center gap-2 text-slate-700'><Layers className='w-3.5 h-3.5' /> {viewingGuide?.steps_count || 0} étapes</p>
                  </div>
                </div>
              </div>

              {isLoadingDetails ? (
                <div className='flex flex-col items-center justify-center py-12 gap-4'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent'></div>
                  <p className='text-sm font-medium text-slate-400'>Chargement des étapes...</p>
                </div>
              ) : (
                <div className='space-y-8'>
                  {/* Steps */}
                  {viewingGuide?.steps && viewingGuide.steps.length > 0 && (
                    <div className='space-y-4'>
                      <h4 className='text-sm font-bold text-slate-900 flex items-center gap-2'><LayoutList className='w-4 h-4' /> Étapes à suivre</h4>
                      <div className='space-y-3'>
                        {viewingGuide.steps.sort((a,b) => a.order_index - b.order_index).map((step, i) => (
                          <div key={i} className='bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2'>
                            <div className='flex items-start gap-3'>
                              <div className='bg-slate-900 text-white w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-black'>
                                {i + 1}
                              </div>
                              <div className='space-y-1'>
                                <h5 className='font-bold text-slate-800'>{step.title}</h5>
                                <p className='text-sm text-slate-500 leading-relaxed'>{step.description}</p>
                              </div>
                            </div>
                            {(step.required_documents || step.external_link) && (
                              <div className='flex gap-4 pt-1 ml-9'>
                                {step.required_documents && (
                                  <span className='text-[11px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded flex items-center gap-1'>
                                    <Paperclip className='w-3 h-3' /> {step.required_documents}
                                  </span>
                                )}
                                {step.external_link && (
                                  <a href={step.external_link} target='_blank' rel='noopener' className='text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1'>
                                    <ExternalLink className='w-3 h-3' /> Lien externe
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Documents */}
                  {viewingGuide?.required_documents_list && viewingGuide.required_documents_list.length > 0 && (
                    <div className='space-y-4'>
                      <h4 className='text-sm font-bold text-slate-900 flex items-center gap-2'><ShieldCheck className='w-4 h-4' /> Documents requis</h4>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {viewingGuide.required_documents_list.map((doc, i) => (
                          <div key={i} className='bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div className={`p-1.5 rounded ${doc.is_mandatory ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                                <Paperclip className='w-3.5 h-3.5' />
                              </div>
                              <div className='leading-tight'>
                                <p className='text-sm font-bold text-slate-700'>{doc.name}</p>
                                <p className='text-[10px] text-slate-400'>{doc.description || 'Global'}</p>
                              </div>
                            </div>
                            {doc.is_mandatory && <Badge className='bg-red-50 text-red-600 border-none text-[8px] font-black uppercase'>Mandat</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className='p-4 border-t bg-white flex justify-end'>
               <Button onClick={() => setIsViewDialogOpen(false)} className='rounded-full px-8'>Fermer</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='sm:max-w-[400px] p-6 border-none shadow-2xl rounded-2xl'>
            <div className='flex flex-col items-center text-center space-y-4'>
              <div className='w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center'>
                <AlertCircle className='w-8 h-8 text-rose-500' />
              </div>
              <div className='space-y-1.5'>
                <DialogTitle className='text-xl font-bold text-slate-900'>Confirmation de suppression</DialogTitle>
                <p className='text-slate-500 text-sm leading-relaxed'>
                   Êtes-vous sûr de vouloir supprimer ce guide ? <br/>
                   <span className='font-bold text-slate-700 mt-2 block'>"{guideToDelete?.title}"</span>
                </p>
              </div>
            </div>
            <DialogFooter className='mt-6 gap-3 sm:gap-0'>
              <Button variant='ghost' onClick={() => setIsDeleteDialogOpen(false)} className='rounded-full flex-1' disabled={isDeleting}>
                Annuler
              </Button>
              <Button 
                variant='destructive' 
                onClick={handleConfirmDelete} 
                className='rounded-full flex-1 gap-2'
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                ) : (
                  <Trash2 className='h-4 w-4' />
                )}
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
