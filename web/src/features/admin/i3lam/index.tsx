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
  MoreHorizontal
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

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

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
    seo_slug: ''
  })

  useEffect(() => {
    fetchData()
  }, [statusFilter, categoryFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchArticles(), fetchCategories(), fetchStats()])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter)

      const response = await fetch(`${API_URL}/api/admin/i3lam/articles?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to fetch articles')

      const result = await response.json()
      setArticles(result.data || [])
    } catch (error) {
      console.error('Fetch articles error:', error)
      toast.error('Erreur lors du chargement des articles')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/i3lam/categories`, {
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to fetch categories')

      const result = await response.json()
      setCategories(result.data || [])
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/i3lam/stats`, {
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to fetch stats')

      const result = await response.json()
      setStats(result.data)
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
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
        seo_slug: article.seo_slug || ''
      })
    } else {
      setEditingArticle(null)
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
        seo_slug: ''
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      toast.error('Le titre et le contenu sont obligatoires')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingArticle 
        ? `${API_URL}/api/admin/i3lam/articles/${editingArticle.id}`
        : `${API_URL}/api/admin/i3lam/articles`
      
      const method = editingArticle ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save article')
      }

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
      const response = await fetch(`${API_URL}/api/admin/i3lam/articles/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, article_ids: selectedArticles })
      })

      if (!response.ok) throw new Error('Bulk action failed')

      const result = await response.json()
      toast.success(result.message)
      setSelectedArticles([])
      await fetchData()
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error("Erreur lors de l'action groupée")
    }
  }

  const handleToggleFeatured = async (articleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/i3lam/articles/${articleId}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_featured: !currentStatus })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to toggle featured')
      }

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
      const response = await fetch(`${API_URL}/api/admin/i3lam/articles/${deleteArticle.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Delete failed')

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
                          {cat.name_fr}
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
                    <TableHead>Vues</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Modifié</TableHead>
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
                          <div className="flex items-center gap-2">
                            {article.is_featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <div>
                              <div className="font-medium max-w-md truncate">{article.title}</div>
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
                        <TableCell>{article.views_count.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(article.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(article.updated_at)}
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
                {viewArticle.featured_image && (
                  <img
                    src={viewArticle.featured_image}
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

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="settings">Paramètres & SEO</TabsTrigger>
                <TabsTrigger value="scheduling">Planification</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'article</Label>
                  <Input
                    id="title"
                    placeholder="Entrez le titre..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Extrait (Brève description)</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Un court résumé pour les listes..."
                    value={formData.excerpt || ''}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                  />
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
                <div className="grid grid-cols-2 gap-4">
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
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name_fr}
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
                      <SelectTrigger id="status-select">
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

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="featured-switch"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="featured-switch" className="flex items-center gap-2 cursor-pointer">
                    <Star className={`h-4 w-4 ${formData.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    Mettre en avant sur la page d'accueil
                  </Label>
                </div>

                <div className="space-y-2 pt-4">
                  <Label htmlFor="thumbnail-url">Image miniature (URL)</Label>
                  <Input
                    id="thumbnail-url"
                    placeholder="https://..."
                    value={formData.thumbnail || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  />
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Optimisation SEO
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="seo-slug-input">URL personnalisée (Slug)</Label>
                    <Input
                      id="seo-slug-input"
                      placeholder="mon-titre-article"
                      value={formData.seo_slug || ''}
                      onChange={(e) => setFormData({ ...formData, seo_slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta-title-input">Meta Title</Label>
                    <Input
                      id="meta-title-input"
                      placeholder="Titre pour Google..."
                      value={formData.meta_title || ''}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta-desc-input">Meta Description</Label>
                    <Textarea
                      id="meta-desc-input"
                      placeholder="Description pour les résultats de recherche..."
                      value={formData.meta_description || ''}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scheduling" className="space-y-4 pt-4">
                <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Planification de publication</h4>
                    <p className="text-sm text-muted-foreground">
                      L'article sera automatiquement publié à la date et l'heure sélectionnées si le statut est défini sur "Planifié".
                    </p>
                  </div>
                </div>
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="scheduled-at-input">Date et heure de publication</Label>
                  <Input
                    id="scheduled-at-input"
                    type="datetime-local"
                    value={formData.scheduled_at || ''}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  />
                </div>
                {formData.article_status !== 'planifie' && formData.scheduled_at && (
                  <p className="text-sm text-yellow-600 font-medium">
                    ⚠️ Note: N'oubliez pas de changer le statut en "Planifié" pour activer la publication automatique.
                  </p>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : editingArticle ? 'Mettre à jour' : 'Créer l\'article'}
              </Button>
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
