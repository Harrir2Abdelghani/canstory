import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tag, Stethoscope, FileText, Plus, ToggleLeft, ToggleRight, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useSpecialties,
  useCreateSpecialty,
  useDeleteSpecialty,
  useToggleSpecialtyStatus,
  useArticleCategories,
  useCreateArticleCategory,
  useDeleteArticleCategory,
  useToggleArticleCategoryStatus,
  useGuideCategories,
  useCreateGuideCategory,
  useDeleteGuideCategory,
  useToggleGuideCategoryStatus,
} from '@/hooks/use-categories'
import type { Category } from '@/services/categories'

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: true, disabled: false },
]

export function CategoriesManagement() {
  // Fetch data from database
  const { data: specialties = [] } = useSpecialties()
  const { data: articleCategories = [] } = useArticleCategories()
  const { data: guideCategories = [] } = useGuideCategories()

  // Mutations
  const createSpecialtyMutation = useCreateSpecialty()
  const deleteSpecialtyMutation = useDeleteSpecialty()
  const toggleSpecialtyMutation = useToggleSpecialtyStatus()
  const createArticleMutation = useCreateArticleCategory()
  const deleteArticleMutation = useDeleteArticleCategory()
  const toggleArticleMutation = useToggleArticleCategoryStatus()
  const createGuideMutation = useCreateGuideCategory()
  const deleteGuideMutation = useDeleteGuideCategory()
  const toggleGuideMutation = useToggleGuideCategoryStatus()

  // Dialog states
  const [isArticleCatDialogOpen, setIsArticleCatDialogOpen] = useState(false)
  const [isSpecialtyDialogOpen, setIsSpecialtyDialogOpen] = useState(false)
  const [isGuideCatDialogOpen, setIsGuideCatDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [articleFormData, setArticleFormData] = useState({ name_fr: '', name_ar: '', slug: '' })
  const [specialtyFormData, setSpecialtyFormData] = useState({ name_fr: '', name_ar: '', slug: '' })
  const [guideFormData, setGuideFormData] = useState({ name_fr: '', name_ar: '', slug: '' })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'article' | 'specialty' | 'guide' } | null>(null)
  const [articleSearch, setArticleSearch] = useState('')
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [guideSearch, setGuideSearch] = useState('')
  const [articleFilter, setArticleFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [specialtyFilter, setSpecialtyFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [guideFilter, setGuideFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const handleToggleActive = (id: string, type: 'article' | 'specialty' | 'guide') => {
    const item = type === 'article' ? articleCategories.find(c => c.id === id) : 
                 type === 'specialty' ? specialties.find(s => s.id === id) : 
                 guideCategories.find(g => g.id === id)
    
    if (!item) return
    
    if (type === 'article') {
      toggleArticleMutation.mutate({ id, is_active: !item.is_active })
    } else if (type === 'specialty') {
      toggleSpecialtyMutation.mutate({ id, is_active: !item.is_active })
    } else {
      toggleGuideMutation.mutate({ id, is_active: !item.is_active })
    }
  }

  const handleDelete = (id: string, type: 'article' | 'specialty' | 'guide') => {
    setDeleteTarget({ id, type })
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    
    if (deleteTarget.type === 'article') {
      deleteArticleMutation.mutate(deleteTarget.id)
    } else if (deleteTarget.type === 'specialty') {
      deleteSpecialtyMutation.mutate(deleteTarget.id)
    } else {
      deleteGuideMutation.mutate(deleteTarget.id)
    }
    
    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  const handleViewDetails = (category: Category) => {
    setSelectedCategory(category)
    setIsDetailsOpen(true)
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
  }

  const filterAndSearch = (items: Category[], search: string, filter: 'all' | 'active' | 'inactive') => {
    return items.filter(item => {
      const matchesSearch = item.name_fr.toLowerCase().includes(search.toLowerCase()) ||
                           item.name_ar.includes(search) ||
                           item.slug.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'all' || 
                           (filter === 'active' && item.is_active) ||
                           (filter === 'inactive' && !item.is_active)
      return matchesSearch && matchesFilter
    })
  }

  const filteredArticles = filterAndSearch(articleCategories, articleSearch, articleFilter)
  const filteredSpecialties = filterAndSearch(specialties, specialtySearch, specialtyFilter)
  const filteredGuides = filterAndSearch(guideCategories, guideSearch, guideFilter)

  const handleAddArticleCategory = () => {
    if (!articleFormData.name_fr || !articleFormData.name_ar) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    createArticleMutation.mutate({
      name_fr: articleFormData.name_fr,
      name_ar: articleFormData.name_ar,
      slug: articleFormData.slug || generateSlug(articleFormData.name_fr),
      is_active: true,
    }, {
      onSuccess: () => {
        setArticleFormData({ name_fr: '', name_ar: '', slug: '' })
        setIsArticleCatDialogOpen(false)
      }
    })
  }

  const handleAddSpecialty = () => {
    if (!specialtyFormData.name_fr || !specialtyFormData.name_ar) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    createSpecialtyMutation.mutate({
      name_fr: specialtyFormData.name_fr,
      name_ar: specialtyFormData.name_ar,
      slug: specialtyFormData.slug || generateSlug(specialtyFormData.name_fr),
      is_active: true,
    }, {
      onSuccess: () => {
        setSpecialtyFormData({ name_fr: '', name_ar: '', slug: '' })
        setIsSpecialtyDialogOpen(false)
      }
    })
  }

  const handleAddGuideCategory = () => {
    if (!guideFormData.name_fr || !guideFormData.name_ar) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    createGuideMutation.mutate({
      name_fr: guideFormData.name_fr,
      name_ar: guideFormData.name_ar,
      slug: guideFormData.slug || generateSlug(guideFormData.name_fr),
      is_active: true,
    }, {
      onSuccess: () => {
        setGuideFormData({ name_fr: '', name_ar: '', slug: '' })
        setIsGuideCatDialogOpen(false)
      }
    })
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
              <h1 className='text-3xl font-bold tracking-tight'>Gestion des Catégories</h1>
              <p className='text-muted-foreground mt-2'>
                Gérez les catégories et spécialités médicales
              </p>
            </div>
          </div>

          <Tabs defaultValue='articles' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='articles'>Catégories Articles</TabsTrigger>
              <TabsTrigger value='specialties'>Spécialités Médicales</TabsTrigger>
              <TabsTrigger value='guides'>Catégories Guides</TabsTrigger>
            </TabsList>

            <TabsContent value='articles' className='space-y-4'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2'>
                        <Tag className='h-5 w-5' />
                        Catégories d'articles (I3lam)
                      </CardTitle>
                      <CardDescription>
                        Catégories pour les articles informatifs
                      </CardDescription>
                    </div>
                    <Dialog open={isArticleCatDialogOpen} onOpenChange={setIsArticleCatDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className='gap-2'>
                          <Plus className='h-4 w-4' />
                          Ajouter une catégorie
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-[500px]'>
                        <DialogHeader>
                          <DialogTitle>Ajouter une catégorie</DialogTitle>
                          <DialogDescription>
                            Créez une nouvelle catégorie d'articles
                          </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                          <div className='grid gap-2'>
                            <Label htmlFor='article-name-fr'>Nom (Français)</Label>
                            <Input 
                              id='article-name-fr' 
                              placeholder='Ex: Prévention'
                              value={articleFormData.name_fr}
                              onChange={(e) => setArticleFormData({ ...articleFormData, name_fr: e.target.value, slug: generateSlug(e.target.value) })}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='article-name-ar'>Nom (Arabe)</Label>
                            <Input 
                              id='article-name-ar' 
                              placeholder='Ex: الوقاية' 
                              dir='rtl'
                              value={articleFormData.name_ar}
                              onChange={(e) => setArticleFormData({ ...articleFormData, name_ar: e.target.value })}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='article-slug'>Slug (URL)</Label>
                            <Input 
                              id='article-slug' 
                              placeholder='Ex: prevention'
                              value={articleFormData.slug}
                              onChange={(e) => setArticleFormData({ ...articleFormData, slug: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant='outline' onClick={() => setIsArticleCatDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleAddArticleCategory}>
                            Ajouter
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex gap-2 items-end'>
                    <div className='flex-1'>
                      <Label className='text-xs mb-1 block'>Rechercher</Label>
                      <Input 
                        placeholder='Rechercher par nom ou slug...'
                        value={articleSearch}
                        onChange={(e) => setArticleSearch(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className='text-xs mb-1 block'>Statut</Label>
                      <select 
                        value={articleFilter} 
                        onChange={(e) => setArticleFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        className='h-10 px-3 py-2 border border-input rounded-md bg-background text-sm'
                      >
                        <option value='all'>Tous</option>
                        <option value='active'>Actifs</option>
                        <option value='inactive'>Inactifs</option>
                      </select>
                    </div>
                  </div>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom (FR)</TableHead>
                          <TableHead>Nom (AR)</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredArticles.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className='font-medium'>{category.name_fr}</TableCell>
                            <TableCell dir='rtl'>{category.name_ar}</TableCell>
                            <TableCell>
                              <code className='text-xs bg-muted px-2 py-1 rounded'>{category.slug}</code>
                            </TableCell>
                            <TableCell>
                              {category.is_active ? (
                                <Badge className='bg-green-500 hover:bg-green-600'>Actif</Badge>
                              ) : (
                                <Badge variant='secondary'>Inactif</Badge>
                              )}
                            </TableCell>
                            <TableCell className='text-right space-x-2'>
                              <Button size='sm' variant='ghost' className='h-8 w-8 p-0' onClick={() => handleViewDetails(category)} title='Voir les détails'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='ghost' className='h-8 w-8 p-0' onClick={() => handleToggleActive(category.id, 'article')} title='Activer/Désactiver'>
                                {category.is_active ? <ToggleRight className='h-4 w-4 text-green-600' /> : <ToggleLeft className='h-4 w-4 text-gray-400' />}
                              </Button>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                                onClick={() => handleDelete(category.id, 'article')}
                                title='Supprimer'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='specialties' className='space-y-4'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2'>
                        <Stethoscope className='h-5 w-5' />
                        Spécialités médicales
                      </CardTitle>
                      <CardDescription>
                        Spécialités pour les médecins et professionnels
                      </CardDescription>
                    </div>
                    <Dialog open={isSpecialtyDialogOpen} onOpenChange={setIsSpecialtyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className='gap-2'>
                          <Plus className='h-4 w-4' />
                          Ajouter une spécialité
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-[500px]'>
                        <DialogHeader>
                          <DialogTitle>Ajouter une spécialité</DialogTitle>
                          <DialogDescription>
                            Créez une nouvelle spécialité médicale
                          </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                          <div className='grid gap-2'>
                            <Label htmlFor='spec-name-fr'>Nom (Français)</Label>
                            <Input 
                              id='spec-name-fr' 
                              placeholder='Ex: Oncologie'
                              value={specialtyFormData.name_fr}
                              onChange={(e) => setSpecialtyFormData({ ...specialtyFormData, name_fr: e.target.value, slug: generateSlug(e.target.value) })}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='spec-name-ar'>Nom (Arabe)</Label>
                            <Input 
                              id='spec-name-ar' 
                              placeholder='Ex: علم الأورام' 
                              dir='rtl'
                              value={specialtyFormData.name_ar}
                              onChange={(e) => setSpecialtyFormData({ ...specialtyFormData, name_ar: e.target.value })}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='spec-slug'>Slug (URL)</Label>
                            <Input 
                              id='spec-slug' 
                              placeholder='Ex: oncology'
                              value={specialtyFormData.slug}
                              onChange={(e) => setSpecialtyFormData({ ...specialtyFormData, slug: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant='outline' onClick={() => setIsSpecialtyDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleAddSpecialty}>
                            Ajouter
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex gap-2 items-end'>
                    <div className='flex-1'>
                      <Label className='text-xs mb-1 block'>Rechercher</Label>
                      <Input 
                        placeholder='Rechercher par nom ou slug...'
                        value={specialtySearch}
                        onChange={(e) => setSpecialtySearch(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className='text-xs mb-1 block'>Statut</Label>
                      <select 
                        value={specialtyFilter} 
                        onChange={(e) => setSpecialtyFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        className='h-10 px-3 py-2 border border-input rounded-md bg-background text-sm'
                      >
                        <option value='all'>Tous</option>
                        <option value='active'>Actifs</option>
                        <option value='inactive'>Inactifs</option>
                      </select>
                    </div>
                  </div>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom (FR)</TableHead>
                          <TableHead>Nom (AR)</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSpecialties.map((specialty) => (
                          <TableRow key={specialty.id}>
                            <TableCell className='font-medium'>{specialty.name_fr}</TableCell>
                            <TableCell dir='rtl'>{specialty.name_ar}</TableCell>
                            <TableCell>
                              <code className='text-xs bg-muted px-2 py-1 rounded'>{specialty.slug}</code>
                            </TableCell>
                            <TableCell>
                              {specialty.is_active ? (
                                <Badge className='bg-green-500 hover:bg-green-600'>Actif</Badge>
                              ) : (
                                <Badge variant='secondary'>Inactif</Badge>
                              )}
                            </TableCell>
                            <TableCell className='text-right space-x-2'>
                              <Button size='sm' variant='ghost' className='h-8 w-8 p-0' onClick={() => handleViewDetails(specialty)} title='Voir les détails'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='ghost' className='h-8 w-8 p-0' onClick={() => handleToggleActive(specialty.id, 'specialty')} title='Activer/Désactiver'>
                                {specialty.is_active ? <ToggleRight className='h-4 w-4 text-green-600' /> : <ToggleLeft className='h-4 w-4 text-gray-400' />}
                              </Button>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                                onClick={() => handleDelete(specialty.id, 'specialty')}
                                title='Supprimer'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='guides' className='space-y-4'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2'>
                        <FileText className='h-5 w-5' />
                        Catégories de guides (Nassa2ih)
                      </CardTitle>
                      <CardDescription>
                        Catégories pour les guides administratifs
                      </CardDescription>
                    </div>
                    <Dialog open={isGuideCatDialogOpen} onOpenChange={setIsGuideCatDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className='gap-2'>
                          <Plus className='h-4 w-4' />
                          Ajouter une catégorie
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-[500px]'>
                        <DialogHeader>
                          <DialogTitle>Ajouter une catégorie de guide</DialogTitle>
                          <DialogDescription>
                            Créez une nouvelle catégorie de guide
                          </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                          <div className='grid gap-2'>
                            <Label htmlFor='guide-name-fr'>Nom (Français)</Label>
                            <Input 
                              id='guide-name-fr' 
                              placeholder='Ex: Démarches administratives'
                              value={guideFormData.name_fr}
                              onChange={(e) => setGuideFormData({ ...guideFormData, name_fr: e.target.value, slug: generateSlug(e.target.value) })}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='guide-name-ar'>Nom (Arabe)</Label>
                            <Input 
                              id='guide-name-ar' 
                              placeholder='Ex: الإجراءات الإدارية' 
                              dir='rtl'
                              value={guideFormData.name_ar}
                              onChange={(e) => setGuideFormData({ ...guideFormData, name_ar: e.target.value })}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='guide-slug'>Slug (URL)</Label>
                            <Input 
                              id='guide-slug' 
                              placeholder='Ex: demarches-administratives'
                              value={guideFormData.slug}
                              onChange={(e) => setGuideFormData({ ...guideFormData, slug: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant='outline' onClick={() => setIsGuideCatDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleAddGuideCategory}>
                            Ajouter
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex gap-2 items-end'>
                    <div className='flex-1'>
                      <Label className='text-xs mb-1 block'>Rechercher</Label>
                      <Input 
                        placeholder='Rechercher par nom ou slug...'
                        value={guideSearch}
                        onChange={(e) => setGuideSearch(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className='text-xs mb-1 block'>Statut</Label>
                      <select 
                        value={guideFilter} 
                        onChange={(e) => setGuideFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        className='h-10 px-3 py-2 border border-input rounded-md bg-background text-sm'
                      >
                        <option value='all'>Tous</option>
                        <option value='active'>Actifs</option>
                        <option value='inactive'>Inactifs</option>
                      </select>
                    </div>
                  </div>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom (FR)</TableHead>
                          <TableHead>Nom (AR)</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGuides.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className='font-medium'>{category.name_fr}</TableCell>
                            <TableCell dir='rtl'>{category.name_ar}</TableCell>
                            <TableCell>
                              <code className='text-xs bg-muted px-2 py-1 rounded'>{category.slug}</code>
                            </TableCell>
                            <TableCell>
                              {category.is_active ? (
                                <Badge className='bg-green-500 hover:bg-green-600'>Actif</Badge>
                              ) : (
                                <Badge variant='secondary'>Inactif</Badge>
                              )}
                            </TableCell>
                            <TableCell className='text-right space-x-2'>
                              <Button size='sm' variant='ghost' className='h-8 w-8 p-0' onClick={() => handleViewDetails(category)} title='Voir les détails'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='ghost' className='h-8 w-8 p-0' onClick={() => handleToggleActive(category.id, 'guide')} title='Activer/Désactiver'>
                                {category.is_active ? <ToggleRight className='h-4 w-4 text-green-600' /> : <ToggleLeft className='h-4 w-4 text-gray-400' />}
                              </Button>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                                onClick={() => handleDelete(category.id, 'guide')}
                                title='Supprimer'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Details Modal */}
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>{selectedCategory?.name_fr}</DialogTitle>
                <DialogDescription>{selectedCategory?.name_ar}</DialogDescription>
              </DialogHeader>
              {selectedCategory && (
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm font-medium'>Français</p>
                      <p className='text-lg'>{selectedCategory.name_fr}</p>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Arabe</p>
                      <p className='text-lg' dir='rtl'>{selectedCategory.name_ar}</p>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Slug</p>
                      <p className='text-lg font-mono'>{selectedCategory.slug}</p>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Statut</p>
                      <Badge className={selectedCategory.is_active ? 'bg-green-500' : ''}>
                        {selectedCategory.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                  {selectedCategory.description && (
                    <div>
                      <p className='text-sm font-medium'>Description</p>
                      <p>{selectedCategory.description}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className='sm:max-w-[400px]'>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer cette catégorie ?
                </DialogDescription>
              </DialogHeader>
              <div className='flex gap-3 justify-end pt-4'>
                <Button variant='outline' onClick={() => setDeleteConfirmOpen(false)}>
                  Annuler
                </Button>
                <Button variant='destructive' onClick={confirmDelete}>
                  Supprimer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Main>
    </>
  )
}
