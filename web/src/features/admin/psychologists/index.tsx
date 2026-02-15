import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Search, Plus, Edit, Trash2, Check, X, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface Psychologist {
  id: string
  name: string
  specialization: string[]
  wilaya: string
  phone: string
  email: string
  status: 'verified' | 'pending' | 'rejected'
  consultationFee?: number
  onlineConsultation: boolean
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

export function PsychologistsManagement() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchPsychologists()
  }, [])

  const fetchPsychologists = async () => {
    try {
      // TODO: Replace with actual Supabase API call
      // const { data } = await supabase.from('psychologists').select('*').order('created_at', { ascending: false })
      // setPsychologists(data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des psychologues')
    }
  }

  const filteredPsychologists = psychologists.filter(psy =>
    psy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    psy.wilaya.toLowerCase().includes(searchTerm.toLowerCase()) ||
    psy.specialization.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )


  const handleVerify = async (id: string) => {
    try {
      // TODO: Implement Supabase update
      // await supabase.from('psychologists').update({ status: 'verified', verified_at: new Date().toISOString() }).eq('id', id)
      setPsychologists(psychologists.map(p => p.id === id ? { ...p, status: 'verified' as const } : p))
      toast.success('Psychologue vérifié')
    } catch (error) {
      toast.error('Erreur lors de la vérification')
    }
  }

  const handleReject = async (id: string) => {
    try {
      // TODO: Implement Supabase update
      // await supabase.from('psychologists').update({ status: 'rejected' }).eq('id', id)
      setPsychologists(psychologists.map(p => p.id === id ? { ...p, status: 'rejected' as const } : p))
      toast.error('Psychologue rejeté')
    } catch (error) {
      toast.error('Erreur lors du rejet')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement Supabase delete
      // await supabase.from('psychologists').delete().eq('id', id)
      setPsychologists(psychologists.filter(p => p.id !== id))
      toast.success('Psychologue supprimé')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const stats = {
    total: psychologists.length,
    verified: psychologists.filter(p => p.status === 'verified').length,
    pending: psychologists.filter(p => p.status === 'pending').length,
    online: psychologists.filter(p => p.onlineConsultation).length,
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
              <h1 className='text-3xl font-bold tracking-tight'>Psychologues</h1>
              <p className='text-muted-foreground mt-2'>
                Gérez les psychologues et cliniques de soutien
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='gap-2'>
                  <Plus className='h-4 w-4' />
                  Ajouter un psychologue
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                  <DialogTitle>Ajouter un psychologue</DialogTitle>
                  <DialogDescription>
                    Enregistrez un nouveau psychologue dans l'annuaire
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Nom complet</Label>
                    <Input id='name' placeholder='Dr. Nom Prénom' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='license'>Numéro de licence</Label>
                    <Input id='license' placeholder="Numéro d'agrément" />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='specialization'>Spécialisations</Label>
                    <Input id='specialization' placeholder='Psycho-oncologie, Thérapie cognitive...' />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='wilaya'>Wilaya</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder='Sélectionner' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='alger'>Alger</SelectItem>
                          <SelectItem value='oran'>Oran</SelectItem>
                          <SelectItem value='constantine'>Constantine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='fee'>Tarif consultation (DA)</Label>
                      <Input id='fee' type='number' placeholder='3000' />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='phone'>Téléphone</Label>
                      <Input id='phone' placeholder='+213 XXX XXX XXX' />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='email'>Email</Label>
                      <Input id='email' type='email' placeholder='email@example.com' />
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='bio'>Biographie</Label>
                    <Textarea id='bio' placeholder='Présentation du psychologue...' rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={() => {
                    toast.success('Psychologue ajouté')
                    setIsDialogOpen(false)
                  }}>
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total</CardTitle>
                <Brain className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.total}</div>
                <p className='text-xs text-muted-foreground'>Psychologues</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Vérifiés</CardTitle>
                <Check className='h-4 w-4 text-green-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.verified}</div>
                <p className='text-xs text-muted-foreground'>Actifs</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>En attente</CardTitle>
                <Brain className='h-4 w-4 text-yellow-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.pending}</div>
                <p className='text-xs text-muted-foreground'>À vérifier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Consultation en ligne</CardTitle>
                <Brain className='h-4 w-4 text-primary' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.online}</div>
                <p className='text-xs text-muted-foreground'>Disponibles</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des psychologues</CardTitle>
              <CardDescription>
                Gérez les psychologues et thérapeutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Rechercher par nom, wilaya ou spécialisation...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Spécialisations</TableHead>
                      <TableHead>Wilaya</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPsychologists.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                          Aucun psychologue trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPsychologists.map((psy) => (
                        <TableRow key={psy.id}>
                          <TableCell className='font-medium'>{psy.name}</TableCell>
                          <TableCell>
                            <div className='flex flex-wrap gap-1'>
                              {psy.specialization.map((spec, idx) => (
                                <Badge key={idx} variant='outline' className='text-xs'>
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{psy.wilaya}</TableCell>
                          <TableCell>{psy.phone}</TableCell>
                          <TableCell>
                            {psy.status === 'verified' && (
                              <Badge className='bg-green-500 hover:bg-green-600'>Vérifié</Badge>
                            )}
                            {psy.status === 'pending' && (
                              <Badge className='bg-yellow-500 hover:bg-yellow-600'>En attente</Badge>
                            )}
                            {psy.status === 'rejected' && (
                              <Badge className='bg-red-500 hover:bg-red-600'>Rejeté</Badge>
                            )}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              {psy.status === 'pending' && (
                                <>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50'
                                    onClick={() => handleVerify(psy.id)}
                                  >
                                    <Check className='h-3 w-3' />
                                    Vérifier
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50'
                                    onClick={() => handleReject(psy.id)}
                                  >
                                    <X className='h-3 w-3' />
                                    Rejeter
                                  </Button>
                                </>
                              )}
                              <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                                onClick={() => handleDelete(psy.id)}
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
    </>
  )
}
