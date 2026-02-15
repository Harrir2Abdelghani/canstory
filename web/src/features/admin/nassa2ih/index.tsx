import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Search, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface Guide {
  id: string
  title: string
  category: string
  steps: number
  lastUpdated: string
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

export function Nassa2ihManagement() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    try {
      // TODO: Replace with actual Supabase API call
      // const { data } = await supabase.from('guides').select('*, guide_categories(name_fr)').order('updated_at', { ascending: false })
      // setGuides(data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des guides')
    }
  }

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement Supabase delete
      // await supabase.from('guides').delete().eq('id', id)
      setGuides(guides.filter(g => g.id !== id))
      toast.success('Guide supprimé')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
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
          <h1 className='text-3xl font-bold tracking-tight'>Nassa2ih - Guides</h1>
          <p className='text-muted-foreground mt-2'>
            Gérez les guides administratifs et juridiques
          </p>
        </div>
        <Button className='gap-2'>
          <Plus className='h-4 w-4' />
          Nouveau guide
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{guides.length}</div>
            <p className='text-xs text-muted-foreground'>Guides disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Catégories</CardTitle>
            <FileText className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Types de guides</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Étapes totales</CardTitle>
            <FileText className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{guides.reduce((sum, g) => sum + g.steps, 0)}</div>
            <p className='text-xs text-muted-foreground'>Procédures documentées</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guides administratifs</CardTitle>
          <CardDescription>
            Gérez les guides et procédures pour les patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Rechercher par titre ou catégorie...'
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
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Nombre d'étapes</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-8 text-muted-foreground'>
                      Aucun guide trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuides.map((guide) => (
                    <TableRow key={guide.id}>
                      <TableCell className='font-medium'>{guide.title}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>{guide.category}</Badge>
                      </TableCell>
                      <TableCell>{guide.steps} étapes</TableCell>
                      <TableCell>{new Date(guide.lastUpdated).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                            onClick={() => handleDelete(guide.id)}
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
