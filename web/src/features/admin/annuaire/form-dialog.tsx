import { useEffect, useState } from 'react'
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { annuaireService, AnnuaireEntry, AnnuaireRole } from '@/services/annuaire.service'

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

const ANNUAIRE_ROLES: { value: AnnuaireRole; label: string }[] = [
  { value: 'medecin', label: 'Médecins' },
  { value: 'centre_cancer', label: 'Centres cancer' },
  { value: 'psychologue', label: 'Psychologues' },
  { value: 'laboratoire', label: 'Laboratoires' },
  { value: 'pharmacie', label: 'Pharmacies' },
  { value: 'association', label: 'Associations' },
]

type AnnuaireFormState = {
  annuaire_role: AnnuaireRole | ''
  name: string
  email: string
  phone: string
  wilaya: string
  commune: string
  bio: string
  avatar: File | null
  avatar_url: string
  password: string
  specialization: string
  licenseNumber: string
  hospitalAffiliation: string
  consultationFee: string
  yearsOfExperience: string
  languagesSpoken: string
  education: string
  certifications: string
  acceptsNewPatients: boolean
  centerName: string
  registrationNumber: string
  address: string
  emergencyPhone: string
  website: string
  bedCapacity: string
  officeAddress: string
  therapyTypes: string
  labName: string
  workingHours: string
  testTypes: string
  hasHomeService: boolean
  turnaroundTime: string
  pharmacyName: string
  hasDelivery: boolean
  is24Hours: boolean
  associationName: string
  description: string
  focusAreas: string
  servicesOffered: string
}

const createEmptyFormState = (): AnnuaireFormState => ({
  annuaire_role: '',
  name: '',
  email: '',
  phone: '',
  wilaya: '',
  commune: '',
  bio: '',
  avatar: null,
  avatar_url: '',
  password: '',
  specialization: '',
  licenseNumber: '',
  hospitalAffiliation: '',
  consultationFee: '',
  yearsOfExperience: '',
  languagesSpoken: '',
  education: '',
  certifications: '',
  acceptsNewPatients: true,
  centerName: '',
  registrationNumber: '',
  address: '',
  emergencyPhone: '',
  website: '',
  bedCapacity: '',
  officeAddress: '',
  therapyTypes: '',
  labName: '',
  workingHours: '',
  testTypes: '',
  hasHomeService: false,
  turnaroundTime: '',
  pharmacyName: '',
  hasDelivery: false,
  is24Hours: false,
  associationName: '',
  description: '',
  focusAreas: '',
  servicesOffered: '',
})

interface AnnuaireFormDialogProps {
  mode: 'create' | 'edit'
  entry: AnnuaireEntry | null
  onClose: () => void
  onSuccess: () => void
  wilayas: Wilaya[]
  communes: Commune[]
}

