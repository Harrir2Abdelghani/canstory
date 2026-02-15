import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, ChevronLeft, ChevronRight, Eye, Trash2, Edit } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCreateWilaya } from '@/hooks/use-platform-config'
import wilayasData from '@/assets/Wilaya_Of_Algeria.json'
import communesData from '@/assets/Commune_Of_Algeria.json'

interface WilayaData {
  id: string
  code: string
  name: string
  ar_name: string
  longitude?: string
  latitude?: string
}

interface CommuneData {
  id: string
  post_code: string
  name: string
  ar_name: string
  wilaya_id: string
}

export function WilayasTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedWilaya, setSelectedWilaya] = useState<WilayaData | null>(null)
  const [, setEditingWilaya] = useState<WilayaData | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    ar_name: '',
  })

  const wilayas = useMemo(() => wilayasData as WilayaData[], [])
  const communes = useMemo(() => communesData as CommuneData[], [])
  const createWilaya = useCreateWilaya()

  const ITEMS_PER_PAGE = 15
  const totalPages = Math.ceil(wilayas.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedWilayas = wilayas.slice(startIdx, endIdx)

  const getCommunesByWilaya = (wilayaId: string) => {
    return communes.filter(c => c.wilaya_id === wilayaId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createWilaya.mutateAsync({
        code: formData.code,
        name: formData.name,
        ar_name: formData.ar_name,
      })
      setFormData({ code: '', name: '', ar_name: '' })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error creating wilaya:', error)
    }
  }

  const handleViewDetails = (wilaya: WilayaData) => {
    setSelectedWilaya(wilaya)
    setIsDetailsOpen(true)
  }

  const handleEdit = (wilaya: WilayaData) => {
    setEditingWilaya(wilaya)
    setFormData({
      code: wilaya.code,
      name: wilaya.name,
      ar_name: wilaya.ar_name,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (wilayaId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette wilaya ?')) {
      console.log('Delete wilaya:', wilayaId)
    }
  }


  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                Gestion des Wilayas
              </CardTitle>
              <CardDescription>
                Gérez les wilayas utilisées globalement dans la plateforme (profils, annuaire, logements)
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='gap-2'>
                  <Plus className='h-4 w-4' />
                  Ajouter une wilaya
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une wilaya</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour créer une nouvelle wilaya
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='code'>Code</Label>
                    <Input
                      id='code'
                      placeholder='01'
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Nom (Français)</Label>
                    <Input
                      id='name'
                      placeholder='Adrar'
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='ar_name'>Nom (Arabe)</Label>
                    <Input
                      id='ar_name'
                      placeholder='أدرار'
                      value={formData.ar_name}
                      onChange={(e) => setFormData({ ...formData, ar_name: e.target.value })}
                      required
                      dir='rtl'
                    />
                  </div>
                  <Button type='submit' className='w-full' disabled={createWilaya.isPending}>
                    {createWilaya.isPending ? 'Création...' : 'Créer'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Français</TableHead>
                  <TableHead>Arabe</TableHead>
                  <TableHead className='text-center'>Communes</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedWilayas && paginatedWilayas.length > 0 ? (
                  paginatedWilayas.map((wilaya) => {
                    const wilayaCommunes = getCommunesByWilaya(wilaya.id)
                    return (
                      <TableRow key={wilaya.id}>
                        <TableCell className='font-medium'>{wilaya.code}</TableCell>
                        <TableCell>{wilaya.name}</TableCell>
                        <TableCell dir='rtl'>{wilaya.ar_name}</TableCell>
                        <TableCell className='text-center'>
                          <Badge variant='outline'>{wilayaCommunes.length}</Badge>
                        </TableCell>
                        <TableCell className='text-right space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleViewDetails(wilaya)}
                            title='Voir les détails'
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleEdit(wilaya)}
                            title='Modifier'
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDelete(wilaya.id)}
                            title='Supprimer'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>
                      Aucune wilaya trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Page {currentPage} sur {totalPages}
              </span>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className='max-w-2xl mt-4'>
          <DialogHeader>
            <DialogTitle>
              {selectedWilaya?.name} ({selectedWilaya?.code})
            </DialogTitle>
            <DialogDescription>
              {selectedWilaya?.ar_name}
            </DialogDescription>
          </DialogHeader>
          {selectedWilaya && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium'>Code</p>
                  <p className='text-lg'>{selectedWilaya.code}</p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Communes</p>
                  <p className='text-lg'>{getCommunesByWilaya(selectedWilaya.id).length}</p>
                </div>
              </div>
              <div>
                <p className='text-sm font-medium mb-2'>Liste des communes</p>
                <div className='border rounded-lg max-h-96 overflow-y-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code Postal</TableHead>
                        <TableHead>Français</TableHead>
                        <TableHead>Arabe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCommunesByWilaya(selectedWilaya.id).map((commune) => (
                        <TableRow key={commune.id}>
                          <TableCell className='text-sm'>{commune.post_code}</TableCell>
                          <TableCell className='text-sm'>{commune.name}</TableCell>
                          <TableCell className='text-sm' dir='rtl'>{commune.ar_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
