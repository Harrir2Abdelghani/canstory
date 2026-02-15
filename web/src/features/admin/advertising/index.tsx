import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Megaphone, Search, Eye, CheckCircle, XCircle, Clock, AlertTriangle, Filter, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { apiClient } from '@/lib/api-client'

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Advertisement {
  id: string
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  ad_type: string
  duration_days: number
  start_date: string | null
  end_date: string | null
  target_audience: string | null
  budget: number | null
  creative_assets: any
  description: string | null
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
  reviewer?: { id: string; full_name: string } | null
  computed_status?: string
  is_active?: boolean
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  expired: number
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

export function AdvertisingManagement() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, expired: 0 })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchAdvertisements()
    fetchStats()
  }, [statusFilter, typeFilter])

  const fetchAdvertisements = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter
      if (typeFilter && typeFilter !== 'all') params.ad_type = typeFilter

      const { data } = await apiClient.instance.get('/admin/advertisements', {
        params
      })

      setAdvertisements(data)
    } catch (error) {
      console.error('Fetch advertisements error:', error)
      toast.error('Erreur lors du chargement des publicités')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.instance.get('/admin/advertisements/stats')
      setStats(data)
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Approuver cette demande publicitaire ?')) return

    try {
      await apiClient.instance.put(`/admin/advertisements/${id}/approve`)

      toast.success('Publicité approuvée')
      await fetchAdvertisements()
      await fetchStats()
      setIsDetailDialogOpen(false)
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Erreur lors de l\'approbation')
    }
  }

  const handleReject = async () => {
    if (!selectedAd) return

    if (!rejectionReason.trim()) {
      toast.error('Veuillez fournir une raison de rejet')
      return
    }

    try {
      await apiClient.instance.put(`/admin/advertisements/${selectedAd.id}/reject`, { reason: rejectionReason })

      toast.success('Publicité rejetée')
      setIsRejectDialogOpen(false)
      setRejectionReason('')
      await fetchAdvertisements()
      await fetchStats()
      setIsDetailDialogOpen(false)
    } catch (error) {
      console.error('Reject error:', error)
      toast.error('Erreur lors du rejet')
    }
  }

  const handleExpire = async (id: string) => {
    if (!confirm('Marquer cette publicité comme expirée ?')) return

    try {
      await apiClient.instance.put(`/admin/advertisements/${id}/expire`)

      toast.success('Publicité marquée comme expirée')
      await fetchAdvertisements()
      await fetchStats()
      setIsDetailDialogOpen(false)
    } catch (error) {
      console.error('Expire error:', error)
      toast.error('Erreur lors de l\'expiration')
    }
  }

  const handleViewDetails = (ad: Advertisement) => {
    setSelectedAd(ad)
    setIsDetailDialogOpen(true)
  }

  const openRejectDialog = (ad: Advertisement) => {
    setSelectedAd(ad)
    setIsRejectDialogOpen(true)
  }

  const getStatusBadge = (ad: Advertisement) => {
    const status = ad.computed_status || ad.status

    switch (status) {
      case 'pending':
        return <Badge className='bg-yellow-500 hover:bg-yellow-600'><Clock className='h-3 w-3 mr-1' />En attente</Badge>
      case 'approved':
        return ad.is_active 
          ? <Badge className='bg-green-500 hover:bg-green-600'><CheckCircle className='h-3 w-3 mr-1' />Approuvé</Badge>
          : <Badge className='bg-gray-500 hover:bg-gray-600'><AlertTriangle className='h-3 w-3 mr-1' />Expiré</Badge>
      case 'rejected':
        return <Badge className='bg-red-500 hover:bg-red-600'><XCircle className='h-3 w-3 mr-1' />Rejeté</Badge>
      case 'expired':
        return <Badge className='bg-gray-500 hover:bg-gray-600'><AlertTriangle className='h-3 w-3 mr-1' />Expiré</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(amount)
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
              <h1 className='text-3xl font-bold tracking-tight'>Gestion des Demandes Publicitaires</h1>
              <p className='text-muted-foreground mt-2'>
                Gérez les demandes de publicité pour l&apos;application mobile
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-5'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total</CardTitle>
                <Megaphone className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total}</div>
                <p className='text-xs text-muted-foreground'>Demandes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>En Attente</CardTitle>
                <Clock className='h-4 w-4 text-yellow-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.pending}</div>
                <p className='text-xs text-muted-foreground'>À traiter</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Approuvées</CardTitle>
                <CheckCircle className='h-4 w-4 text-green-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.approved}</div>
                <p className='text-xs text-muted-foreground'>Actives</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Rejetées</CardTitle>
                <XCircle className='h-4 w-4 text-red-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.rejected}</div>
                <p className='text-xs text-muted-foreground'>Refusées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Expirées</CardTitle>
                <AlertTriangle className='h-4 w-4 text-gray-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.expired}</div>
                <p className='text-xs text-muted-foreground'>Terminées</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <CardTitle>Demandes Publicitaires</CardTitle>
              <CardDescription>
                Liste complète des demandes de publicité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className='flex flex-wrap items-center gap-4 mb-6'>
                <div className='relative flex-1 min-w-[200px]'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Rechercher par entreprise ou contact...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchAdvertisements()
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
                    <SelectItem value='approved'>Approuvées</SelectItem>
                    <SelectItem value='rejected'>Rejetées</SelectItem>
                    <SelectItem value='expired'>Expirées</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tous les types</SelectItem>
                    <SelectItem value='banner'>Banner</SelectItem>
                    <SelectItem value='sponsored'>Sponsored</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchAdvertisements} variant='outline' className='gap-2'>
                  <Filter className='h-4 w-4' />
                  Filtrer
                </Button>
              </div>

              {/* Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de soumission</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className='text-center py-8'>
                          Chargement...
                        </TableCell>
                      </TableRow>
                    ) : advertisements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                          Aucune demande trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      advertisements.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell className='font-medium'>
                            <div className='flex items-center gap-2'>
                              <Megaphone className='h-4 w-4 text-muted-foreground' />
                              <div>
                                <div>{ad.company_name}</div>
                                <div className='text-xs text-muted-foreground'>{ad.contact_name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline'>{ad.ad_type}</Badge>
                          </TableCell>
                          <TableCell>{ad.duration_days} jours</TableCell>
                          <TableCell>{getStatusBadge(ad)}</TableCell>
                          <TableCell>{formatDate(ad.created_at)}</TableCell>
                          <TableCell className='text-right'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-8 gap-2'
                              onClick={() => handleViewDetails(ad)}
                            >
                              <Eye className='h-4 w-4' />
                              Voir
                            </Button>
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Détails de la demande publicitaire</DialogTitle>
            <DialogDescription>
              {selectedAd?.company_name}
            </DialogDescription>
          </DialogHeader>
          {selectedAd && (
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium'>Entreprise</Label>
                  <p className='text-sm'>{selectedAd.company_name}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Contact</Label>
                  <p className='text-sm'>{selectedAd.contact_name}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium'>Email</Label>
                  <p className='text-sm'>{selectedAd.contact_email}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Téléphone</Label>
                  <p className='text-sm'>{selectedAd.contact_phone}</p>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label className='text-sm font-medium'>Type</Label>
                  <p className='text-sm'>{selectedAd.ad_type}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Durée</Label>
                  <p className='text-sm'>{selectedAd.duration_days} jours</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Budget</Label>
                  <p className='text-sm'>{formatCurrency(selectedAd.budget)}</p>
                </div>
              </div>

              {selectedAd.start_date && selectedAd.end_date && (
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium'>Date de début</Label>
                    <p className='text-sm'>{formatDate(selectedAd.start_date)}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium'>Date de fin</Label>
                    <p className='text-sm'>{formatDate(selectedAd.end_date)}</p>
                  </div>
                </div>
              )}

              {selectedAd.target_audience && (
                <div>
                  <Label className='text-sm font-medium'>Audience cible</Label>
                  <p className='text-sm'>{selectedAd.target_audience}</p>
                </div>
              )}

              {selectedAd.description && (
                <div>
                  <Label className='text-sm font-medium'>Description</Label>
                  <p className='text-sm'>{selectedAd.description}</p>
                </div>
              )}

              {selectedAd.creative_assets && (
                <div>
                  <Label className='text-sm font-medium'>Ressources créatives</Label>
                  {selectedAd.creative_assets.banner_url && (
                    <div className='mt-2'>
                      <a 
                        href={selectedAd.creative_assets.banner_url} 
                        target='_blank' 
                        rel='noopener noreferrer'
                        className='text-sm text-blue-600 hover:underline flex items-center gap-1'
                      >
                        <ExternalLink className='h-3 w-3' />
                        Voir la bannière
                      </a>
                    </div>
                  )}
                  {selectedAd.creative_assets.redirect_url && (
                    <div className='mt-1'>
                      <a 
                        href={selectedAd.creative_assets.redirect_url} 
                        target='_blank' 
                        rel='noopener noreferrer'
                        className='text-sm text-blue-600 hover:underline flex items-center gap-1'
                      >
                        <ExternalLink className='h-3 w-3' />
                        URL de redirection
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className='text-sm font-medium'>Statut</Label>
                <div className='mt-1'>{getStatusBadge(selectedAd)}</div>
              </div>

              {selectedAd.rejection_reason && (
                <div>
                  <Label className='text-sm font-medium text-red-600'>Raison du rejet</Label>
                  <p className='text-sm'>{selectedAd.rejection_reason}</p>
                </div>
              )}

              {selectedAd.reviewer && (
                <div>
                  <Label className='text-sm font-medium'>Examiné par</Label>
                  <p className='text-sm'>{selectedAd.reviewer.full_name} le {formatDate(selectedAd.reviewed_at)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedAd?.status === 'pending' && (
              <>
                <Button variant='outline' onClick={() => openRejectDialog(selectedAd)}>
                  <XCircle className='h-4 w-4 mr-2' />
                  Rejeter
                </Button>
                <Button onClick={() => handleApprove(selectedAd.id)}>
                  <CheckCircle className='h-4 w-4 mr-2' />
                  Approuver
                </Button>
              </>
            )}
            {selectedAd?.status === 'approved' && selectedAd.is_active && (
              <Button variant='outline' onClick={() => handleExpire(selectedAd.id)}>
                <AlertTriangle className='h-4 w-4 mr-2' />
                Marquer comme expiré
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='reason'>Raison du rejet *</Label>
              <Textarea
                id='reason'
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder='Expliquez pourquoi cette demande est rejetée...'
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant='destructive' onClick={handleReject}>
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
