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
import { Switch } from '@/components/ui/switch'
import { Home, Search, Plus, Edit, Trash2, Phone, Bed, Users, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Accommodation {
  id: string
  provider_id: string
  name: string
  description: string | null
  address: string
  wilaya: string
  commune: string
  phone: string
  email: string | null
  capacity: number
  available_beds: number
  amenities: string[] | null
  rules: string[] | null
  photos: string[] | null
  is_active: boolean
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
  availability_status?: 'available' | 'full' | 'inactive'
}

interface Stats {
  total: number
  available: number
  full: number
  inactive: number
  total_capacity: number
  total_available_beds: number
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

const ALGERIAN_WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane'
]

const emptyForm = {
  name: '',
  description: '',
  address: '',
  wilaya: '',
  commune: '',
  phone: '',
  email: '',
  capacity: 1,
  available_beds: 0,
  amenities: '',
  rules: '',
  is_active: true,
  latitude: null as number | null,
  longitude: null as number | null,
}

export function AccommodationsManagement() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, available: 0, full: 0, inactive: 0, total_capacity: 0, total_available_beds: 0 })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [wilayaFilter, setWilayaFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    fetchAccommodations()
    fetchStats()
  }, [wilayaFilter, availabilityFilter])

  const fetchAccommodations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (wilayaFilter && wilayaFilter !== 'all') params.append('wilaya', wilayaFilter)
      if (availabilityFilter && availabilityFilter !== 'all') params.append('disponibilite', availabilityFilter)

      const res = await fetch(`${API_BASE}/api/admin/accommodations?${params.toString()}`, {
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Failed to fetch accommodations')
      }

      const data = await res.json()
      setAccommodations(data)
    } catch (error) {
      console.error('Fetch accommodations error:', error)
      toast.error('Erreur lors du chargement des logements')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/accommodations/stats`, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom est requis')
      return
    }
    if (!formData.wilaya) {
      toast.error('La wilaya est requise')
      return
    }
    if (!formData.commune.trim()) {
      toast.error('La commune est requise')
      return
    }
    if (!formData.address.trim()) {
      toast.error('L\'adresse est requise')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('Le téléphone est requis')
      return
    }
    if (formData.capacity < 1) {
      toast.error('La capacité doit être au moins 1')
      return
    }
    if (formData.available_beds < 0) {
      toast.error('Les places disponibles doivent être >= 0')
      return
    }
    if (formData.available_beds > formData.capacity) {
      toast.error('Les places disponibles ne peuvent pas dépasser la capacité totale')
      return
    }

    try {
      const payload = {
        ...formData,
        amenities: formData.amenities ? formData.amenities.split('\n').filter(Boolean) : [],
        rules: formData.rules ? formData.rules.split('\n').filter(Boolean) : [],
      }

      const url = editingId 
        ? `${API_BASE}/api/admin/accommodations/${editingId}`
        : `${API_BASE}/api/admin/accommodations`

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast.success(editingId ? 'Logement mis à jour' : 'Logement créé')
      setIsDialogOpen(false)
      setEditingId(null)
      setFormData(emptyForm)
      await fetchAccommodations()
      await fetchStats()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (accommodation: Accommodation) => {
    setEditingId(accommodation.id)
    setFormData({
      name: accommodation.name,
      description: accommodation.description || '',
      address: accommodation.address,
      wilaya: accommodation.wilaya,
      commune: accommodation.commune,
      phone: accommodation.phone,
      email: accommodation.email || '',
      capacity: accommodation.capacity,
      available_beds: accommodation.available_beds,
      amenities: accommodation.amenities?.join('\n') || '',
      rules: accommodation.rules?.join('\n') || '',
      is_active: accommodation.is_active,
      latitude: accommodation.latitude,
      longitude: accommodation.longitude,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce logement ?')) return

    try {
      const res = await fetch(`${API_BASE}/api/admin/accommodations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Failed to delete')
      }

      toast.success('Logement supprimé')
      await fetchAccommodations()
      await fetchStats()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleAddNew = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setIsDialogOpen(true)
  }

  const getAvailabilityBadge = (accommodation: Accommodation) => {
    if (!accommodation.is_active) {
      return <Badge variant='outline' className='bg-gray-100 text-gray-800'>Inactif</Badge>
    }
    if (accommodation.available_beds > 0) {
      return <Badge className='bg-green-500 hover:bg-green-600'>Disponible</Badge>
    }
    return <Badge className='bg-red-500 hover:bg-red-600'>Complet</Badge>
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
              <h1 className='text-3xl font-bold tracking-tight'>Gestion des Logements Gratuits</h1>
              <p className='text-muted-foreground mt-2'>
                Gérez les logements gratuits pour les patients
              </p>
            </div>
            <Button onClick={handleAddNew} className='gap-2'>
              <Plus className='h-4 w-4' />
              Ajouter un logement
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Logements</CardTitle>
                <Home className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total}</div>
                <p className='text-xs text-muted-foreground'>Enregistrés</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Disponibles</CardTitle>
                <Bed className='h-4 w-4 text-green-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.available}</div>
                <p className='text-xs text-muted-foreground'>Avec places libres</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Capacité Totale</CardTitle>
                <Users className='h-4 w-4 text-blue-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total_capacity}</div>
                <p className='text-xs text-muted-foreground'>Places au total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Places Disponibles</CardTitle>
                <Bed className='h-4 w-4 text-orange-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total_available_beds}</div>
                <p className='text-xs text-muted-foreground'>Actuellement libres</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <CardTitle>Logements</CardTitle>
              <CardDescription>
                Liste complète des logements gratuits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className='flex flex-wrap items-center gap-4 mb-6'>
                <div className='relative flex-1 min-w-[200px]'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Rechercher par nom ou wilaya...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchAccommodations()
                      }
                    }}
                    className='pl-10'
                  />
                </div>
                <Select value={wilayaFilter} onValueChange={setWilayaFilter}>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder='Wilaya' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Toutes les wilayas</SelectItem>
                    {ALGERIAN_WILAYAS.map(wilaya => (
                      <SelectItem key={wilaya} value={wilaya}>{wilaya}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Disponibilité' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tous</SelectItem>
                    <SelectItem value='available'>Disponibles</SelectItem>
                    <SelectItem value='full'>Complets</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchAccommodations} variant='outline' className='gap-2'>
                  <Filter className='h-4 w-4' />
                  Filtrer
                </Button>
              </div>

              {/* Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Wilaya</TableHead>
                      <TableHead>Capacité</TableHead>
                      <TableHead>Places Disponibles</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actif</TableHead>
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
                    ) : accommodations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>
                          Aucun logement trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      accommodations.map((accommodation) => (
                        <TableRow key={accommodation.id}>
                          <TableCell className='font-medium'>
                            <div className='flex items-center gap-2'>
                              <Home className='h-4 w-4 text-muted-foreground' />
                              {accommodation.name}
                            </div>
                          </TableCell>
                          <TableCell>{accommodation.wilaya}</TableCell>
                          <TableCell>{accommodation.capacity}</TableCell>
                          <TableCell>
                            <span className={accommodation.available_beds > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                              {accommodation.available_beds}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1 text-sm'>
                              <Phone className='h-3 w-3' />
                              {accommodation.phone}
                            </div>
                          </TableCell>
                          <TableCell>{getAvailabilityBadge(accommodation)}</TableCell>
                          <TableCell>
                            {accommodation.is_active ? (
                              <Badge variant='outline' className='bg-green-50 text-green-700'>Actif</Badge>
                            ) : (
                              <Badge variant='outline' className='bg-gray-50 text-gray-700'>Inactif</Badge>
                            )}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8 w-8 p-0'
                                onClick={() => handleEdit(accommodation)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                                onClick={() => handleDelete(accommodation.id)}
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
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier le logement' : 'Ajouter un logement'}</DialogTitle>
            <DialogDescription>
              Remplissez les informations du logement
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Nom *</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Maison d'Accueil..."
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phone'>Téléphone *</Label>
                  <Input
                    id='phone'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder='+213...'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='wilaya'>Wilaya *</Label>
                  <Select value={formData.wilaya} onValueChange={(value) => setFormData({ ...formData, wilaya: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder='Sélectionner' />
                    </SelectTrigger>
                    <SelectContent>
                      {ALGERIAN_WILAYAS.map(wilaya => (
                        <SelectItem key={wilaya} value={wilaya}>{wilaya}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='commune'>Commune *</Label>
                  <Input
                    id='commune'
                    value={formData.commune}
                    onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                    placeholder='Commune'
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='address'>Adresse complète *</Label>
                <Input
                  id='address'
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder='15 Rue...'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder='contact@...'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='capacity'>Capacité totale *</Label>
                  <Input
                    id='capacity'
                    type='number'
                    min='1'
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='available_beds'>Places disponibles *</Label>
                  <Input
                    id='available_beds'
                    type='number'
                    min='0'
                    max={formData.capacity}
                    value={formData.available_beds}
                    onChange={(e) => setFormData({ ...formData, available_beds: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description détaillée</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder='Description du logement...'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='amenities'>Équipements (un par ligne)</Label>
                <Textarea
                  id='amenities'
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder={'WiFi gratuit\nCuisine équipée\nParking'}
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='rules'>Conditions d&apos;hébergement (une par ligne)</Label>
                <Textarea
                  id='rules'
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  placeholder={'Interdiction de fumer\nRespect des horaires'}
                  rows={3}
                />
              </div>

              <div className='flex items-center space-x-2'>
                <Switch
                  id='is_active'
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor='is_active'>Logement actif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type='submit'>
                {editingId ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
