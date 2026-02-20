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
import { Megaphone, Search, Eye, CheckCircle, XCircle, Clock, AlertTriangle, Filter, ExternalLink, Calendar, Mail, Phone, ShieldCheck, Check } from 'lucide-react'
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
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
    try {
      setActionLoading(id)
      await apiClient.instance.put(`/admin/advertisements/${id}/approve`)

      toast.success('Publicité approuvée')
      await fetchAdvertisements()
      await fetchStats()
      setIsDetailDialogOpen(false)
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Erreur lors de l\'approbation')
    } finally {
      setActionLoading(null)
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
    try {
      setActionLoading(id)
      await apiClient.instance.put(`/admin/advertisements/${id}/expire`)

      toast.success('Publicité marquée comme expirée')
      await fetchAdvertisements()
      await fetchStats()
      setIsDetailDialogOpen(false)
    } catch (error) {
      console.error('Expire error:', error)
      toast.error('Erreur lors de l\'expiration')
    } finally {
      setActionLoading(null)
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
                        <TableRow 
                          key={ad.id}
                          className='hover:bg-muted/50 transition-colors cursor-pointer group'
                          onClick={() => handleViewDetails(ad)}
                        >
                          <TableCell className='font-medium'>
                            <div className='flex items-center gap-2'>
                              <div className='h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0'>
                                <Megaphone className='h-4 w-4' />
                              </div>
                              <div className='truncate max-w-[200px]'>
                                <div className='font-bold group-hover:text-primary transition-colors'>{ad.company_name}</div>
                                <div className='text-[10px] text-muted-foreground uppercase tracking-wider font-semibold'>{ad.contact_name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline' className='bg-slate-50 border-slate-200 text-slate-600 font-normal uppercase text-[10px]'>
                              {ad.ad_type}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-sm text-slate-500'>
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              {ad.duration_days}j
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(ad)}</TableCell>
                          <TableCell className='text-sm text-slate-500'>{formatDate(ad.created_at)}</TableCell>
                          <TableCell className='text-right' onClick={(e) => e.stopPropagation()}>
                            <div className='flex items-center justify-end gap-1'>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size='icon'
                                      variant='ghost'
                                      className='h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                      onClick={() => handleViewDetails(ad)}
                                    >
                                      <Eye className='h-4 w-4' />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Détails</TooltipContent>
                                </Tooltip>

                                {(ad.computed_status === 'pending' || ad.status === 'pending') && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size='icon'
                                          variant='ghost'
                                          disabled={actionLoading === ad.id}
                                          className='h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50'
                                          onClick={() => handleApprove(ad.id)}
                                        >
                                          {actionLoading === ad.id ? (
                                            <div className='h-3 w-3 animate-spin rounded-full border-2 border-green-600 border-t-transparent' />
                                          ) : (
                                            <Check className='h-4 w-4' />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Approuver</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size='icon'
                                          variant='ghost'
                                          className='h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50'
                                          onClick={() => openRejectDialog(ad)}
                                        >
                                          <XCircle className='h-4 w-4' />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Rejeter</TooltipContent>
                                    </Tooltip>
                                  </>
                                )}

                                {ad.status === 'approved' && ad.is_active && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size='icon'
                                        variant='ghost'
                                        disabled={actionLoading === ad.id}
                                        className='h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                        onClick={() => handleExpire(ad.id)}
                                      >
                                        {actionLoading === ad.id ? (
                                          <div className='h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-transparent' />
                                        ) : (
                                          <AlertTriangle className='h-4 w-4' />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Expirer</TooltipContent>
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden rounded-2xl'>
          {/* Simple Clean Header */}
          <div className='flex items-center justify-between mb-4 pb-4 border-b shrink-0'>
            <div className='space-y-1'>
               <h2 className='text-2xl font-bold text-slate-900'>{selectedAd?.company_name}</h2>
               <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-slate-500 border-slate-200 uppercase text-[10px] tracking-wider font-semibold bg-slate-50'>
                    {selectedAd?.ad_type}
                  </Badge>
                  {selectedAd && getStatusBadge(selectedAd)}
               </div>
            </div>
            <div className='h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center'>
               <Megaphone className='h-6 w-6' />
            </div>
          </div>

          <div className='flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar'>
            {/* Essential Info Grid */}
            <div className='grid grid-cols-2 gap-8'>
              <div className='space-y-4'>
                <div className='space-y-1'>
                  <p className='text-[10px] font-black uppercase text-slate-400 tracking-wider'>Contact Responsable</p>
                  <p className='text-sm font-bold text-slate-900'>{selectedAd?.contact_name}</p>
                  <div className='space-y-1 pt-1'>
                    <p className='text-xs text-slate-500 flex items-center gap-2'><Mail className='w-3 h-3' />{selectedAd?.contact_email}</p>
                    <p className='text-xs text-slate-500 flex items-center gap-2'><Phone className='w-3 h-3' />{selectedAd?.contact_phone}</p>
                  </div>
                </div>

                <div className='space-y-1'>
                  <p className='text-[10px] font-black uppercase text-slate-400 tracking-wider'>Période de Diffusion</p>
                  <div className='flex items-center gap-2 py-1'>
                    <div className='px-2 py-1 bg-slate-100 rounded text-[11px] font-bold text-slate-600 flex items-center gap-1'>
                      <Calendar className='w-3 h-3' /> {formatDate(selectedAd?.start_date || null)}
                    </div>
                    <span className='text-slate-300'>→</span>
                    <div className='px-2 py-1 bg-slate-100 rounded text-[11px] font-bold text-slate-600'>
                      {formatDate(selectedAd?.end_date || null)}
                    </div>
                  </div>
                  <p className='text-[10px] text-slate-400 italic'>Durée totale : {selectedAd?.duration_days} jours</p>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='space-y-1'>
                  <p className='text-[10px] font-black uppercase text-slate-400 tracking-wider'>Budget de Campagne</p>
                  <p className='text-xl font-black text-emerald-600'>{formatCurrency(selectedAd?.budget || 0)}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-[10px] font-black uppercase text-slate-400 tracking-wider'>Audience Cible</p>
                  <p className='text-sm font-medium text-slate-700 leading-snug'>
                    {selectedAd?.target_audience || 'Non spécifiée'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content & Creative Assets */}
            <div className='space-y-6 pt-2'>
              {selectedAd?.description && (
                <div className='space-y-2'>
                  <p className='text-[10px] font-black uppercase text-slate-400 tracking-wider'>Description du contenu</p>
                  <div className='p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed italic'>
                    "{selectedAd.description}"
                  </div>
                </div>
              )}

              {selectedAd?.creative_assets && (
                <div className='space-y-3'>
                  <p className='text-[10px] font-black uppercase text-slate-400 tracking-wider'>Ressources pour Validation</p>
                  <div className='flex flex-wrap gap-3'>
                    {selectedAd.creative_assets.banner_url && (
                      <Button asChild variant='outline' size='sm' className='rounded-full h-9 border-slate-200 bg-white hover:bg-slate-50 hover:text-primary transition-all shadow-sm'>
                        <a href={selectedAd.creative_assets.banner_url} target='_blank' rel='noopener noreferrer' className='flex items-center gap-2'>
                          <Eye className='w-4 h-4' /> Voir le visuel
                        </a>
                      </Button>
                    )}
                    {selectedAd.creative_assets.redirect_url && (
                      <Button asChild variant='outline' size='sm' className='rounded-full h-9 border-slate-200 bg-white hover:bg-slate-50 hover:text-primary transition-all shadow-sm'>
                        <a href={selectedAd.creative_assets.redirect_url} target='_blank' rel='noopener noreferrer' className='flex items-center gap-2'>
                          <ExternalLink className='w-4 h-4' /> Destination (Clic)
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {selectedAd?.reviewer && (
                <div className='flex items-center gap-2 py-3 px-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50'>
                  <ShieldCheck className='w-4 h-4 text-emerald-600' />
                  <p className='text-xs text-emerald-800 font-medium'>
                    Validé par <span className='font-bold'>{selectedAd.reviewer.full_name}</span> le {formatDate(selectedAd.reviewed_at)}
                  </p>
                </div>
              )}

              {selectedAd?.rejection_reason && (
                <div className='flex items-center gap-2 py-3 px-4 bg-red-50 rounded-xl border border-red-100'>
                  <AlertTriangle className='w-4 h-4 text-red-600' />
                  <p className='text-xs text-red-800 font-medium'>
                    <span className='font-bold'>Raison du rejet :</span> {selectedAd.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className='mt-8 pt-4 border-t flex items-center justify-between gap-3 shrink-0'>
            <div className='flex items-center gap-2'>
              {(selectedAd?.status === 'pending' || selectedAd?.computed_status === 'pending') && (
                <>
                  <Button 
                    variant='outline' 
                    onClick={() => openRejectDialog(selectedAd)}
                    className='rounded-full px-6 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                  >
                    Rejeter
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedAd.id)}
                    disabled={actionLoading === selectedAd.id}
                    className='rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 gap-2'
                  >
                    {actionLoading === selectedAd.id ? (
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                    ) : (
                      <CheckCircle className='h-4 w-4' />
                    )}
                    Approuver la demande
                  </Button>
                </>
              )}
              {selectedAd?.status === 'approved' && selectedAd.is_active && (
                <Button 
                  variant='outline' 
                  onClick={() => handleExpire(selectedAd.id)}
                  disabled={actionLoading === selectedAd.id}
                  className='rounded-full px-6 gap-2'
                >
                  <AlertTriangle className='h-4 w-4' />
                  Marquer comme expiré
                </Button>
              )}
            </div>
            <Button variant='ghost' onClick={() => setIsDetailDialogOpen(false)} className='rounded-full px-6 text-slate-500'>
              Fermer
            </Button>
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
