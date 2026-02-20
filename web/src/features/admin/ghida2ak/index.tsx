import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Archive, 
  AlertCircle,
  MoreHorizontal,
  ChefHat,
  Calendar,
  UserCheck,
  ShieldAlert,
  Trash2,
  Info,
  Clock,
  Salad
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { apiClient } from '@/lib/api-client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Recipe {
  id?: string
  title: string
  ingredients: string[]
  instructions: string[]
  nutrition_benefits: string
  cancer_type: string
  image_url?: string
  calories_field?: number
}

interface NutritionGuide {
  id: string
  title: string
  cancer_type: string
  category_id?: string
  category?: {
    id: string
    name_fr: string
    name_ar: string
    slug: string
  }
  workflow_status: 'brouillon' | 'en_revision' | 'publie' | 'archive'
  overview: string
  content: any
  recommended_foods: string[]
  foods_to_avoid: string[]
  nutritional_advice: string[]
  special_notes?: string
  medical_references?: string
  last_reviewed_date?: string
  validated_by?: string
  is_sensitive_content: boolean
  updated_at: string
  author?: {
    full_name: string
  }
  recipes: Recipe[]
}

const cancerTypes = [
  { value: 'breast', label: 'Sein' },
  { value: 'lung', label: 'Poumon' },
  { value: 'colon', label: 'Colon' },
  { value: 'prostate', label: 'Prostate' },
  { value: 'uterus', label: 'Utérus' },
  { value: 'other', label: 'Autre' },
]

// Categories will be fetched from the database

