import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, Plus, Trash2 } from 'lucide-react'
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
import {
  useCreateSpecialty,
  useDeleteSpecialty,
} from '@/hooks/use-platform-config'

const DEFAULT_SPECIALTIES = [
  { id: '1', name_fr: 'Oncologie', name_ar: 'الأورام', slug: 'oncologie', status: 'active' as const },
  { id: '2', name_fr: 'Cardiologie', name_ar: 'أمراض القلب', slug: 'cardiologie', status: 'active' as const },
  { id: '3', name_fr: 'Pneumologie', name_ar: 'أمراض الجهاز التنفسي', slug: 'pneumologie', status: 'active' as const },
  { id: '4', name_fr: 'Gastro-entérologie', name_ar: 'أمراض الجهاز الهضمي', slug: 'gastro-enterologie', status: 'active' as const },
  { id: '5', name_fr: 'Chirurgie générale', name_ar: 'الجراحة العامة', slug: 'chirurgie-generale', status: 'active' as const },
  { id: '6', name_fr: 'Hématologie', name_ar: 'أمراض الدم', slug: 'hematologie', status: 'active' as const },
  { id: '7', name_fr: 'Gynécologie Oncologique', name_ar: 'أمراض النساء الأورام', slug: 'gynecologie-oncologique', status: 'active' as const },
  { id: '8', name_fr: 'Urologie Oncologique', name_ar: 'أمراض المسالك البولية الأورام', slug: 'urologie-oncologique', status: 'active' as const },
  { id: '9', name_fr: 'Dermatologie', name_ar: 'الأمراض الجلدية', slug: 'dermatologie', status: 'active' as const },
  { id: '10', name_fr: 'ORL', name_ar: 'أنف وأذن وحنجرة', slug: 'orl', status: 'active' as const },
  { id: '11', name_fr: 'Radiologie', name_ar: 'الأشعات', slug: 'radiologie', status: 'active' as const },
  { id: '12', name_fr: 'Anatomie Pathologique', name_ar: 'علم الأنسجة المرضية', slug: 'anatomie-pathologique', status: 'active' as const },
  { id: '13', name_fr: 'Médecine Nucléaire', name_ar: 'الطب النووي', slug: 'medecine-nucleaire', status: 'active' as const },
  { id: '14', name_fr: 'Psycho-oncologie', name_ar: 'علم النفس الأورام', slug: 'psycho-oncologie', status: 'active' as const },
]

export function SpecialtiesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name_fr: '',
    name_ar: '',
    slug: '',
  })

  const specialties = DEFAULT_SPECIALTIES
  const createSpecialty = useCreateSpecialty()
  const deleteSpecialty = useDeleteSpecialty()

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name_fr: value,
      slug: generateSlug(value),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSpecialty.mutateAsync({
        name_fr: formData.name_fr,
        name_ar: formData.name_ar,
        slug: formData.slug,
        status: 'active',
      })
      setFormData({ name_fr: '', name_ar: '', slug: '' })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error creating specialty:', error)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette spécialité ?')) {
      deleteSpecialty.mutate(id)
    }
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Stethoscope className='h-5 w-5' />
                Spécialités Médicales
              </CardTitle>
              <CardDescription>
                Gérez les spécialités utilisées par les médecins, Khibrati, et l'annuaire
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='gap-2'>
                  <Plus className='h-4 w-4' />
                  Ajouter une spécialité
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une spécialité</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour créer une nouvelle spécialité médicale
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name_fr'>Nom (Français)</Label>
                    <Input
                      id='name_fr'
                      placeholder='Oncologie'
                      value={formData.name_fr}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                    <p className='text-xs text-muted-foreground'>Slug: {formData.slug || '-'}</p>
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='name_ar'>Nom (Arabe)</Label>
                    <Input
                      id='name_ar'
                      placeholder='الأورام'
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      required
                      dir='rtl'
                    />
                  </div>
                  <Button type='submit' className='w-full' disabled={createSpecialty.isPending}>
                    {createSpecialty.isPending ? 'Création...' : 'Créer'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Français</TableHead>
                  <TableHead>Arabe</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialties && specialties.length > 0 ? (
                  specialties.map((specialty) => (
                    <TableRow key={specialty.id}>
                      <TableCell className='font-medium'>{specialty.name_fr}</TableCell>
                      <TableCell dir='rtl'>{specialty.name_ar}</TableCell>
                      <TableCell className='text-sm text-muted-foreground'>{specialty.slug}</TableCell>
                      <TableCell>
                        <Badge variant={specialty.status === 'active' ? 'default' : 'secondary'}>
                          {specialty.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDelete(specialty.id)}
                          disabled={deleteSpecialty.isPending}
                          title='Supprimer'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>
                      Aucune spécialité trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
