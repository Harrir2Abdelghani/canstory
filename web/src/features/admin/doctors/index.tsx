import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Stethoscope, Search, Plus, Check, X, Eye, Edit, Trash2, Filter, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { doctorsService, Doctor, UpdateDoctorPayload } from '@/services/doctors.service'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import wilayasData from '@/assets/Wilaya_Of_Algeria.json'
import communesData from '@/assets/Commune_Of_Algeria.json'

interface Wilaya {
  id: string
  code: string
  name: string
  ar_name: string
}

interface Commune {
  id: string
  post_code: string
  name: string
  wilaya_id: string
  ar_name: string
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

type DoctorFormState = {
  name: string
  email: string
  phone: string
  specialty: string
  wilaya: string
  commune: string
  bio: string
  licenseNumber: string
  hospitalAffiliation: string
  consultationFee: string
  yearsOfExperience: string
  languagesSpoken: string
  education: string
  certifications: string
  acceptsNewPatients: boolean
  avatar: File | null
  avatar_url: string
}

const createEmptyFormState = (): DoctorFormState => ({
  name: '',
  email: '',
  phone: '',
  specialty: '',
  wilaya: '',
  commune: '',
  bio: '',
  licenseNumber: '',
  hospitalAffiliation: '',
  consultationFee: '',
  yearsOfExperience: '',
  languagesSpoken: '',
  education: '',
  certifications: '',
  acceptsNewPatients: true,
  avatar: null,
  avatar_url: '',
})

export function DoctorsManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null)
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null)

  // Form state
  const [formData, setFormData] = useState<DoctorFormState>(createEmptyFormState)

  const wilayas = wilayasData as Wilaya[]
  const communes = communesData as Commune[]

  const wilayaNameMap = useMemo(() => {
    return new Map(wilayas.map((wilaya) => [wilaya.id, wilaya.name]))
  }, [wilayas])

  const communeNameMap = useMemo(() => {
    return new Map(communes.map((commune) => [commune.id, commune.name]))
  }, [communes])

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setIsLoading(true)
      const doctorsData = await doctorsService.getDoctors()
      setDoctors(doctorsData)
    } catch (error) {
      console.error('Doctors fetch error:', error)
      toast.error('Erreur lors du chargement des médecins')
    } finally {
      setIsLoading(false)
    }
  }

  const getCommunesByWilaya = (wilayaId: string) => {
    return communes.filter(c => c.wilaya_id === wilayaId)
  }

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'wilaya' ? { commune: '' } : {}),
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file,
        avatar_url: URL.createObjectURL(file)
      }))
    }
  }

  const populateFormFromDoctor = (doctor: Doctor) => {
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone || '',
      specialty: doctor.specialization,
      wilaya: doctor.wilaya || '',
      commune: doctor.commune || '',
      bio: doctor.bio || '',
      licenseNumber: doctor.licenseNumber,
      hospitalAffiliation: doctor.hospitalAffiliation || '',
      consultationFee: doctor.consultationFee ? String(doctor.consultationFee) : '',
      yearsOfExperience: doctor.yearsOfExperience ? String(doctor.yearsOfExperience) : '',
      languagesSpoken: doctor.languagesSpoken?.join(', ') || '',
      education: Array.isArray(doctor.education) ? doctor.education.join('\n') : '',
      certifications: Array.isArray(doctor.certifications) ? doctor.certifications.join('\n') : '',
      acceptsNewPatients: doctor.acceptsNewPatients ?? true,
      avatar: null,
      avatar_url: doctor.avatarUrl || '',
    })
  }

  const toArrayFromString = (value: string) =>
    value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

  const buildDoctorPayload = async () => {
    const missingFields = []
    if (!formData.name) missingFields.push('Nom complet')
    if (!formData.email) missingFields.push('Email')
    if (!formData.specialty) missingFields.push('Spécialité')
    if (!formData.licenseNumber) missingFields.push('Numéro de licence')
    if (!formData.wilaya) missingFields.push('Wilaya')
    if (!formData.commune) missingFields.push('Commune')
    if (!formData.phone) missingFields.push('Téléphone')
    if (dialogMode === 'create' && !formData.avatar) missingFields.push('Photo de profil')

    if (missingFields.length > 0) {
      toast.error(`Veuillez compléter les champs obligatoires : ${missingFields.join(', ')}`)
      return null
    }

    let avatarPayload: { data: string; name: string; type: string } | undefined
    if (formData.avatar) {
      const file = formData.avatar
      const fileToBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

      const base64 = await fileToBase64(file)
      avatarPayload = {
        data: base64,
        name: file.name,
        type: file.type,
      }
    }

    return {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || undefined,
      wilaya: formData.wilaya,
      commune: formData.commune,
      bio: formData.bio.trim() || undefined,
      specialization: formData.specialty,
      licenseNumber: formData.licenseNumber.trim(),
      hospitalAffiliation: formData.hospitalAffiliation.trim() || undefined,
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : undefined,
      yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
      languagesSpoken: formData.languagesSpoken ? toArrayFromString(formData.languagesSpoken) : undefined,
      education: formData.education ? toArrayFromString(formData.education) : undefined,
      certifications: formData.certifications ? toArrayFromString(formData.certifications) : undefined,
      acceptsNewPatients: formData.acceptsNewPatients,
      avatar: avatarPayload,
    }
  }

  const handleAddDoctor = async () => {
    setDialogMode('create')
    try {
      setIsSubmitting(true)
      const payload = await buildDoctorPayload()
      if (!payload) return

      const { doctor, tempPassword } = await doctorsService.createDoctor(payload)

      setDoctors((prev) => [doctor, ...prev])
      toast.success(
        tempPassword
          ? `Médecin ajouté avec succès. Mot de passe temporaire : ${tempPassword}`
          : 'Médecin ajouté avec succès'
      )
      setIsDialogOpen(false)
      resetForm()
      await fetchDoctors()
    } catch (error) {
      console.error('Create doctor error:', error)
      const message = error instanceof Error ? error.message : null
      toast.error(message || 'Erreur lors de l\'ajout du médecin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(createEmptyFormState())
    setSelectedDoctor(null)
  }

  const handleOpenCreateDialog = () => {
    setDialogMode('create')
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (doctor: Doctor) => {
    setDialogMode('edit')
    setSelectedDoctor(doctor)
    populateFormFromDoctor(doctor)
    setIsDialogOpen(true)
  }

  const handleOpenViewDialog = (doctor: Doctor) => {
    setViewDoctor(doctor)
    setIsViewDialogOpen(true)
  }

  const handleOpenDeleteDialog = (doctor: Doctor) => {
    setDeleteDoctor(doctor)
    setIsDeleteDialogOpen(true)
  }

  const resolveWilayaName = (wilayaId?: string | null) => {
    if (!wilayaId) return 'Wilaya inconnue'
    return wilayaNameMap.get(wilayaId) || wilayaId
  }

  const resolveCommuneName = (communeId?: string | null) => {
    if (!communeId) return 'Commune inconnue'
    return communeNameMap.get(communeId) || communeId
  }

  const buildUpdatePayload = async (): Promise<UpdateDoctorPayload | null> => {
    const payload: UpdateDoctorPayload = {}

    if (formData.name.trim() !== selectedDoctor?.name) payload.name = formData.name.trim()
    if (formData.email.trim() !== selectedDoctor?.email) payload.email = formData.email.trim()
    if ((formData.phone || '') !== (selectedDoctor?.phone || '')) payload.phone = formData.phone.trim() || null
    if (formData.specialty !== selectedDoctor?.specialization) payload.specialization = formData.specialty
    if ((formData.wilaya || '') !== (selectedDoctor?.wilaya || '')) payload.wilaya = formData.wilaya
    if ((formData.commune || '') !== (selectedDoctor?.commune || '')) payload.commune = formData.commune
    if ((formData.bio || '') !== (selectedDoctor?.bio || '')) payload.bio = formData.bio.trim() || null
    if (formData.licenseNumber.trim() !== selectedDoctor?.licenseNumber) payload.licenseNumber = formData.licenseNumber.trim()
    if ((formData.hospitalAffiliation || '') !== (selectedDoctor?.hospitalAffiliation || '')) {
      payload.hospitalAffiliation = formData.hospitalAffiliation.trim() || null
    }
    const currentFee = selectedDoctor?.consultationFee ?? null
    const newFee = formData.consultationFee ? Number(formData.consultationFee) : null
    if (Number.isFinite(newFee) ? newFee !== currentFee : currentFee !== null) {
      payload.consultationFee = formData.consultationFee === '' ? null : Number(formData.consultationFee)
    }

    const currentYears = selectedDoctor?.yearsOfExperience ?? null
    const newYears = formData.yearsOfExperience ? Number(formData.yearsOfExperience) : null
    if (Number.isFinite(newYears) ? newYears !== currentYears : currentYears !== null) {
      payload.yearsOfExperience = formData.yearsOfExperience === '' ? null : Number(formData.yearsOfExperience)
    }

    const newLanguages = formData.languagesSpoken ? toArrayFromString(formData.languagesSpoken) : []
    if (JSON.stringify(newLanguages) !== JSON.stringify(selectedDoctor?.languagesSpoken || [])) {
      payload.languagesSpoken = newLanguages
    }

    const newEducation = formData.education ? toArrayFromString(formData.education) : []
    if (JSON.stringify(newEducation) !== JSON.stringify(selectedDoctor?.education || [])) {
      payload.education = newEducation
    }

    const newCertifications = formData.certifications ? toArrayFromString(formData.certifications) : []
    if (JSON.stringify(newCertifications) !== JSON.stringify(selectedDoctor?.certifications || [])) {
      payload.certifications = newCertifications
    }

    if ((formData.acceptsNewPatients ?? true) !== (selectedDoctor?.acceptsNewPatients ?? true)) {
      payload.acceptsNewPatients = formData.acceptsNewPatients
    }

    if (formData.avatar) {
      const file = formData.avatar
      const fileToBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

      payload.avatar = {
        data: await fileToBase64(file),
        name: file.name,
        type: file.type,
      }
    }

    if (Object.keys(payload).length === 0) {
      toast.info('Aucune modification détectée')
      return null
    }

    return payload
  }

  const handleUpdateDoctor = async () => {
    if (!selectedDoctor) return

    try {
      setIsSubmitting(true)
      const payload = await buildUpdatePayload()
      if (!payload) return

      const updatedDoctor = await doctorsService.updateDoctor(selectedDoctor.id, payload)
      setDoctors((prev) => prev.map((doctor) => (doctor.id === selectedDoctor.id ? updatedDoctor : doctor)))
      toast.success('Médecin mis à jour avec succès')
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Update doctor error:', error)
      const message = error instanceof Error ? error.message : null
      toast.error(message || 'Erreur lors de la mise à jour du médecin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return doctors.filter((doctor) => {
      const matchesSearch = normalizedSearch
        ? [doctor.name, doctor.specialization, doctor.wilaya, doctor.commune]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedSearch))
        : true

      const matchesStatus = filterStatus === 'all' || doctor.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [doctors, searchTerm, filterStatus])

  const handleStatusChange = async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    try {
      const updatedDoctor = await doctorsService.updateDoctorStatus(id, status)
      setDoctors((prev) => prev.map((doctor) => (doctor.id === id ? updatedDoctor : doctor)))
      toast.success(
        status === 'approved'
          ? 'Médecin approuvé avec succès'
          : status === 'rejected'
            ? 'Médecin rejeté'
            : 'Statut mis à jour'
      )
    } catch (error) {
      console.error('Doctor status update error:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await doctorsService.deleteDoctor(id)
      setDoctors((prev) => prev.filter((doctor) => doctor.id !== id))
      toast.success('Médecin supprimé')
    } catch (error) {
      console.error('Doctor delete error:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: Doctor['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className='bg-green-500 hover:bg-green-600'>Approuvé</Badge>
      case 'pending':
        return <Badge className='bg-yellow-500 hover:bg-yellow-600'>En attente</Badge>
      case 'rejected':
        return <Badge className='bg-red-500 hover:bg-red-600'>Rejeté</Badge>
    }
  }

  const stats = useMemo(() => ({
    total: doctors.length,
    approved: doctors.filter((d) => d.status === 'approved').length,
    pending: doctors.filter((d) => d.status === 'pending').length,
    rejected: doctors.filter((d) => d.status === 'rejected').length,
  }), [doctors])

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
          <h1 className='text-3xl font-bold tracking-tight'>Gestion des Médecins</h1>
          <p className='text-muted-foreground mt-2'>
            Gérez les comptes des médecins et professionnels de santé
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2' onClick={handleOpenCreateDialog}>
              <Plus className='h-4 w-4' />
              Ajouter un médecin
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'create' ? 'Ajouter un nouveau médecin' : 'Modifier le médecin'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'create'
                  ? 'Remplissez les informations complètes du médecin'
                  : 'Mettez à jour les informations du médecin'}
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              {/* Avatar Upload */}
              <div className='grid gap-2'>
                <Label>Photo de profil</Label>
                <div className='flex items-center gap-4'>
                  {formData.avatar_url && (
                    <img src={formData.avatar_url} alt='Avatar' className='w-16 h-16 rounded-full object-cover' />
                  )}
                  <div className='flex-1'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleAvatarChange}
                      className='hidden'
                      id='avatar-input'
                    />
                    <label htmlFor='avatar-input'>
                      <Button type='button' variant='outline' className='gap-2' asChild>
                        <span>
                          <Upload className='h-4 w-4' />
                          Télécharger une photo
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className='grid gap-2'>
                <Label htmlFor='name'>Nom complet *</Label>
                <Input
                  id='name'
                  placeholder='Dr. Nom Prénom'
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                />
              </div>

              {/* Email */}
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email *</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='email@example.com'
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className='grid gap-2'>
                <Label htmlFor='phone'>Téléphone *</Label>
                <Input
                  id='phone'
                  placeholder='+213 555 123 456'
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                />
              </div>

              {/* Specialty */}
              <div className='grid gap-2'>
                <Label htmlFor='specialty'>Spécialité *</Label>
                <Select value={formData.specialty} onValueChange={(value) => handleFormChange('specialty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Sélectionner une spécialité' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='oncologie'>Oncologie</SelectItem>
                    <SelectItem value='oncologie-medicale'>Oncologie Médicale</SelectItem>
                    <SelectItem value='radiotherapie'>Radiothérapie</SelectItem>
                    <SelectItem value='chirurgie-oncologique'>Chirurgie Oncologique</SelectItem>
                    <SelectItem value='hematologie'>Hématologie</SelectItem>
                    <SelectItem value='psycho-oncologie'>Psycho-oncologie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Wilaya */}
              <div className='grid gap-2'>
                <Label htmlFor='wilaya'>Wilaya *</Label>
                <Select value={formData.wilaya} onValueChange={(value) => handleFormChange('wilaya', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Sélectionner une wilaya' />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayas.map((wilaya) => (
                      <SelectItem key={wilaya.id} value={wilaya.id}>
                        {wilaya.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Commune */}
              <div className='grid gap-2'>
                <Label htmlFor='commune'>Commune *</Label>
                <Select value={formData.commune} onValueChange={(value) => handleFormChange('commune', value)} disabled={!formData.wilaya}>
                  <SelectTrigger>
                    <SelectValue placeholder={formData.wilaya ? 'Sélectionner une commune' : 'Sélectionnez d\'abord une wilaya'} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.wilaya && getCommunesByWilaya(formData.wilaya).map((commune) => (
                      <SelectItem key={commune.id} value={commune.id}>
                        {commune.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bio */}
              <div className='grid gap-2'>
                <Label htmlFor='bio'>Biographie</Label>
                <Textarea
                  id='bio'
                  placeholder='Informations supplémentaires sur le médecin...'
                  value={formData.bio}
                  onChange={(e) => handleFormChange('bio', e.target.value)}
                  rows={3}
                />
              </div>

              {/* License Number */}
              <div className='grid gap-2'>
                <Label htmlFor='licenseNumber'>Numéro de licence *</Label>
                <Input
                  id='licenseNumber'
                  placeholder='Ex: MED-12345'
                  value={formData.licenseNumber}
                  onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
                />
              </div>

              {/* Hospital Affiliation */}
              <div className='grid gap-2'>
                <Label htmlFor='hospitalAffiliation'>Établissement d'affectation</Label>
                <Input
                  id='hospitalAffiliation'
                  placeholder="Nom de l'hôpital ou de la clinique"
                  value={formData.hospitalAffiliation}
                  onChange={(e) => handleFormChange('hospitalAffiliation', e.target.value)}
                />
              </div>

              {/* Consultation Fee */}
              <div className='grid gap-2'>
                <Label htmlFor='consultationFee'>Frais de consultation (DZD)</Label>
                <Input
                  id='consultationFee'
                  type='number'
                  min='0'
                  step='100'
                  placeholder='Ex: 5000'
                  value={formData.consultationFee}
                  onChange={(e) => handleFormChange('consultationFee', e.target.value)}
                />
              </div>

              {/* Years of Experience */}
              <div className='grid gap-2'>
                <Label htmlFor='yearsOfExperience'>Années d'expérience</Label>
                <Input
                  id='yearsOfExperience'
                  type='number'
                  min='0'
                  placeholder='Ex: 12'
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleFormChange('yearsOfExperience', e.target.value)}
                />
              </div>

              {/* Languages */}
              <div className='grid gap-2'>
                <Label htmlFor='languagesSpoken'>Langues parlées (séparées par virgule ou nouvelle ligne)</Label>
                <Textarea
                  id='languagesSpoken'
                  placeholder='Français, Arabe, Anglais'
                  value={formData.languagesSpoken}
                  onChange={(e) => handleFormChange('languagesSpoken', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Education */}
              <div className='grid gap-2'>
                <Label htmlFor='education'>Formation (une entrée par ligne)</Label>
                <Textarea
                  id='education'
                  placeholder={"Diplôme de médecine - Université d'Alger\nMaster en oncologie - Université de Paris"}
                  value={formData.education}
                  onChange={(e) => handleFormChange('education', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Certifications */}
              <div className='grid gap-2'>
                <Label htmlFor='certifications'>Certifications (une entrée par ligne)</Label>
                <Textarea
                  id='certifications'
                  placeholder={"Membre de l'Association Algérienne d'Oncologie\nCertification Radiothérapie Avancée"}
                  value={formData.certifications}
                  onChange={(e) => handleFormChange('certifications', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Accepts New Patients */}
              <div className='flex items-center justify-between rounded-lg border px-4 py-3'>
                <div>
                  <Label>Accepte de nouveaux patients</Label>
                  <p className='text-sm text-muted-foreground'>Le médecin est disponible pour de nouvelles consultations.</p>
                </div>
                <Switch
                  checked={formData.acceptsNewPatients}
                  onCheckedChange={(value) => handleFormChange('acceptsNewPatients', value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button
                onClick={dialogMode === 'create' ? handleAddDoctor : handleUpdateDoctor}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? dialogMode === 'create'
                    ? 'Ajout en cours...'
                    : 'Mise à jour...'
                  : dialogMode === 'create'
                    ? 'Ajouter'
                    : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total</CardTitle>
            <Stethoscope className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-muted-foreground'>Médecins enregistrés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Approuvés</CardTitle>
            <Check className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.approved}</div>
            <p className='text-xs text-muted-foreground'>Comptes actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>En attente</CardTitle>
            <Filter className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.pending}</div>
            <p className='text-xs text-muted-foreground'>À valider</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Rejetés</CardTitle>
            <X className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.rejected}</div>
            <p className='text-xs text-muted-foreground'>Comptes refusés</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des médecins</CardTitle>
          <CardDescription>
            Gérez et validez les comptes des professionnels de santé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Rechercher par nom, spécialité ou wilaya...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filtrer par statut' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tous</SelectItem>
                <SelectItem value='approved'>Approuvés</SelectItem>
                <SelectItem value='pending'>En attente</SelectItem>
                <SelectItem value='rejected'>Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className='py-12 text-center text-muted-foreground'>
                      Chargement des médecins...
                    </TableCell>
                  </TableRow>
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-center py-8 text-muted-foreground'>
                      Aucun médecin trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => {
                    const wilayaDisplay = resolveWilayaName(doctor.wilaya)
                    const communeDisplay = resolveCommuneName(doctor.commune)
                    return (
                    <TableRow key={doctor.id}>
                      <TableCell className='font-medium'>
                        <div className='flex items-center gap-2'>
                          {doctor.avatarUrl && (
                            <img src={doctor.avatarUrl} alt={doctor.name} className='w-8 h-8 rounded-full object-cover' />
                          )}
                          <div>
                            <div>{doctor.name}</div>
                            {doctor.bio && doctor.bio.length > 0 && (
                              <div className='text-xs text-muted-foreground'>
                                {doctor.bio.length > 42 ? `${doctor.bio.slice(0, 42)}…` : doctor.bio}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <div>{wilayaDisplay}</div>
                          <div className='text-muted-foreground text-xs'>{communeDisplay}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                      <TableCell>{doctor.registrationDate ? new Date(doctor.registrationDate).toLocaleDateString('fr-FR') : '-'}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          {doctor.status === 'pending' && (
                            <>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50'
                                onClick={() => handleStatusChange(doctor.id, 'approved')}
                              >
                                <Check className='h-3 w-3' />
                                Approuver
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50'
                                onClick={() => handleStatusChange(doctor.id, 'rejected')}
                              >
                                <X className='h-3 w-3' />
                                Rejeter
                              </Button>
                            </>
                          )}
                          {doctor.status === 'approved' && (
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-8 gap-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                              onClick={() => handleStatusChange(doctor.id, 'pending')}
                            >
                              <Filter className='h-3 w-3' />
                              Mettre en attente
                            </Button>
                          )}
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0'
                            onClick={() => handleOpenViewDialog(doctor)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0'
                            onClick={() => handleOpenEditDialog(doctor)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                            onClick={() => handleOpenDeleteDialog(doctor)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </div>
      </Main>

      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
      if (!open) setViewDoctor(null)
      setIsViewDialogOpen(open)
    }}>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Profil du médecin</DialogTitle>
          <DialogDescription>Consultez les informations complètes du médecin sélectionné.</DialogDescription>
        </DialogHeader>
        {viewDoctor && (
          <div className='grid gap-6 py-4'>
            {(() => {
              const wilayaDisplay = resolveWilayaName(viewDoctor.wilaya)
              const communeDisplay = resolveCommuneName(viewDoctor.commune)
              return (
                <>
            <div className='flex items-center gap-4'>
              {viewDoctor.avatarUrl ? (
                <img
                  src={viewDoctor.avatarUrl}
                  alt={viewDoctor.name}
                  className='h-20 w-20 rounded-full object-cover'
                />
              ) : (
                <div className='h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold'>
                  {viewDoctor.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className='text-xl font-semibold'>{viewDoctor.name}</h2>
                <p className='text-muted-foreground'>{viewDoctor.email}</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  <Badge variant='outline'>{viewDoctor.specialization}</Badge>
                  <Badge variant='outline'>Licence {viewDoctor.licenseNumber}</Badge>
                  <Badge variant={viewDoctor.acceptsNewPatients ? 'default' : 'secondary'}>
                    {viewDoctor.acceptsNewPatients ? 'Accepte des patients' : 'Complet'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Contact</h3>
                <p className='mt-1 text-sm'>
                  <span className='block'>{viewDoctor.phone || 'Non renseigné'}</span>
                  <span className='block'>{viewDoctor.email}</span>
                </p>
              </div>
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Localisation</h3>
                <p className='mt-1 text-sm'>
                  <span className='block'>{wilayaDisplay}</span>
                  <span className='block text-muted-foreground text-xs'>{communeDisplay}</span>
                </p>
              </div>
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Expérience</h3>
                <p className='mt-1 text-sm'>
                  {typeof viewDoctor.yearsOfExperience === 'number'
                    ? `${viewDoctor.yearsOfExperience} an${viewDoctor.yearsOfExperience > 1 ? 's' : ''}`
                    : 'Non renseigné'}
                </p>
              </div>
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Tarif consultation</h3>
                <p className='mt-1 text-sm'>
                  {typeof viewDoctor.consultationFee === 'number'
                    ? `${viewDoctor.consultationFee.toLocaleString('fr-DZ')} DZD`
                    : 'Non renseigné'}
                </p>
              </div>
            </div>

            {viewDoctor.bio && (
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Biographie</h3>
                <p className='mt-2 text-sm leading-relaxed whitespace-pre-line'>{viewDoctor.bio}</p>
              </div>
            )}

            {viewDoctor.hospitalAffiliation && (
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Établissement d'affectation</h3>
                <p className='mt-2 text-sm'>{viewDoctor.hospitalAffiliation}</p>
              </div>
            )}

            {viewDoctor.languagesSpoken && viewDoctor.languagesSpoken.length > 0 && (
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Langues parlées</h3>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {viewDoctor.languagesSpoken.map((lang) => (
                    <Badge key={lang} variant='secondary'>
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {viewDoctor.education && viewDoctor.education.length > 0 && (
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Formation</h3>
                <ul className='mt-2 space-y-1 text-sm list-disc pl-4'>
                  {viewDoctor.education.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {viewDoctor.certifications && viewDoctor.certifications.length > 0 && (
              <div>
                <h3 className='font-medium text-sm text-muted-foreground'>Certifications</h3>
                <ul className='mt-2 space-y-1 text-sm list-disc pl-4'>
                  {viewDoctor.certifications.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
                </>
              )
            })()}
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setIsViewDialogOpen(false)}>
            Fermer
          </Button>
          {viewDoctor && (
            <Button variant='default' onClick={() => {
              setIsViewDialogOpen(false)
              handleOpenEditDialog(viewDoctor)
            }}>
              Modifier ce médecin
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
      if (!open) setDeleteDoctor(null)
      setIsDeleteDialogOpen(open)
    }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Supprimer le médecin</DialogTitle>
          <DialogDescription>
            Cette action est définitive. Le compte du médecin ainsi que son accès à la plateforme seront supprimés.
          </DialogDescription>
        </DialogHeader>
        {deleteDoctor && (
          <div className='py-4 text-sm'>
            <p>
              Êtes-vous certain de vouloir supprimer <span className='font-semibold'>{deleteDoctor.name}</span> ?
            </p>
            <p className='mt-2 text-muted-foreground'>
              Cette opération supprimera également son profil utilisateur Supabase.
            </p>
          </div>
        )}
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
            Annuler
          </Button>
          <Button
            variant='destructive'
            disabled={isDeleting}
            onClick={async () => {
              if (!deleteDoctor) return
              try {
                setIsDeleting(true)
                await handleDelete(deleteDoctor.id)
                setIsDeleteDialogOpen(false)
              } finally {
                setIsDeleting(false)
              }
            }}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  )
}
