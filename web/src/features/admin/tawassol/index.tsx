import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Phone, Search, Plus, Edit, Trash2, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface DirectoryEntry {
  id: string
  name: string
  category: string
  wilaya: string
  phone: string
  status: 'active' | 'pending'
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

export function TawassolManagement() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDirectoryEntries()
  }, [])

  const fetchDirectoryEntries = async () => {
    try {
      // TODO: Replace with actual Supabase API calls
      // Fetch from multiple tables: cancer_centers, pharmacies, laboratories, associations
      // const { data: centers } = await supabase.from('cancer_centers').select('*')
      // const { data: pharmacies } = await supabase.from('pharmacies').select('*')
      // const { data: labs } = await supabase.from('laboratories').select('*')
      // const { data: associations } = await supabase.from('associations').select('*')
      // Combine and format data
      // setEntries([...centers, ...pharmacies, ...labs, ...associations])
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'annuaire')
    }
  }

  const filteredEntries = entries.filter(entry =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.wilaya.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement Supabase delete based on category
      // Determine which table to delete from based on entry category
      setEntries(entries.filter(e => e.id !== id))
      toast.success('Entrée supprimée')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const stats = {
    total: entries.length,
    active: entries.filter(e => e.status === 'active').length,
    pending: entries.filter(e => e.status === 'pending').length,
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
          <h1 className='text-3xl font-bold tracking-tight'>Tawassol - Annuaire</h1>
          <p className='text-muted-foreground mt-2'>
            Gérez l'annuaire des professionnels et structures de santé
          </p>
        </div>
        <Button className='gap-2'>
          <Plus className='h-4 w-4' />
          Nouvelle entrée
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total</CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-muted-foreground'>Entrées dans l'annuaire</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Actives</CardTitle>
            <Phone className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.active}</div>
            <p className='text-xs text-muted-foreground'>Validées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>En attente</CardTitle>
            <Phone className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.pending}</div>
            <p className='text-xs text-muted-foreground'>À valider</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Annuaire</CardTitle>
          <CardDescription>
            Gérez les contacts et structures de santé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Rechercher par nom, catégorie ou wilaya...'
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
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Wilaya</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                      Aucune entrée trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className='font-medium'>{entry.name}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>{entry.category}</Badge>
                      </TableCell>
                      <TableCell>{entry.wilaya}</TableCell>
                      <TableCell>{entry.phone}</TableCell>
                      <TableCell>
                        {entry.status === 'active' ? (
                          <Badge className='bg-green-500 hover:bg-green-600'>Active</Badge>
                        ) : (
                          <Badge className='bg-yellow-500 hover:bg-yellow-600'>En attente</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                            onClick={() => handleDelete(entry.id)}
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
