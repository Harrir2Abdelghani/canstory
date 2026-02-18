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
  ShieldAlert
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
  category: string
  workflow_status: 'brouillon' | 'en_revision' | 'publie' | 'archive'
  overview: string
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

const categories = [
  'Conseils généraux',
  'Aliments recommandés',
  'Aliments à éviter',
  'Recettes',
  'Suppléments',
]

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

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGuide, setEditingGuide] = useState<Partial<NutritionGuide> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [guidesRes, statsRes] = await Promise.all([
        apiClient.instance.get('/admin/nutrition/guides'),
        apiClient.instance.get('/admin/nutrition/stats')
      ])
      setGuides(guidesRes.data.data || [])
      setStats(statsRes.data.data)
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
      const matchesCategory = categoryFilter === 'all' || guide.category === categoryFilter
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
        category: categories[0],
        workflow_status: 'brouillon',
        overview: '',
        recommended_foods: [],
        foods_to_avoid: [],
        nutritional_advice: [],
        is_sensitive_content: false,
        recipes: []
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingGuide?.title || !editingGuide?.cancer_type) {
      toast.error('Veuillez remplir les champs obligatoires')
      return
    }

    setIsSaving(true)
    try {
      if (editingGuide.id) {
        await apiClient.instance.put(`/admin/nutrition/guides/${editingGuide.id}`, editingGuide)
        toast.success('Guide mis à jour')
      } else {
        await apiClient.instance.post('/admin/nutrition/guides', editingGuide)
        toast.success('Guide créé avec succès')
      }
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return
    
    try {
      await apiClient.instance.delete(`/admin/nutrition/guides/${id}`)
      toast.success('Contenu supprimé')
      fetchData()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
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
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                        <TableRow key={item.id} className='hover:bg-muted/50 transition-colors'>
                          <TableCell>
                            <Badge variant='outline' className='capitalize'>
                              {cancerTypes.find(t => t.value === item.cancer_type)?.label || item.cancer_type}
                            </Badge>
                          </TableCell>
                          <TableCell className='font-medium'>{item.title}</TableCell>
                          <TableCell>{item.category}</TableCell>
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
                          <TableCell className='text-right'>
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
                                  <DropdownMenuItem onClick={() => handleDelete(item.id)} className='text-red-600 font-medium'>Supprimer</DropdownMenuItem>
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

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0'>
            <DialogHeader className='p-6 pb-2'>
              <DialogTitle>{editingGuide?.id ? 'Modifier le guide' : 'Nouveau guide nutritionnel'}</DialogTitle>
              <DialogDescription>Gérez les sections médicales, les aliments et les recettes associées.</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue='general' className='flex-1 overflow-hidden flex flex-col'>
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
                        value={editingGuide?.category || ''}
                        onValueChange={val => setEditingGuide({...editingGuide!, category: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir une catégorie' />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
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
                        <Button variant='ghost' size='sm' className='text-red-500' onClick={() => {
                          const recipes = (editingGuide?.recipes || []).filter((_, i: number) => i !== index)
                          setEditingGuide({...editingGuide!, recipes})
                        }}>
                          Supprimer la recette
                        </Button>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </div>

              <DialogFooter className='p-6 pt-2 border-t mt-auto shrink-0'>
                <Button variant='outline' onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </DialogFooter>
            </Tabs>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