export function AnnuaireFormDialog({ mode, entry, onClose, onSuccess, wilayas, communes }: AnnuaireFormDialogProps) {
  const [formData, setFormData] = useState<AnnuaireFormState>(createEmptyFormState)

  useEffect(() => {
    if (!entry) {
      setFormData((prev) => (mode === 'create' ? createEmptyFormState() : prev))
      return
    }

    const metadata = (entry as any).metadata ?? {}
    const entryData = {
      ...metadata,
      ...entry,
    } as any

    setFormData({
      annuaire_role: entry.annuaire_role,
      name: entryData.name || '',
      email: entryData.email || '',
      phone: entryData.phone || '',
      wilaya: entryData.wilaya || '',
      commune: entryData.commune || '',
      bio: entryData.bio || '',
      avatar: null,
      avatar_url: entryData.avatar_url || entryData.avatarUrl || '',
      password: '',
      specialization: entryData.specialization || '',
      licenseNumber: entryData.license_number || entryData.licenseNumber || '',
      hospitalAffiliation: entryData.hospital_affiliation || entryData.hospitalAffiliation || '',
      consultationFee:
        entryData.consultation_fee !== undefined && entryData.consultation_fee !== null
          ? String(entryData.consultation_fee)
          : entryData.consultationFee !== undefined && entryData.consultationFee !== null
            ? String(entryData.consultationFee)
            : '',
      yearsOfExperience:
        entryData.years_of_experience !== undefined && entryData.years_of_experience !== null
          ? String(entryData.years_of_experience)
          : entryData.yearsOfExperience !== undefined && entryData.yearsOfExperience !== null
            ? String(entryData.yearsOfExperience)
            : '',
      languagesSpoken: Array.isArray(entryData.languages_spoken)
        ? entryData.languages_spoken.join(', ')
        : Array.isArray(entryData.languagesSpoken)
          ? entryData.languagesSpoken.join(', ')
          : '',
      education: Array.isArray(entryData.education) ? entryData.education.join('\n') : '',
      certifications: Array.isArray(entryData.certifications) ? entryData.certifications.join('\n') : '',
      acceptsNewPatients:
        entryData.accepts_new_patients !== undefined
          ? Boolean(entryData.accepts_new_patients)
          : entryData.acceptsNewPatients !== undefined
            ? Boolean(entryData.acceptsNewPatients)
            : true,
      centerName: entryData.center_name || entryData.centerName || '',
      registrationNumber: entryData.registration_number || entryData.registrationNumber || entryData.license_number || '',
      address: entryData.address || '',
      emergencyPhone: entryData.emergency_phone || entryData.emergencyPhone || '',
      website: entryData.website || '',
      bedCapacity:
        entryData.bed_capacity !== undefined && entryData.bed_capacity !== null
          ? String(entryData.bed_capacity)
          : entryData.bedCapacity !== undefined && entryData.bedCapacity !== null
            ? String(entryData.bedCapacity)
            : '',
      officeAddress: entryData.office_address || entryData.officeAddress || '',
      therapyTypes: Array.isArray(entryData.therapy_types)
        ? entryData.therapy_types.join(', ')
        : Array.isArray(entryData.therapyTypes)
          ? entryData.therapyTypes.join(', ')
          : '',
      labName: entryData.lab_name || entryData.labName || '',
      workingHours:
        typeof entryData.working_hours === 'object' && entryData.working_hours !== null
          ? JSON.stringify(entryData.working_hours, null, 2)
          : typeof entryData.workingHours === 'object' && entryData.workingHours !== null
            ? JSON.stringify(entryData.workingHours, null, 2)
            : typeof entryData.working_hours === 'string'
              ? entryData.working_hours
              : typeof entryData.workingHours === 'string'
                ? entryData.workingHours
                : '',
      testTypes: Array.isArray(entryData.test_types)
        ? entryData.test_types.join(', ')
        : Array.isArray(entryData.testTypes)
          ? entryData.testTypes.join(', ')
          : '',
      hasHomeService: Boolean(entryData.has_home_service || entryData.hasHomeService || false),
      turnaroundTime:
        entryData.average_turnaround_time !== undefined && entryData.average_turnaround_time !== null
          ? String(entryData.average_turnaround_time)
          : entryData.turnaroundTime !== undefined && entryData.turnaroundTime !== null
            ? String(entryData.turnaroundTime)
            : '',
      pharmacyName: entryData.pharmacy_name || entryData.pharmacyName || '',
      hasDelivery: Boolean(entryData.has_delivery || entryData.hasDelivery || false),
      is24Hours: Boolean(entryData.is_24_hours || entryData.is24Hours || false),
      associationName: entryData.association_name || entryData.associationName || '',
      description: entryData.description || '',
      focusAreas: Array.isArray(entryData.focus_areas)
        ? entryData.focus_areas.join(', ')
        : Array.isArray(entryData.focusAreas)
          ? entryData.focusAreas.join(', ')
          : '',
      servicesOffered: Array.isArray(entryData.services_offered)
        ? entryData.services_offered.join(', ')
        : Array.isArray(entryData.servicesOffered)
          ? entryData.servicesOffered.join(', ')
          : '',
    })
  }, [entry, mode])
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Max dimensions
          const maxWidth = 400
          const maxHeight = 400
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Compress to JPEG with quality 0.7
          const compressed = canvas.toDataURL('image/jpeg', 0.7)
          resolve(compressed)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Check file size before compression
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image trop grande (max 5MB)')
          return
        }
        
        const compressedBase64 = await compressImage(file)
        setFormData(prev => ({
          ...prev,
          avatar: file,
          avatar_url: compressedBase64
        }))
      } catch (error) {
        console.error('Image compression error:', error)
        toast.error('Erreur lors de la compression de l\'image')
      }
    }
  }

  const toArrayFromString = (value: string) =>
    value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

  const buildPayload = async () => {
    const missingFields = []
    if (!formData.annuaire_role) missingFields.push('Rôle annuaire')
    if (!formData.name) missingFields.push('Nom complet')
    if (!formData.email) missingFields.push('Email')
    if (!formData.wilaya) missingFields.push('Wilaya')
    if (!formData.commune) missingFields.push('Commune')
    if (!formData.phone) missingFields.push('Téléphone')
    if (mode === 'create' && !formData.password) missingFields.push('Mot de passe')
    if (formData.password && formData.password.length < 6) missingFields.push('Mot de passe (minimum 6 caractères)')

    if (formData.annuaire_role === 'medecin') {
      if (!formData.specialization) missingFields.push('Spécialité')
      if (!formData.licenseNumber) missingFields.push('Numéro de licence')
    } else if (formData.annuaire_role === 'centre_cancer') {
      if (!formData.centerName) missingFields.push('Nom du centre')
      if (!formData.registrationNumber) missingFields.push('Numéro d\'enregistrement')
      if (!formData.address) missingFields.push('Adresse')
    } else if (formData.annuaire_role === 'psychologue') {
      if (!formData.specialization) missingFields.push('Spécialité')
      if (!formData.licenseNumber) missingFields.push('Numéro de licence')
    } else if (formData.annuaire_role === 'laboratoire') {
      if (!formData.labName) missingFields.push('Nom du laboratoire')
      if (!formData.registrationNumber) missingFields.push('Numéro de licence')
      if (!formData.address) missingFields.push('Adresse')
    } else if (formData.annuaire_role === 'pharmacie') {
      if (!formData.pharmacyName) missingFields.push('Nom de la pharmacie')
      if (!formData.registrationNumber) missingFields.push('Numéro de licence')
      if (!formData.address) missingFields.push('Adresse')
    } else if (formData.annuaire_role === 'association') {
      if (!formData.associationName) missingFields.push('Nom de l\'association')
      if (!formData.registrationNumber) missingFields.push('Numéro d\'enregistrement')
      if (!formData.address) missingFields.push('Adresse')
    }

    if (mode === 'create' && !formData.avatar_url) missingFields.push('Photo de profil')

    if (missingFields.length > 0) {
      toast.error(`Veuillez compléter les champs obligatoires : ${missingFields.join(', ')}`)
      return null
    }

    let avatarPayload: { data: string; name: string; type: string } | undefined
    if (formData.avatar_url && formData.avatar_url.startsWith('data:')) {
      // Use the already compressed image from preview
      avatarPayload = {
        data: formData.avatar_url,
        name: formData.avatar?.name || 'avatar.jpg',
        type: 'image/jpeg',
      }
    }

    const roleSpecificData: Record<string, any> = {}

    if (formData.annuaire_role === 'medecin') {
      roleSpecificData.specialization = formData.specialization
      roleSpecificData.license_number = formData.licenseNumber
      roleSpecificData.hospital_affiliation = formData.hospitalAffiliation || null
      roleSpecificData.consultation_fee = formData.consultationFee ? Number(formData.consultationFee) : null
      roleSpecificData.years_of_experience = formData.yearsOfExperience ? Number(formData.yearsOfExperience) : null
      roleSpecificData.languages_spoken = formData.languagesSpoken ? toArrayFromString(formData.languagesSpoken) : []
      roleSpecificData.education = formData.education ? toArrayFromString(formData.education) : []
      roleSpecificData.certifications = formData.certifications ? toArrayFromString(formData.certifications) : []
      roleSpecificData.accepts_new_patients = formData.acceptsNewPatients
    } else if (formData.annuaire_role === 'centre_cancer') {
      roleSpecificData.center_name = formData.centerName
      roleSpecificData.registration_number = formData.registrationNumber
      roleSpecificData.address = formData.address
      roleSpecificData.emergency_phone = formData.emergencyPhone || null
      roleSpecificData.website = formData.website || null
      roleSpecificData.bed_capacity = formData.bedCapacity ? Number(formData.bedCapacity) : null
    } else if (formData.annuaire_role === 'psychologue') {
      roleSpecificData.specialization = formData.specialization
      roleSpecificData.license_number = formData.licenseNumber
      roleSpecificData.office_address = formData.officeAddress || null
      roleSpecificData.consultation_fee = formData.consultationFee ? Number(formData.consultationFee) : null
      roleSpecificData.years_of_experience = formData.yearsOfExperience ? Number(formData.yearsOfExperience) : null
      roleSpecificData.languages_spoken = formData.languagesSpoken ? toArrayFromString(formData.languagesSpoken) : []
      roleSpecificData.education = formData.education ? toArrayFromString(formData.education) : []
      roleSpecificData.certifications = formData.certifications ? toArrayFromString(formData.certifications) : []
      roleSpecificData.accepts_new_patients = formData.acceptsNewPatients
      roleSpecificData.therapy_types = formData.therapyTypes ? toArrayFromString(formData.therapyTypes) : []
    } else if (formData.annuaire_role === 'laboratoire') {
      roleSpecificData.lab_name = formData.labName
      roleSpecificData.license_number = formData.registrationNumber
      roleSpecificData.address = formData.address
      roleSpecificData.working_hours = formData.workingHours || {}
      roleSpecificData.test_types = formData.testTypes ? toArrayFromString(formData.testTypes) : []
      roleSpecificData.has_home_service = formData.hasHomeService
      roleSpecificData.average_turnaround_time = formData.turnaroundTime ? Number(formData.turnaroundTime) : null
    } else if (formData.annuaire_role === 'pharmacie') {
      roleSpecificData.pharmacy_name = formData.pharmacyName
      roleSpecificData.license_number = formData.registrationNumber
      roleSpecificData.address = formData.address
      roleSpecificData.emergency_phone = formData.emergencyPhone || null
      roleSpecificData.working_hours = formData.workingHours || {}
      roleSpecificData.has_delivery = formData.hasDelivery
      roleSpecificData.is_24_hours = formData.is24Hours
    } else if (formData.annuaire_role === 'association') {
      roleSpecificData.association_name = formData.associationName
      roleSpecificData.registration_number = formData.registrationNumber
      roleSpecificData.address = formData.address
      roleSpecificData.description = formData.description || null
      roleSpecificData.website = formData.website || null
      roleSpecificData.focus_areas = formData.focusAreas ? toArrayFromString(formData.focusAreas) : []
      roleSpecificData.services_offered = formData.servicesOffered ? toArrayFromString(formData.servicesOffered) : []
    }

    return {
      annuaire_role: formData.annuaire_role as AnnuaireRole,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || undefined,
      wilaya: formData.wilaya,
      commune: formData.commune,
      bio: formData.bio.trim() || undefined,
      avatar: avatarPayload,
      password: formData.password || undefined,
      roleSpecificData,
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const payload = await buildPayload()
      if (!payload) return

      if (mode === 'create') {
        await annuaireService.createAnnuaireEntry(payload)
        toast.success('Utilisateur ajouté avec succès')
        setFormData(createEmptyFormState())
      } else if (entry) {
        await annuaireService.updateAnnuaireEntry(entry.id, {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || null,
          wilaya: payload.wilaya,
          commune: payload.commune,
          bio: payload.bio || null,
          avatar: payload.avatar,
          roleSpecificData: payload.roleSpecificData,
        })
        toast.success('Utilisateur mis à jour avec succès')
      }

      onSuccess()
    } catch (error) {
      console.error('Submit error:', error)
      const message = error instanceof Error ? error.message : null
      toast.error(message || 'Erreur lors de l\'opération')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className='sm:max-w-2xl max-h-[95vh] overflow-y-auto'>
      <DialogHeader className='pb-4'>
        <DialogTitle className='text-2xl'>{mode === 'create' ? 'Ajouter un nouvel utilisateur' : 'Modifier l\'utilisateur'}</DialogTitle>
      </DialogHeader>
      <div className='space-y-6 py-4'>
        {/* Image Upload Section */}
        <div className='flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200'>
          <div className='relative'>
            {formData.avatar_url ? (
              <div className='relative'>
                <img src={formData.avatar_url} alt='Avatar' className='w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg' />
                <button
                  onClick={() => handleFormChange('avatar_url', '')}
                  className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ) : (
              <div className='w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-lg'>
                <Upload className='h-8 w-8 text-slate-400' />
              </div>
            )}
            <input
              type='file'
              accept='image/*'
              onChange={handleAvatarChange}
              className='hidden'
              id='avatar-input'
            />
            <label htmlFor='avatar-input'>
              <Button type='button' variant='outline' size='sm' className='absolute bottom-0 right-0 rounded-full' asChild>
                <span className='cursor-pointer'>
                  <Upload className='h-3 w-3' />
                </span>
              </Button>
            </label>
          </div>
          <p className='text-sm text-slate-600 text-center'>Cliquez pour ajouter une photo</p>
        </div>

        {/* Basic Information */}
        <div className='space-y-4'>
          <h3 className='text-sm font-semibold text-slate-700'>Informations de base</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Nom complet *</Label>
              <Input
                id='name'
                placeholder='Nom Prénom'
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className='border-slate-300'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email *</Label>
              <Input
                id='email'
                type='email'
                placeholder='email@example.com'
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                disabled={mode === 'edit'}
                className='border-slate-300'
              />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='phone'>Téléphone *</Label>
              <Input
                id='phone'
                placeholder='+213 555 123 456'
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                className='border-slate-300'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Mot de passe {mode === 'create' ? '*' : ''}</Label>
              <Input
                id='password'
                type='password'
                placeholder='Minimum 6 caractères'
                value={formData.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                className='border-slate-300'
              />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='annuaire_role'>Rôle *</Label>
              <Select value={formData.annuaire_role} onValueChange={(value) => handleFormChange('annuaire_role', value)} disabled={mode === 'edit'}>
                <SelectTrigger className='border-slate-300'>
                  <SelectValue placeholder='Sélectionner un rôle' />
                </SelectTrigger>
                <SelectContent>
                  {ANNUAIRE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className='space-y-4'>
          <h3 className='text-sm font-semibold text-slate-700'>Localisation</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='wilaya'>Wilaya *</Label>
              <Select value={formData.wilaya} onValueChange={(value) => handleFormChange('wilaya', value)} disabled={mode === 'edit'}>
                <SelectTrigger className='border-slate-300'>
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
            <div className='grid gap-2'>
              <Label htmlFor='commune'>Commune *</Label>
              <Select value={formData.commune} onValueChange={(value) => handleFormChange('commune', value)} disabled={mode === 'edit' || !formData.wilaya}>
                <SelectTrigger className='border-slate-300'>
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
          </div>
        </div>

        {/* Role-Specific Fields - Only show if role is selected */}
        {formData.annuaire_role && (
          <div className='space-y-4 pt-4 border-t border-slate-200'>
            <h3 className='text-sm font-semibold text-slate-700'>Informations spécifiques au rôle</h3>

        {/* Doctor/Psychologist Fields */}
        {(formData.annuaire_role === 'medecin' || formData.annuaire_role === 'psychologue') && (
          <>
            <div className='grid gap-2'>
              <Label htmlFor='specialization'>Spécialité *</Label>
              <Input
                id='specialization'
                placeholder='Ex: Oncologie'
                value={formData.specialization}
                onChange={(e) => handleFormChange('specialization', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='licenseNumber'>Numéro de licence *</Label>
              <Input
                id='licenseNumber'
                placeholder='Ex: MED-12345'
                value={formData.licenseNumber}
                onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            {formData.annuaire_role === 'medecin' && (
              <div className='grid gap-2'>
                <Label htmlFor='hospitalAffiliation'>Établissement d'affectation</Label>
                <Input
                  id='hospitalAffiliation'
                  placeholder="Nom de l'hôpital ou de la clinique"
                  value={formData.hospitalAffiliation}
                  onChange={(e) => handleFormChange('hospitalAffiliation', e.target.value)}
                  disabled={mode === 'edit'}
                />
              </div>
            )}

            {formData.annuaire_role === 'psychologue' && (
              <div className='grid gap-2'>
                <Label htmlFor='officeAddress'>Adresse du cabinet</Label>
                <Input
                  id='officeAddress'
                  placeholder='Adresse du cabinet'
                  value={formData.officeAddress}
                  onChange={(e) => handleFormChange('officeAddress', e.target.value)}
                  disabled={mode === 'edit'}
                />
              </div>
            )}

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
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='yearsOfExperience'>Années d'expérience</Label>
              <Input
                id='yearsOfExperience'
                type='number'
                min='0'
                placeholder='Ex: 12'
                value={formData.yearsOfExperience}
                onChange={(e) => handleFormChange('yearsOfExperience', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='languagesSpoken'>Langues parlées (séparées par virgule)</Label>
              <Textarea
                id='languagesSpoken'
                placeholder='Français, Arabe, Anglais'
                value={formData.languagesSpoken}
                onChange={(e) => handleFormChange('languagesSpoken', e.target.value)}
                disabled={mode === 'edit'}
                rows={2}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='education'>Formation (une entrée par ligne)</Label>
              <Textarea
                id='education'
                placeholder={"Diplôme de médecine - Université d'Alger"}
                value={formData.education}
                onChange={(e) => handleFormChange('education', e.target.value)}
                disabled={mode === 'edit'}
                rows={2}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='certifications'>Certifications (une entrée par ligne)</Label>
              <Textarea
                id='certifications'
                placeholder={"Certification Radiothérapie Avancée"}
                value={formData.certifications}
                onChange={(e) => handleFormChange('certifications', e.target.value)}
                disabled={mode === 'edit'}
                rows={2}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border px-4 py-3'>
              <div>
                <Label>Accepte de nouveaux patients</Label>
                <p className='text-sm text-muted-foreground'>Disponible pour de nouvelles consultations.</p>
              </div>
              <Switch
                checked={formData.acceptsNewPatients}
                onCheckedChange={(value) => handleFormChange('acceptsNewPatients', value)}
                disabled={mode === 'edit'}
              />
            </div>

            {formData.annuaire_role === 'psychologue' && (
              <div className='grid gap-2'>
                <Label htmlFor='therapyTypes'>Types de thérapie (séparés par virgule)</Label>
                <Textarea
                  id='therapyTypes'
                  placeholder='TCC, Psychanalyse, Thérapie de groupe'
                  value={formData.therapyTypes}
                  onChange={(e) => handleFormChange('therapyTypes', e.target.value)}
                  disabled={mode === 'edit'}
                  rows={2}
                />
              </div>
            )}
          </>
        )}

        {/* Cancer Center Fields */}
        {formData.annuaire_role === 'centre_cancer' && (
          <>
            <div className='grid gap-2'>
              <Label htmlFor='centerName'>Nom du centre *</Label>
              <Input
                id='centerName'
                placeholder='Nom du centre de lutte contre le cancer'
                value={formData.centerName}
                onChange={(e) => handleFormChange('centerName', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='registrationNumber'>Numéro d'enregistrement *</Label>
              <Input
                id='registrationNumber'
                placeholder='Ex: CC-12345'
                value={formData.registrationNumber}
                onChange={(e) => handleFormChange('registrationNumber', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='address'>Adresse *</Label>
              <Input
                id='address'
                placeholder='Adresse complète'
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='emergencyPhone'>Téléphone d'urgence</Label>
              <Input
                id='emergencyPhone'
                placeholder='+213 555 123 456'
                value={formData.emergencyPhone}
                onChange={(e) => handleFormChange('emergencyPhone', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='website'>Site web</Label>
              <Input
                id='website'
                placeholder='https://example.com'
                value={formData.website}
                onChange={(e) => handleFormChange('website', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='bedCapacity'>Capacité en lits</Label>
              <Input
                id='bedCapacity'
                type='number'
                min='0'
                placeholder='Ex: 100'
                value={formData.bedCapacity}
                onChange={(e) => handleFormChange('bedCapacity', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>
          </>
        )}

        {/* Laboratory Fields */}
        {formData.annuaire_role === 'laboratoire' && (
          <>
            <div className='grid gap-2'>
              <Label htmlFor='labName'>Nom du laboratoire *</Label>
              <Input
                id='labName'
                placeholder='Nom du laboratoire'
                value={formData.labName}
                onChange={(e) => handleFormChange('labName', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='registrationNumber'>Numéro de licence *</Label>
              <Input
                id='registrationNumber'
                placeholder='Ex: LAB-12345'
                value={formData.registrationNumber}
                onChange={(e) => handleFormChange('registrationNumber', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='address'>Adresse *</Label>
              <Input
                id='address'
                placeholder='Adresse complète'
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='testTypes'>Types de tests (séparés par virgule)</Label>
              <Textarea
                id='testTypes'
                placeholder='Analyses sanguines, Radiologie, IRM'
                value={formData.testTypes}
                onChange={(e) => handleFormChange('testTypes', e.target.value)}
                disabled={mode === 'edit'}
                rows={2}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border px-4 py-3'>
              <div>
                <Label>Service à domicile</Label>
                <p className='text-sm text-muted-foreground'>Prélèvement à domicile disponible.</p>
              </div>
              <Switch
                checked={formData.hasHomeService}
                onCheckedChange={(value) => handleFormChange('hasHomeService', value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='turnaroundTime'>Délai de résultat (heures)</Label>
              <Input
                id='turnaroundTime'
                type='number'
                min='0'
                placeholder='Ex: 24'
                value={formData.turnaroundTime}
                onChange={(e) => handleFormChange('turnaroundTime', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>
          </>
        )}

        {/* Pharmacy Fields */}
        {formData.annuaire_role === 'pharmacie' && (
          <>
            <div className='grid gap-2'>
              <Label htmlFor='pharmacyName'>Nom de la pharmacie *</Label>
              <Input
                id='pharmacyName'
                placeholder='Nom de la pharmacie'
                value={formData.pharmacyName}
                onChange={(e) => handleFormChange('pharmacyName', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='registrationNumber'>Numéro de licence *</Label>
              <Input
                id='registrationNumber'
                placeholder='Ex: PHARM-12345'
                value={formData.registrationNumber}
                onChange={(e) => handleFormChange('registrationNumber', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='address'>Adresse *</Label>
              <Input
                id='address'
                placeholder='Adresse complète'
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='emergencyPhone'>Téléphone d'urgence</Label>
              <Input
                id='emergencyPhone'
                placeholder='+213 555 123 456'
                value={formData.emergencyPhone}
                onChange={(e) => handleFormChange('emergencyPhone', e.target.value)}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border px-4 py-3'>
              <div>
                <Label>Livraison disponible</Label>
                <p className='text-sm text-muted-foreground'>Service de livraison à domicile.</p>
              </div>
              <Switch
                checked={formData.hasDelivery}
                onCheckedChange={(value) => handleFormChange('hasDelivery', value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border px-4 py-3'>
              <div>
                <Label>Ouvert 24h/24</Label>
                <p className='text-sm text-muted-foreground'>Pharmacie ouverte 24 heures sur 24.</p>
              </div>
              <Switch
                checked={formData.is24Hours}
                onCheckedChange={(value) => handleFormChange('is24Hours', value)}
                disabled={mode === 'edit'}
              />
            </div>
          </>
        )}

        {/* Association Fields */}
        {formData.annuaire_role === 'association' && (
          <>
            <div className='grid gap-2'>
              <Label htmlFor='associationName'>Nom de l&apos;association *</Label>
              <Input
                id='associationName'
                placeholder='Nom de l&apos;association'
                value={formData.associationName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('associationName', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='registrationNumber'>Numéro d&apos;enregistrement *</Label>
              <Input
                id='registrationNumber'
                placeholder='Ex: ASSOC-12345'
                value={formData.registrationNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('registrationNumber', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='address'>Adresse *</Label>
              <Input
                id='address'
                placeholder='Adresse complète'
                value={formData.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('address', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder='Description de l&apos;association'
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFormChange('description', e.target.value)}
                disabled={mode === 'edit'}
                rows={2}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='website'>Site web</Label>
              <Input
                id='website'
                placeholder='https://example.com'
                value={formData.website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('website', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='focusAreas'>Domaines d&apos;action (séparés par virgule)</Label>
              <Textarea
                id='focusAreas'
                placeholder='Soutien psychologique, Aide financière, Logement'
                value={formData.focusAreas}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFormChange('focusAreas', e.target.value)}
                rows={2}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='servicesOffered'>Services offerts (séparés par virgule)</Label>
              <Textarea
                id='servicesOffered'
                placeholder='Consultation gratuite, Hébergement, Transport'
                value={formData.servicesOffered}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFormChange('servicesOffered', e.target.value)}
                rows={2}
              />
            </div>
          </>
        )}
          </div>
        )}
      </div>
      <DialogFooter className='gap-3 pt-6 border-t border-slate-200'>
        <Button variant='outline' onClick={onClose} disabled={isSubmitting} className='px-6'>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className='px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'>
          {isSubmitting ? 'En cours...' : mode === 'create' ? 'Ajouter' : 'Enregistrer'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
