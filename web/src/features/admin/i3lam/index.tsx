import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  BookText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  Archive,
  Star,
  Calendar,
  TrendingUp,
  MoreHorizontal,
  ImagePlus,
  X,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { apiClient } from '@/lib/api-client'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  thumbnail: string | null
  category_id: string | null
  tags: string[] | null
  meta_title: string | null
  meta_description: string | null
  seo_slug: string | null
  article_status: 'brouillon' | 'en_revision' | 'planifie' | 'publie' | 'archive'
  scheduled_at: string | null
  read_time_minutes: number | null
  is_featured: boolean
  views_count: number
  author_id: string
  published_at: string | null
  created_at: string
  updated_at: string
  author?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  category?: {
    id: string
    name_fr: string
    name_ar?: string
    slug: string
    color?: string
  }
}

interface Category {
  id: string
  name_fr: string
  name_ar?: string
  slug: string
  color?: string
}

interface Stats {
  total: number
  brouillon: number
  en_revision: number
  planifie: number
  publie: number
  archive: number
  total_views: number
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false }
]



const statusConfig = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: FileText },
  en_revision: { label: 'En révision', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: Eye },
  planifie: { label: 'Planifié', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: Calendar },
  publie: { label: 'Publié', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
  archive: { label: 'Archivé', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: Archive }
}

