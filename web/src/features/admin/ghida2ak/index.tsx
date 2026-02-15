import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Utensils, Search, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface NutritionContent {
  id: string
  cancerType: string
  title: string
  category: string
  lastUpdated: string
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

export function Ghida2akManagement() {
  const [content, setContent] = useState<NutritionContent[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchNutritionContent()
  }, [])

  const fetchNutritionContent = async () => {
    try {
      // TODO: Replace with actual Supabase API call
      // const { data } = await supabase.from('nutrition_guides').select('*').order('updated_at', { ascending: false })
      // setContent(data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement du contenu')
    }
  }

  const filteredContent = content.filter(item =>
    item.cancerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement Supabase delete
      // await supabase.from('nutrition_guides').delete().eq('id', id)
      setContent(content.filter(c => c.id !== id))
      toast.success('Contenu supprimé')
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
          <h1 className='text-3xl font-bold tracking-tight'>Ghida2ak - Nutrition</h1>
          <p className='text-muted-foreground mt-2'>
            Gérez les conseils nutritionnels par type de cancer
          </p>
        </div>
        <Button className='gap-2'>
          <Plus className='h-4 w-4' />
          Nouveau contenu
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total</CardTitle>
            <Utensils className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{content.length}</div>
            <p className='text-xs text-muted-foreground'>Contenus nutritionnels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Types de cancer</CardTitle>
            <Utensils className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Couverts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Recettes</CardTitle>
            <Utensils className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Recettes santé</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenu nutritionnel</CardTitle>
          <CardDescription>
            Gérez les recommandations nutritionnelles par type de cancer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Rechercher par type de cancer ou titre...'
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
                  <TableHead>Type de cancer</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-8 text-muted-foreground'>
                      Aucun contenu trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className='font-medium'>{item.cancerType}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>{item.category}</Badge>
                      </TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                            onClick={() => handleDelete(item.id)}
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
