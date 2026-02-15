import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { MessageSquare, Search, Check, X, Eye, Flag, AlertTriangle, Trash2, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    email: string
    role: string
    avatar_url: string | null
  }
  post: {
    id: string
    title: string
    cancer_type: string | null
    status: string | null
  }
  status: 'approved' | 'pending' | 'flagged' | 'rejected'
  reports_count: number
  reports: Array<{
    id: string
    reason: string
    description: string
    created_at: string
  }>
  moderated_by: string | null
  moderated_at: string | null
  moderation_reason: string | null
  is_anonymous: boolean
  likes_count: number
  created_at: string
  updated_at: string
}

interface Stats {
  total: number
  approved: number
  pending: number
  reported: number
  rejected: number
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

const CANCER_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'breast', label: 'Cancer du sein' },
  { value: 'lung', label: 'Cancer du poumon' },
  { value: 'colon', label: 'Cancer du côlon' },
  { value: 'prostate', label: 'Cancer de la prostate' },
  { value: 'uterus', label: 'Cancer de l\'utérus' },
  { value: 'other', label: 'Autre' },
]

export function CommentsModeration() {
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, reported: 0, rejected: 0 })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [articleTypeFilter, setArticleTypeFilter] = useState('all')
  const [minReportsFilter, setMinReportsFilter] = useState('')
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchComments()
    fetchStats()
  }, [statusFilter, articleTypeFilter, minReportsFilter])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (articleTypeFilter && articleTypeFilter !== 'all') params.append('article_type', articleTypeFilter)
      if (minReportsFilter) params.append('min_reports', minReportsFilter)

      const res = await fetch(`${API_BASE}/api/admin/comments?${params.toString()}`, {
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Failed to fetch comments')
      }

      const data = await res.json()
      setComments(data)
    } catch (error) {
      console.error('Fetch comments error:', error)
      toast.error('Erreur lors du chargement des commentaires')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/comments/stats`, {
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const handleUpdateStatus = async (id: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/comments/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      })

      if (!res.ok) {
        throw new Error('Failed to update status')
      }

      toast.success(`Commentaire ${status === 'approved' ? 'approuvé' : status === 'rejected' ? 'rejeté' : 'mis à jour'}`)
      await fetchComments()
      await fetchStats()
    } catch (error) {
      console.error('Update status error:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return

    try {
      const res = await fetch(`${API_BASE}/api/admin/comments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Failed to delete')
      }

      toast.success('Commentaire supprimé')
      await fetchComments()
      await fetchStats()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedComments.size === 0) {
      toast.error('Aucun commentaire sélectionné')
      return
    }

    const actionText = action === 'approve' ? 'approuver' : action === 'reject' ? 'rejeter' : 'supprimer'
    if (!confirm(`Voulez-vous vraiment ${actionText} ${selectedComments.size} commentaire(s) ?`)) return

    try {
      const res = await fetch(`${API_BASE}/api/admin/comments/bulk-action`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentIds: Array.from(selectedComments),
          action
        })
      })

      if (!res.ok) {
        throw new Error('Failed to perform bulk action')
      }

      const data = await res.json()
      toast.success(data.message)
      setSelectedComments(new Set())
      await fetchComments()
      await fetchStats()
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error('Erreur lors de l\'action groupée')
    }
  }

  const handleViewComment = (comment: Comment) => {
    setSelectedComment(comment)
    setIsViewDialogOpen(true)
  }

  const handleSelectAll = () => {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set())
    } else {
      setSelectedComments(new Set(comments.map(c => c.id)))
    }
  }

  const handleSelectComment = (id: string) => {
    const newSelected = new Set(selectedComments)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedComments(newSelected)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className='bg-green-500 hover:bg-green-600'>Approuvé</Badge>
      case 'pending':
        return <Badge className='bg-yellow-500 hover:bg-yellow-600'>En attente</Badge>
      case 'flagged':
        return <Badge className='bg-orange-500 hover:bg-orange-600'>Signalé</Badge>
      case 'rejected':
        return <Badge className='bg-red-500 hover:bg-red-600'>Rejeté</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      patient: 'bg-blue-100 text-blue-800',
      doctor: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      association: 'bg-green-100 text-green-800',
      pharmacy: 'bg-cyan-100 text-cyan-800',
    }
    return <Badge variant='outline' className={colors[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>
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
              <h1 className='text-3xl font-bold tracking-tight'>Modération des Commentaires</h1>
              <p className='text-muted-foreground mt-2'>
                Gérez et modérez les commentaires de la communauté
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-5'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total</CardTitle>
                <MessageSquare className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total}</div>
                <p className='text-xs text-muted-foreground'>Commentaires</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Approuvés</CardTitle>
                <Check className='h-4 w-4 text-green-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.approved}</div>
                <p className='text-xs text-muted-foreground'>Validés</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>En attente</CardTitle>
                <MessageSquare className='h-4 w-4 text-yellow-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.pending}</div>
                <p className='text-xs text-muted-foreground'>À modérer</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Signalés</CardTitle>
                <Flag className='h-4 w-4 text-orange-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.reported}</div>
                <p className='text-xs text-muted-foreground'>Avec signalements</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Rejetés</CardTitle>
                <X className='h-4 w-4 text-red-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.rejected}</div>
                <p className='text-xs text-muted-foreground'>Supprimés</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <CardTitle>Commentaires</CardTitle>
              <CardDescription>
                Modérez les commentaires de la communauté
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className='flex flex-wrap items-center gap-4 mb-6'>
                <div className='relative flex-1 min-w-[200px]'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Rechercher par auteur, contenu ou article...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchComments()
                      }
                    }}
                    className='pl-10'
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Statut' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tous les statuts</SelectItem>
                    <SelectItem value='pending'>En attente</SelectItem>
                    <SelectItem value='approved'>Approuvés</SelectItem>
                    <SelectItem value='rejected'>Rejetés</SelectItem>
                    <SelectItem value='flagged'>Signalés</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={articleTypeFilter} onValueChange={setArticleTypeFilter}>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder="Type d'article" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANCER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type='number'
                  placeholder='Min. signalements'
                  value={minReportsFilter}
                  onChange={(e) => setMinReportsFilter(e.target.value)}
                  className='w-[150px]'
                  min='0'
                />
                <Button onClick={fetchComments} variant='outline' className='gap-2'>
                  <Filter className='h-4 w-4' />
                  Filtrer
                </Button>
              </div>

              {/* Bulk Actions */}
              {selectedComments.size > 0 && (
                <div className='flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg'>
                  <span className='text-sm font-medium'>{selectedComments.size} sélectionné(s)</span>
                  <div className='flex gap-2 ml-auto'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='gap-1 text-green-600 hover:text-green-700 hover:bg-green-50'
                      onClick={() => handleBulkAction('approve')}
                    >
                      <Check className='h-3 w-3' />
                      Approuver tout
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='gap-1 text-red-600 hover:text-red-700 hover:bg-red-50'
                      onClick={() => handleBulkAction('reject')}
                    >
                      <X className='h-3 w-3' />
                      Rejeter tout
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='gap-1 text-destructive hover:text-destructive hover:bg-destructive/10'
                      onClick={() => handleBulkAction('delete')}
                    >
                      <Trash2 className='h-3 w-3' />
                      Supprimer tout
                    </Button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[50px]'>
                        <Checkbox
                          checked={selectedComments.size === comments.length && comments.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead>Commentaire</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Signalements</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center py-8'>
                          Chargement...
                        </TableCell>
                      </TableRow>
                    ) : comments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>
                          Aucun commentaire trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      comments.map((comment) => (
                        <TableRow key={comment.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedComments.has(comment.id)}
                              onCheckedChange={() => handleSelectComment(comment.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden'>
                                {comment.author.avatar_url ? (
                                  <img src={comment.author.avatar_url} alt={comment.author.name} className='w-full h-full object-cover' />
                                ) : (
                                  <span className='text-xs font-medium'>{comment.author.name.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <div className='font-medium'>{comment.author.name}</div>
                                {getRoleBadge(comment.author.role)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='max-w-xs'>
                            <div className='truncate'>{comment.content}</div>
                          </TableCell>

                          <TableCell>{getStatusBadge(comment.status)}</TableCell>
                          <TableCell>
                            {comment.reports_count > 0 && (
                              <div className='flex items-center gap-1 text-orange-600'>
                                <AlertTriangle className='h-4 w-4' />
                                <span className='font-medium'>{comment.reports_count}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{new Date(comment.created_at).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              {(comment.status === 'pending' || comment.status === 'flagged') && (
                                <>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50'
                                    onClick={() => handleUpdateStatus(comment.id, 'approved')}
                                  >
                                    <Check className='h-3 w-3' />
                                    Approuver
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50'
                                    onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                                  >
                                    <X className='h-3 w-3' />
                                    Rejeter
                                  </Button>
                                </>
                              )}
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0'
                                onClick={() => handleViewComment(comment)}
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
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

      {/* View Comment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Détails du commentaire</DialogTitle>
            <DialogDescription>
              Examinez le commentaire et prenez une décision
            </DialogDescription>
          </DialogHeader>
          {selectedComment && (
            <div className='space-y-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Auteur</p>
                  <div className='flex items-center gap-2 mt-1'>
                    <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden'>
                      {selectedComment.author.avatar_url ? (
                        <img src={selectedComment.author.avatar_url} alt={selectedComment.author.name} className='w-full h-full object-cover' />
                      ) : (
                        <span className='text-sm font-medium'>{selectedComment.author.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className='text-base font-semibold'>{selectedComment.author.name}</p>
                      {getRoleBadge(selectedComment.author.role)}
                    </div>
                  </div>
                  {selectedComment.author.email && (
                    <p className='text-sm text-muted-foreground mt-1'>{selectedComment.author.email}</p>
                  )}
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Article</p>
                  <p className='text-base mt-1'>{selectedComment.post.title}</p>
                  {selectedComment.post.cancer_type && (
                    <p className='text-sm text-muted-foreground'>Type: {selectedComment.post.cancer_type}</p>
                  )}
                </div>
              </div>

              <div>
                <p className='text-sm font-medium text-muted-foreground'>Commentaire</p>
                <p className='text-base mt-2 p-4 bg-muted rounded-md'>{selectedComment.content}</p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Statut</p>
                  <div className='mt-1'>{getStatusBadge(selectedComment.status)}</div>
                </div>
                {selectedComment.reports_count > 0 && (
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Signalements ({selectedComment.reports_count})</p>
                    <div className='mt-2 space-y-2'>
                      {selectedComment.reports.map((report) => (
                        <div key={report.id} className='p-2 bg-orange-50 border border-orange-200 rounded text-sm'>
                          <p className='font-medium text-orange-900'>{report.reason}</p>
                          {report.description && <p className='text-orange-700 text-xs mt-1'>{report.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedComment.moderated_by && (
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Modération</p>
                  <p className='text-sm mt-1'>Par: {selectedComment.moderated_by}</p>
                  <p className='text-sm'>Date: {new Date(selectedComment.moderated_at!).toLocaleString('fr-FR')}</p>
                  {selectedComment.moderation_reason && (
                    <p className='text-sm'>Raison: {selectedComment.moderation_reason}</p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
            {selectedComment && (selectedComment.status === 'pending' || selectedComment.status === 'flagged') && (
              <>
                <Button
                  variant='outline'
                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                  onClick={() => {
                    handleUpdateStatus(selectedComment.id, 'rejected')
                    setIsViewDialogOpen(false)
                  }}
                >
                  Rejeter
                </Button>
                <Button
                  className='bg-green-600 hover:bg-green-700'
                  onClick={() => {
                    handleUpdateStatus(selectedComment.id, 'approved')
                    setIsViewDialogOpen(false)
                  }}
                >
                  Approuver
                </Button>
              </>
            )}
            {selectedComment && (
              <Button
                variant='outline'
                className='text-destructive hover:text-destructive hover:bg-destructive/10'
                onClick={() => {
                  handleDelete(selectedComment.id)
                  setIsViewDialogOpen(false)
                }}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Supprimer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