export function I3lamManagement() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    brouillon: 0,
    en_revision: 0,
    planifie: 0,
    publie: 0,
    archive: 0,
    total_views: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [viewArticle, setViewArticle] = useState<Article | null>(null)
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    article_status: 'brouillon',
    is_featured: false,
    meta_title: '',
    meta_description: '',
    tags: [],
    scheduled_at: null,
    thumbnail: '',
    featured_image: '',
    seo_slug: ''
  })
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    fetchCategories()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [statusFilter, categoryFilter])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter
      if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter

      const { data } = await apiClient.instance.get('/admin/i3lam/articles', {
        params
      })
      setArticles(data.data || [])
    } catch (error) {
      console.error('Fetch articles error:', error)
      toast.error('Erreur lors du chargement des articles')
    } finally {
      setLoading(false)
    }
  }


  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.instance.get('/admin/i3lam/categories')
      setCategories(data.data || [])
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.instance.get('/admin/i3lam/stats')
      setStats(data.data)
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const fetchData = async () => {
    await Promise.all([
      fetchArticles(),
      fetchStats(),
      fetchCategories()
    ])
  }

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles

    const search = searchTerm.toLowerCase()
    return articles.filter(
      (article) =>
        article.title?.toLowerCase().includes(search) ||
        article.excerpt?.toLowerCase().includes(search) ||
        article.author?.full_name?.toLowerCase().includes(search) ||
        article.category?.name_fr?.toLowerCase().includes(search)
    )
  }, [articles, searchTerm])

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      setEditingArticle(article)
      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category_id: article.category_id || '',
        article_status: article.article_status || 'brouillon',
        is_featured: article.is_featured || false,
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        tags: article.tags || [],
        scheduled_at: article.scheduled_at ? new Date(article.scheduled_at).toISOString().slice(0, 16) : null,
        thumbnail: article.thumbnail || '',
        featured_image: article.featured_image || '',
        seo_slug: article.seo_slug || ''
      })
    } else {
      setEditingArticle(null)
      setActiveTab('content')
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category_id: '',
        article_status: 'brouillon',
        is_featured: false,
        meta_title: '',
        meta_description: '',
        tags: [],
        scheduled_at: null,
        thumbnail: '',
        featured_image: '',
        seo_slug: ''
      })
    }
    setImagePreview(getImageUrl(article?.featured_image || null))
    setPendingImage(null)
    setIsDialogOpen(true)
  }

  const getImageUrl = (image: string | null) => {
    if (!image) return null
    if (typeof image === 'string' && image.startsWith('{')) {
      try {
        const parsed = JSON.parse(image)
        return parsed.data || null
      } catch (e) {
        return image
      }
    }
    return image
  }

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [pendingImage, setPendingImage] = useState<any>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image est trop volumineuse (max 5Mo)')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setImagePreview(base64)
        setPendingImage({
          data: base64,
          name: file.name,
          type: file.type
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      toast.error('Le titre et le contenu sont obligatoires')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingArticle 
        ? `/admin/i3lam/articles/${editingArticle.id}`
        : '/admin/i3lam/articles'
      
      const method = editingArticle ? 'put' : 'post'
      
      const payload = {
        ...formData,
        category_id: formData.category_id === 'none' ? null : formData.category_id,
        featured_image: pendingImage || formData.featured_image
      }
      
      await apiClient.instance[method](url, payload)

      toast.success(editingArticle ? 'Article mis à jour' : 'Article créé avec succès')
      setIsDialogOpen(false)
      await fetchData()
    } catch (error: any) {
      console.error('Save article error:', error)
      toast.error(error.message || "Erreur lors de l'enregistrement")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkAction = async (action: 'publish' | 'archive' | 'delete') => {
    if (selectedArticles.length === 0) {
      toast.error('Veuillez sélectionner au moins un article')
      return
    }

    try {
      const { data } = await apiClient.instance.post('/admin/i3lam/articles/bulk', {
        action,
        article_ids: selectedArticles
      })

      toast.success(data.message)
      setSelectedArticles([])
      await fetchData()
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error("Erreur lors de l'action groupée")
    }
  }

  const handleToggleFeatured = async (articleId: string, currentStatus: boolean) => {
    try {
      await apiClient.instance.put(`/admin/i3lam/articles/${articleId}/featured`, {
        is_featured: !currentStatus
      })

      toast.success(currentStatus ? 'Article retiré de la une' : 'Article mis en avant')
      await fetchArticles()
    } catch (error: any) {
      console.error('Toggle featured error:', error)
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async () => {
    if (!deleteArticle) return

    try {
      await apiClient.instance.delete(`/admin/i3lam/articles/${deleteArticle.id}`)

      toast.success('Article supprimé avec succès')
      setDeleteArticle(null)
      await fetchData()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const toggleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([])
    } else {
      setSelectedArticles(filteredArticles.map((a) => a.id))
    }
  }

  const toggleSelectArticle = (id: string) => {
    setSelectedArticles((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const StatusBadge = ({ status }: { status: Article['article_status'] }) => {
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className="ms-auto flex items-center space-x-4">
          <SearchBar />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">I3lam - Actualités</h1>
              <p className="text-muted-foreground mt-2">
                Système de gestion de contenu professionnel pour les articles d'actualité
              </p>
            </div>
            <Button className="gap-2" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4" />
              Nouvel article
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <BookText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Publiés</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.publie}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planifiés</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.planifie}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vues Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_views.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un article..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value="en_revision">En révision</SelectItem>
                      <SelectItem value="planifie">Planifié</SelectItem>
                      <SelectItem value="publie">Publié</SelectItem>
                      <SelectItem value="archive">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            {cat.color && (
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            )}
                            {cat.name_fr}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedArticles.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('publish')}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Publier ({selectedArticles.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('archive')}
                      className="gap-2"
                    >
                      <Archive className="h-4 w-4" />
                      Archiver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Articles Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : filteredArticles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun article trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedArticles.includes(article.id)}
                            onCheckedChange={() => toggleSelectArticle(article.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-16 rounded overflow-hidden bg-muted flex-shrink-0 border border-muted-foreground/10">
                              {getImageUrl(article.featured_image) ? (
                                <img 
                                  src={getImageUrl(article.featured_image)!} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted-foreground/5 text-muted-foreground/30">
                                  <ImagePlus className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                {article.is_featured && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                                <div className="font-medium max-w-md truncate">{article.title}</div>
                              </div>
                              {article.read_time_minutes && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {article.read_time_minutes} min de lecture
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {article.category ? (
                            <Badge variant="outline" style={{ borderColor: article.category.color }}>
                              {article.category.name_fr}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={article.article_status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(article.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewArticle(article)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenDialog(article)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleFeatured(article.id, article.is_featured)}
                              >
                                <Star className="mr-2 h-4 w-4" />
                                {article.is_featured ? 'Retirer de la une' : 'Mettre en avant'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteArticle(article)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* View Article Dialog */}
        <Dialog open={!!viewArticle} onOpenChange={() => setViewArticle(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewArticle?.title}</DialogTitle>
              <DialogDescription>Détails de l'article</DialogDescription>
            </DialogHeader>
            {viewArticle && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <StatusBadge status={viewArticle.article_status} />
                  {viewArticle.is_featured && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      Article en avant
                    </Badge>
                  )}
                </div>
                {getImageUrl(viewArticle.featured_image) && (
                  <img
                    src={getImageUrl(viewArticle.featured_image)!}
                    alt={viewArticle.title}
                    className="w-full rounded-lg"
                  />
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Auteur</Label>
                    <p>{viewArticle.author?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Catégorie</Label>
                    <p>{viewArticle.category?.name_fr || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Vues</Label>
                    <p>{viewArticle.views_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Temps de lecture</Label>
                    <p>{viewArticle.read_time_minutes} minutes</p>
                  </div>
                </div>
                {viewArticle.excerpt && (
                  <div>
                    <Label className="text-muted-foreground">Extrait</Label>
                    <p className="mt-1">{viewArticle.excerpt}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Contenu</Label>
                  <div className="mt-1 prose dark:prose-invert max-w-none">
                    {viewArticle.content}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create / Edit Article Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Modifier l\'article' : 'Créer un nouvel article'}</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour {editingArticle ? 'mettre à jour' : 'créer'} votre article.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">1. Contenu</TabsTrigger>
                <TabsTrigger value="settings">2. Paramètres & SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de l'article</Label>
                    <Input
                      id="title"
                      placeholder="Entrez le titre..."
                      className="text-xl font-semibold h-12"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Extrait (Brève description)</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Un court résumé pour les listes..."
                      className="h-[100px] resize-none"
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="editor-content">Contenu de l'article</Label>
                    <span className="text-xs text-muted-foreground italic">Éditeur professionnel</span>
                  </div>
                  <Textarea
                    id="editor-content"
                    placeholder="Écrivez le contenu ici..."
                    className="min-h-[300px] font-serif text-lg leading-relaxed"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Image de couverture</Label>
                      <div 
                        className={`border-2 border-dashed rounded-xl p-4 transition-all ${
                          imagePreview ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
                        }`}
                      >
                        {imagePreview ? (
                          <div className="relative aspect-video rounded-lg overflow-hidden group">
                            <img src={imagePreview} alt="Couverture" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" /> Changer
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => {
                                  setImagePreview(null)
                                  setPendingImage(null)
                                  setFormData({ ...formData, featured_image: '' })
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="flex flex-col items-center justify-center py-8 cursor-pointer"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                              <ImagePlus className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium">Cliquez pour uploader</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 5Mo</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          id="image-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-select">Catégorie</Label>
                        <Select 
                          value={formData.category_id || ''} 
                          onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                        >
                          <SelectTrigger id="category-select">
                            <SelectValue placeholder="Choisir une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucune catégorie</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                  {cat.color && (
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                  )}
                                  {cat.name_fr}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status-select">Statut workflow</Label>
                        <Select 
                          value={formData.article_status} 
                          onValueChange={(val: any) => setFormData({ ...formData, article_status: val })}
                        >
                          <SelectTrigger id="status-select" className="bg-primary/5 border-primary/20">
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="brouillon">Brouillon</SelectItem>
                            <SelectItem value="en_revision">En révision</SelectItem>
                            <SelectItem value="planifie">Planifié</SelectItem>
                            <SelectItem value="publie">Publié</SelectItem>
                            <SelectItem value="archive">Archivé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg border border-muted-foreground/10">
                      <Switch
                        id="featured-switch"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                      <Label htmlFor="featured-switch" className="flex items-center gap-2 cursor-pointer font-medium">
                        <Star className={`h-4 w-4 ${formData.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        Mettre en avant sur la page d'accueil
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-xl space-y-4 border border-primary/10">
                      <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <TrendingUp className="h-4 w-4" /> Optimisation SEO
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="seo-slug-input">URL personnalisée (Slug)</Label>
                          <Input
                            id="seo-slug-input"
                            placeholder="mon-titre-article"
                            className="bg-background border-muted-foreground/20"
                            value={formData.seo_slug || ''}
                            onChange={(e) => setFormData({ ...formData, seo_slug: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meta-title-input">Meta Title</Label>
                          <Input
                            id="meta-title-input"
                            placeholder="Titre pour Google..."
                            className="bg-background border-muted-foreground/20"
                            value={formData.meta_title || ''}
                            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meta-desc-input">Meta Description</Label>
                          <Textarea
                            id="meta-desc-input"
                            placeholder="Description pour les résultats de recherche..."
                            className="bg-background border-muted-foreground/20 h-24"
                            value={formData.meta_description || ''}
                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {formData.article_status === 'planifie' && (
                      <div className="space-y-2 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl">
                        <Label htmlFor="scheduled-at-input" className="text-purple-700 dark:text-purple-300">Date de planification</Label>
                        <Input
                          id="scheduled-at-input"
                          type="datetime-local"
                          className="bg-background"
                          value={formData.scheduled_at || ''}
                          onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 flex justify-between items-center bg-muted/30 -mx-6 -mb-6 p-6 mt-4 border-t">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Annuler
                </Button>
                {activeTab !== 'content' && (
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('content')}
                  >
                    Précédent
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {activeTab === 'content' ? (
                  <Button 
                    onClick={() => {
                      if (!formData.title?.trim() || !formData.content?.trim()) {
                        toast.error('Le titre et le contenu sont obligatoires')
                        return
                      }
                      setActiveTab('settings')
                    }}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button onClick={handleSave} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 px-8">
                    {isSubmitting ? 'Enregistrement...' : editingArticle ? 'Mettre à jour' : 'Créer l\'article'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteArticle} onOpenChange={() => setDeleteArticle(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer l'article "{deleteArticle?.title}" ? Cette action est
                irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteArticle(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