const statusConfig = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: FileText },
  en_revision: { label: 'En révision', color: 'bg-blue-100 text-blue-800', icon: Eye },
  publie: { label: 'Publié', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  archive: { label: 'Archivé', color: 'bg-amber-100 text-amber-800', icon: Archive },
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

export function Ghida2akManagement() {
  const [guides, setGuides] = useState<NutritionGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cancerFilter, setCancerFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    publie: 0,
    total_recipes: 0,
    cancer_types_covered: 0
  })
  const [nutritionCategories, setNutritionCategories] = useState<any[]>([])

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [guideToDelete, setGuideToDelete] = useState<NutritionGuide | null>(null)
  const [editingGuide, setEditingGuide] = useState<Partial<NutritionGuide> | null>(null)
  const [viewingGuide, setViewingGuide] = useState<NutritionGuide | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [guidesRes, statsRes, categoriesRes] = await Promise.all([
        apiClient.instance.get('/admin/nutrition/guides'),
        apiClient.instance.get('/admin/nutrition/stats'),
        apiClient.instance.get('/admin/nutrition/categories')
      ])
      setGuides(guidesRes.data.data || [])
      setStats(statsRes.data.data)
      setNutritionCategories(categoriesRes.data.data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guide.overview?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCancer = cancerFilter === 'all' || guide.cancer_type === cancerFilter
      const matchesCategory = categoryFilter === 'all' || guide.category_id === categoryFilter
      const matchesStatus = statusFilter === 'all' || guide.workflow_status === statusFilter
      
      return matchesSearch && matchesCancer && matchesCategory && matchesStatus
    })
  }, [guides, searchTerm, cancerFilter, categoryFilter, statusFilter])

  const handleOpenDialog = async (guide?: NutritionGuide) => {
    if (guide) {
      try {
        const { data } = await apiClient.instance.get(`/admin/nutrition/guides/${guide.id}`)
        setEditingGuide(data.data)
      } catch (error) {
        toast.error('Erreur lors du chargement des détails')
        return
      }
    } else {
      setEditingGuide({
        title: '',
        cancer_type: 'other',
        category_id: nutritionCategories[0]?.id || '',
        workflow_status: 'brouillon',
        overview: '',
        content: {},
        recommended_foods: [],
        foods_to_avoid: [],
        nutritional_advice: [],
        is_sensitive_content: false,
        recipes: []
      })
    }
    setActiveTab('general')
    setIsDialogOpen(true)
  }

  const handleViewDetails = async (guide: NutritionGuide) => {
    try {
      const { data } = await apiClient.instance.get(`/admin/nutrition/guides/${guide.id}`)
      setViewingGuide(data.data)
      setIsViewDialogOpen(true)
    } catch (error) {
      toast.error('Erreur lors du chargement des détails')
    }
  }

  const handleSave = async () => {
    if (!editingGuide?.title || !editingGuide?.cancer_type) {
      toast.error('Veuillez remplir les champs obligatoires')
      return
    }

    setIsSaving(true)
    try {
      // Remove joined objects before sending to API
      const { category, author, ...payload } = editingGuide as any

      if (editingGuide.id) {
        await apiClient.instance.put(`/admin/nutrition/guides/${editingGuide.id}`, payload)
        toast.success('Guide mis à jour')
      } else {
        await apiClient.instance.post('/admin/nutrition/guides', payload)
        toast.success('Guide créé avec succès')
      }
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Save error:', error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!guideToDelete) return
    
    setIsDeleting(true)
    try {
      await apiClient.instance.delete(`/admin/nutrition/guides/${guideToDelete.id}`)
      toast.success('Contenu supprimé avec succès')
      setIsDeleteDialogOpen(false)
      setGuideToDelete(null)
      fetchData()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiClient.instance.put(`/admin/nutrition/guides/${id}/status`, { workflow_status: status })
      toast.success('Statut mis à jour')
      fetchData()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

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
              <h1 className='text-3xl font-bold tracking-tight'>Ghida2ak - Nutrition</h1>
              <p className='text-muted-foreground mt-2'>
                Système de gestion nutritionnelle médicale par type de cancer
              </p>
            </div>
            <Button className='gap-2' onClick={() => handleOpenDialog()}>
              <Plus className='h-4 w-4' />
              Nouveau contenu
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Contenus</CardTitle>
                <FileText className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total}</div>
                <p className='text-xs text-muted-foreground'>{stats.publie} publiés</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Cancers Couverts</CardTitle>
                < ShieldAlert className='h-4 w-4 text-primary' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.cancer_types_covered}</div>
                <p className='text-xs text-muted-foreground'>Types de cancer</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Recettes Santé</CardTitle>
                <ChefHat className='h-4 w-4 text-green-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total_recipes}</div>
                <p className='text-xs text-muted-foreground'>Recettes validées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Statut Actuel</CardTitle>
                <AlertCircle className='h-4 w-4 text-amber-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{guides.filter(g => g.workflow_status === 'en_revision').length}</div>
                <p className='text-xs text-muted-foreground'>En révision</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Guides & Recommandations</CardTitle>
                  <CardDescription>Gérez les sections médicales et les conseils nutritionnels</CardDescription>
                </div>
                <div className='flex items-center gap-2'>
                  <Select value={cancerFilter} onValueChange={setCancerFilter}>
                    <SelectTrigger className='w-[150px]'>
                      <SelectValue placeholder='Type de cancer' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Tous les cancers</SelectItem>
                      {cancerTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className='w-[150px]'>
                      <SelectValue placeholder='Catégorie' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Toutes catégories</SelectItem>
                      {nutritionCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_fr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='w-[150px]'>
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Rechercher par titre ou contenu...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div className='rounded-md border overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type de cancer</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière MAJ</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className='text-center py-8'>Chargement...</TableCell></TableRow>
                    ) : filteredGuides.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>Aucun contenu trouvé</TableCell></TableRow>
                    ) : (
                      filteredGuides.map((item) => (
                        <TableRow 
                          key={item.id} 
                          className='hover:bg-muted/50 transition-colors cursor-pointer group'
                          onClick={() => handleViewDetails(item)}
                        >
                          <TableCell>
                            <Badge variant='outline' className='capitalize'>
                              {cancerTypes.find(t => t.value === item.cancer_type)?.label || item.cancer_type}
                            </Badge>
                          </TableCell>
                          <TableCell className='font-medium group-hover:text-primary transition-colors'>{item.title}</TableCell>
                          <TableCell>{item.category?.name_fr || 'Sans catégorie'}</TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig[item.workflow_status].color} border-none`}>
                              <div className='flex items-center gap-1'>
                                {(() => {
                                  const Icon = statusConfig[item.workflow_status].icon
                                  return <Icon className='h-3 w-3' />
                                })()}
                                {statusConfig[item.workflow_status].label}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className='text-right' onClick={(e) => e.stopPropagation()}>
                            <div className='flex items-center justify-end gap-1'>
                              <Button size='icon' variant='ghost' onClick={() => handleOpenDialog(item)}>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size='icon' variant='ghost'>
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'en_revision')}>Marquer En révision</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'publie')}>Publier</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'archive')}>Archiver</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setGuideToDelete(item)
                                    setIsDeleteDialogOpen(true)
                                  }} className='text-red-600 font-medium'>
                                    <Trash2 className='h-4 w-4 mr-2' />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-red-600'>
                <ShieldAlert className='h-5 w-5' />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription className='py-3'>
                Êtes-vous sûr de vouloir supprimer le guide <span className='font-bold text-foreground'>"{guideToDelete?.title}"</span> ? 
                Cette action est irréversible et supprimera également toutes les recettes associées.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className='gap-2 sm:gap-0 font-medium'>
              <Button 
                variant='ghost' 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button 
                variant='destructive' 
                onClick={handleDelete}
                disabled={isDeleting}
                className='gap-2'
              >
                {isDeleting ? (
                   <div className='h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full' />
                ) : (
                  <Trash2 className='h-4 w-4' />
                )}
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0'>
            <DialogHeader className='p-6 bg-primary/5 border-b'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='bg-background uppercase text-[10px] font-bold tracking-wider'>
                      {cancerTypes.find(t => t.value === viewingGuide?.cancer_type)?.label || viewingGuide?.cancer_type}
                    </Badge>
                    <Badge className={`${viewingGuide ? statusConfig[viewingGuide.workflow_status].color : ''} border-none text-[10px] font-bold uppercase tracking-wider`}>
                      {viewingGuide ? statusConfig[viewingGuide.workflow_status].label : ''}
                    </Badge>
                  </div>
                  <DialogTitle className='text-2xl font-bold tracking-tight'>{viewingGuide?.title}</DialogTitle>
                </div>
                <Button variant='outline' size='sm' className='gap-2' onClick={() => {
                  setIsViewDialogOpen(false)
                  if (viewingGuide) handleOpenDialog(viewingGuide as any)
                }}>
                  <Edit className='h-4 w-4' />
                  Modifier
                </Button>
              </div>
            </DialogHeader>

            <div className='flex-1 overflow-y-auto p-8 space-y-8'>
              {/* Introduction Section */}
              <section className='space-y-3'>
                <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2'>
                  <Info className='h-4 w-4' />
                  Aperçu & Introduction
                </h3>
                <div className='p-4 rounded-xl bg-muted/30 border text-foreground/90 italic leading-relaxed'>
                  {viewingGuide?.overview}
                </div>
                <div className='text-foreground/80 leading-relaxed whitespace-pre-wrap'>
                   {typeof viewingGuide?.content === 'string' ? viewingGuide.content : JSON.stringify(viewingGuide?.content)}
                </div>
              </section>

              {/* Medical Info Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card className='bg-blue-50/30 border-blue-100 shadow-none'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm flex items-center gap-2 text-blue-700'>
                      <UserCheck className='h-4 w-4' />
                      Validation Médicale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Expert :</span>
                      <span className='font-medium text-blue-900'>{viewingGuide?.validated_by || 'Non spécifié'}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Dernière révision :</span>
                      <span className='font-medium text-blue-900'>
                        {viewingGuide?.last_reviewed_date ? new Date(viewingGuide.last_reviewed_date).toLocaleDateString() : 'En attente'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className='bg-amber-50/30 border-amber-100 shadow-none'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm flex items-center gap-2 text-amber-700'>
                      <AlertCircle className='h-4 w-4' />
                      Notes Spéciales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='text-sm text-amber-900 italic'>
                    {viewingGuide?.special_notes || 'Aucune note particulière.'}
                  </CardContent>
                </Card>
              </div>

              {/* Dietary Lists */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='space-y-3'>
                  <h4 className='text-xs font-black uppercase tracking-widest text-green-700 flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4' />
                    Recommandé
                  </h4>
                  <ul className='space-y-2'>
                    {viewingGuide?.recommended_foods?.map((f, i) => (
                      <li key={i} className='text-sm p-2 rounded-lg bg-green-50 border border-green-100 text-green-800 flex items-center gap-2'>
                        <span className='h-1.5 w-1.5 rounded-full bg-green-400' />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='space-y-3'>
                  <h4 className='text-xs font-black uppercase tracking-widest text-red-700 flex items-center gap-2'>
                    <ShieldAlert className='h-4 w-4' />
                    À Éviter
                  </h4>
                  <ul className='space-y-2'>
                    {viewingGuide?.foods_to_avoid?.map((f, i) => (
                      <li key={i} className='text-sm p-2 rounded-lg bg-red-50 border border-red-100 text-red-800 flex items-center gap-2'>
                        <span className='h-1.5 w-1.5 rounded-full bg-red-400' />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='space-y-3'>
                  <h4 className='text-xs font-black uppercase tracking-widest text-blue-700 flex items-center gap-2'>
                    <Salad className='h-4 w-4' />
                    Conseils de vie
                  </h4>
                  <ul className='space-y-2'>
                    {viewingGuide?.nutritional_advice?.map((f, i) => (
                      <li key={i} className='text-sm p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 flex items-center gap-2'>
                        <span className='h-1.5 w-1.5 rounded-full bg-blue-400' />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recipes Preview */}
              <section className='space-y-4 pt-4 border-t'>
                <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2'>
                  <ChefHat className='h-4 w-4' />
                  Recettes ({viewingGuide?.recipes?.length || 0})
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {viewingGuide?.recipes?.map((r, i) => (
                    <Card key={i} className='overflow-hidden group hover:border-primary/50 transition-colors'>
                      <div className='p-4 space-y-2'>
                        <div className='flex justify-between items-start'>
                          <h4 className='font-bold group-hover:text-primary transition-colors'>{r.title}</h4>
                          <Badge variant='secondary' className='text-[10px]'>{r.calories_field} kcal</Badge>
                        </div>
                        <p className='text-xs text-muted-foreground line-clamp-2'>{r.nutrition_benefits}</p>
                      </div>
                    </Card>
                  ))}
                  {(!viewingGuide?.recipes || viewingGuide.recipes.length === 0) && (
                    <div className='col-span-2 text-center py-6 text-muted-foreground italic text-sm border-2 border-dashed rounded-xl'>
                      Aucune recette associée à ce guide.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <DialogFooter className='p-6 border-t bg-muted/20'>
               <Button onClick={() => setIsViewDialogOpen(false)} className='ms-auto'>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0'>
            <DialogHeader className='p-6 pb-2'>
              <DialogTitle>{editingGuide?.id ? 'Modifier le guide' : 'Nouveau guide nutritionnel'}</DialogTitle>
              <DialogDescription>Gérez les sections médicales, les aliments et les recettes associées.</DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='flex-1 overflow-hidden flex flex-col'>
              <div className='px-6'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='general'>Général</TabsTrigger>
                  <TabsTrigger value='medical'>Médical</TabsTrigger>
                  <TabsTrigger value='dietary'>Alimentation</TabsTrigger>
                  <TabsTrigger value='recipes'>Recettes</TabsTrigger>
                </TabsList>
              </div>

              <div className='flex-1 overflow-y-auto p-6'>
                <TabsContent value='general' className='space-y-4 mt-0'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Titre du contenu</Label>
                      <Input 
                        placeholder='ex: Guide nutritionnel - Chimiothérapie' 
                        value={editingGuide?.title || ''}
                        onChange={e => setEditingGuide({...editingGuide!, title: e.target.value})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Type de cancer</Label>
                      <Select 
                        value={editingGuide?.cancer_type || ''}
                        onValueChange={val => setEditingGuide({...editingGuide!, cancer_type: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir un type' />
                        </SelectTrigger>
                        <SelectContent>
                          {cancerTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Catégorie</Label>
                      <Select 
                        value={editingGuide?.category_id || ''}
                        onValueChange={val => setEditingGuide({...editingGuide!, category_id: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir une catégorie' />
                        </SelectTrigger>
                        <SelectContent>
                          {nutritionCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_fr}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                  </div>
                  <div className='space-y-2'>
                      <Label>Statut Initial</Label>
                      <Select 
                        value={editingGuide?.workflow_status || ''}
                        onValueChange={(val: any) => setEditingGuide({...editingGuide!, workflow_status: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir un statut' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='brouillon'>Brouillon</SelectItem>
                          <SelectItem value='en_revision'>En révision</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  <div className='space-y-2'>
                    <Label>Aperçu / Introduction</Label>
                    <Textarea 
                      placeholder='Description générale...' 
                      className='min-h-[100px]' 
                      value={editingGuide?.overview || ''}
                      onChange={e => setEditingGuide({...editingGuide!, overview: e.target.value})}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Contenu détaillé / Article</Label>
                    <Textarea 
                      placeholder='Contenu complet du guide nutritionnel...' 
                      className='min-h-[150px]' 
                      value={typeof editingGuide?.content === 'string' ? editingGuide.content : JSON.stringify(editingGuide?.content) === '{}' ? '' : JSON.stringify(editingGuide?.content)}
                      onChange={e => setEditingGuide({...editingGuide!, content: e.target.value})}
                    />
                  </div>
                </TabsContent>

                <TabsContent value='medical' className='space-y-4 mt-0'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Validé par (Expert)</Label>
                      <div className='relative'>
                        <UserCheck className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input 
                          placeholder='ex: Dr. Ahmed' 
                          className='pl-10' 
                          value={editingGuide?.validated_by || ''}
                          onChange={e => setEditingGuide({...editingGuide!, validated_by: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label>Date de révision</Label>
                      <div className='relative'>
                        <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input 
                          type='date' 
                          className='pl-10' 
                          value={editingGuide?.last_reviewed_date?.split('T')[0] || ''}
                          onChange={e => setEditingGuide({...editingGuide!, last_reviewed_date: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center justify-between p-4 border rounded-lg bg-muted/30'>
                    <div className='space-y-0.5'>
                      <Label className='text-base font-medium'>Contenu Sensible</Label>
                      <p className='text-sm text-muted-foreground'>Afficher un avertissement sur mobile</p>
                    </div>
                    <Switch 
                      checked={editingGuide?.is_sensitive_content || false}
                      onCheckedChange={checked => setEditingGuide({...editingGuide!, is_sensitive_content: checked})}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Notes Spéciales</Label>
                    <Textarea 
                      placeholder='Précautions médicales importantes...' 
                      value={editingGuide?.special_notes || ''}
                      onChange={e => setEditingGuide({...editingGuide!, special_notes: e.target.value})}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Références Médicales</Label>
                    <Textarea 
                      placeholder='Sources et études...' 
                      value={editingGuide?.medical_references || ''}
                      onChange={e => setEditingGuide({...editingGuide!, medical_references: e.target.value})}
                    />
                  </div>
                </TabsContent>

                <TabsContent value='dietary' className='space-y-6 mt-0'>
                  <div className='space-y-2'>
                    <Label className='text-green-600 font-bold'>Aliments Recommandés (un par ligne)</Label>
                    <Textarea 
                      placeholder='ex: Poisson gras, Curcuma...' 
                      className='min-h-[100px] border-green-200 focus-visible:ring-green-500' 
                      value={editingGuide?.recommended_foods?.join('\n') || ''}
                      onChange={e => setEditingGuide({...editingGuide!, recommended_foods: e.target.value.split('\n')})}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-red-600 font-bold'>Aliments à Éviter (un par ligne)</Label>
                    <Textarea 
                      placeholder='ex: Viande rouge, Sucre...' 
                      className='min-h-[100px] border-red-200 focus-visible:ring-red-500' 
                      value={editingGuide?.foods_to_avoid?.join('\n') || ''}
                      onChange={e => setEditingGuide({...editingGuide!, foods_to_avoid: e.target.value.split('\n')})}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-blue-600 font-bold'>Conseils Nutritionnels (un par ligne)</Label>
                    <Textarea 
                      placeholder="ex: Boire 2L d'eau, Fractionner les repas..." 
                      className='min-h-[100px] border-blue-200 focus-visible:ring-blue-500' 
                      value={editingGuide?.nutritional_advice?.join('\n') || ''}
                      onChange={e => setEditingGuide({...editingGuide!, nutritional_advice: e.target.value.split('\n')})}
                    />
                  </div>
                </TabsContent>

                <TabsContent value='recipes' className='space-y-4 mt-0'>
                  <div className='flex items-center justify-between'>
                    <Label>Recettes Santé Associées</Label>
                    <Button variant='outline' size='sm' onClick={() => {
                      const newRecipes = [...(editingGuide?.recipes || []), { title: '', ingredients: [], instructions: [], nutrition_benefits: '', cancer_type: editingGuide?.cancer_type || 'other' }]
                      setEditingGuide({...editingGuide!, recipes: newRecipes})
                    }}>
                      Ajouter une recette
                    </Button>
                  </div>
                  
                  <div className='space-y-6'>
                    {(editingGuide?.recipes || []).map((recipe, index) => (
                      <Card key={index} className='p-4 border-dashed'>
                        <div className='grid grid-cols-2 gap-4 mb-4'>
                          <div className='space-y-2'>
                            <Label>Titre de la recette</Label>
                            <Input 
                              value={recipe.title} 
                              onChange={e => {
                                const recipes = [...(editingGuide?.recipes || [])]
                                recipes[index].title = e.target.value
                                setEditingGuide({...editingGuide!, recipes})
                              }}
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label>Calories (optionnel)</Label>
                            <Input 
                              type='number' 
                              value={recipe.calories_field || ''} 
                              onChange={e => {
                                const recipes = [...(editingGuide?.recipes || [])]
                                recipes[index].calories_field = parseInt(e.target.value)
                                setEditingGuide({...editingGuide!, recipes})
                              }}
                            />
                          </div>
                        </div>
                        <div className='space-y-2 mb-4'>
                          <Label>Ingrédients (un par ligne)</Label>
                          <Textarea 
                            className='min-h-[60px]' 
                            value={recipe.ingredients.join('\n')}
                            onChange={e => {
                               const recipes = [...(editingGuide?.recipes || [])]
                               recipes[index].ingredients = e.target.value.split('\n')
                               setEditingGuide({...editingGuide!, recipes})
                            }}
                          />
                        </div>
                        <div className='space-y-2 mb-4'>
                          <Label>Étapes de préparation (une par ligne)</Label>
                          <Textarea 
                            className='min-h-[60px]' 
                            value={recipe.instructions.join('\n')}
                            onChange={e => {
                               const recipes = [...(editingGuide?.recipes || [])]
                               recipes[index].instructions = e.target.value.split('\n')
                               setEditingGuide({...editingGuide!, recipes})
                            }}
                          />
                        </div>
                        <div className='space-y-2 mb-4'>
                          <Label>Bénéfices nutritionnels</Label>
                          <Input 
                            value={recipe.nutrition_benefits}
                            onChange={e => {
                               const recipes = [...(editingGuide?.recipes || [])]
                               recipes[index].nutrition_benefits = e.target.value
                               setEditingGuide({...editingGuide!, recipes})
                            }}
                          />
                        </div>
                        <Button 
                          variant='ghost' 
                          size='sm' 
                          className='text-red-500 hover:text-red-700 hover:bg-red-50 gap-2' 
                          onClick={() => {
                            const recipes = (editingGuide?.recipes || []).filter((_, i: number) => i !== index)
                            setEditingGuide({...editingGuide!, recipes})
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                          Supprimer la recette
                        </Button>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </div>

              <DialogFooter className='p-6 pt-2 border-t mt-auto shrink-0'>
                <Button variant='outline' onClick={() => {
                  if (activeTab !== 'general') {
                    const steps = ['general', 'medical', 'dietary', 'recipes'];
                    setActiveTab(steps[steps.indexOf(activeTab) - 1]);
                  } else {
                    setIsDialogOpen(false);
                  }
                }}>
                  {activeTab === 'general' ? 'Annuler' : 'Précédent'}
                </Button>
                <Button onClick={() => {
                  if (activeTab === 'general' && (!editingGuide?.title || !editingGuide?.cancer_type)) {
                    toast.error('Veuillez remplir le titre et le type de cancer');
                    return;
                  }
                  if (activeTab !== 'recipes') {
                    const steps = ['general', 'medical', 'dietary', 'recipes'];
                    setActiveTab(steps[steps.indexOf(activeTab) + 1]);
                  } else {
                    handleSave();
                  }
                }} disabled={isSaving}>
                  {isSaving ? 'Enregistrement...' : activeTab === 'recipes' ? 'Enregistrer' : 'Suivant'}
                </Button>
              </DialogFooter>
            </Tabs>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
