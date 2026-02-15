import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
// import { LeafletLocationPicker } from './LeafletLocationPicker'
import { accommodationsService } from '@/services/accommodations'
import { wilayasService, communesService, type Wilaya, type Commune } from '@/services/platform-config'
import type { Accommodation, AccommodationFormData } from './types'

interface AccommodationFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accommodation?: Accommodation | null
  onSuccess: () => void
}

export function AccommodationFormModal({
  open,
  onOpenChange,
  accommodation,
  onSuccess,
}: AccommodationFormModalProps) {
  const isEditMode = !!accommodation

  const [loading, setLoading] = useState(false)
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [loadingWilayas, setLoadingWilayas] = useState(true)

  const [formData, setFormData] = useState<AccommodationFormData>({
    name: '',
    wilaya: '',
    commune: '',
    address: '',
    phone: '',
    email: '',
    capacity: 1,
    available_beds: 0,
    description: '',
    amenities: '',
    rules: '',
    is_active: true,
    latitude: null,
    longitude: null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load wilayas on mount
  useEffect(() => {
    const loadWilayas = async () => {
      try {
        setLoadingWilayas(true)
        const data = await wilayasService.getWilayas()
        setWilayas(data.filter(w => w.is_active !== false))
      } catch (error) {
        console.error('Failed to load wilayas:', error)
        toast.error('Erreur lors du chargement des wilayas')
      } finally {
        setLoadingWilayas(false)
      }
    }
    loadWilayas()
  }, [])

  // Load communes when wilaya changes
  useEffect(() => {
    const loadCommunes = async () => {
      if (!formData.wilaya) {
        setCommunes([])
        return
      }

      try {
        const selectedWilaya = wilayas.find(w => w.name === formData.wilaya)
        if (selectedWilaya) {
          const data = await communesService.getCommunesByWilaya(selectedWilaya.id)
          setCommunes(data)
        }
      } catch (error) {
        console.error('Failed to load communes:', error)
        toast.error('Erreur lors du chargement des communes')
      }
    }
    loadCommunes()
  }, [formData.wilaya, wilayas])

  // Populate form when editing
  useEffect(() => {
    if (accommodation && open) {
      setFormData({
        name: accommodation.name,
        wilaya: accommodation.wilaya,
        commune: accommodation.commune,
        address: accommodation.address,
        phone: accommodation.phone,
        email: accommodation.email || '',
        capacity: accommodation.capacity,
        available_beds: accommodation.available_beds,
        description: accommodation.description || '',
        amenities: accommodation.amenities?.join('\n') || '',
        rules: accommodation.rules?.join('\n') || '',
        is_active: accommodation.is_active,
        latitude: accommodation.latitude,
        longitude: accommodation.longitude,
      })
    } else if (!open) {
      // Reset form when modal closes
      setFormData({
        name: '',
        wilaya: '',
        commune: '',
        address: '',
        phone: '',
        email: '',
        capacity: 1,
        available_beds: 0,
        description: '',
        amenities: '',
        rules: '',
        is_active: true,
        latitude: null,
        longitude: null,
      })
      setErrors({})
    }
  }, [accommodation, open])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    if (!formData.wilaya) newErrors.wilaya = 'La wilaya est requise'
    if (!formData.commune) newErrors.commune = 'La commune est requise'
    if (!formData.address.trim()) newErrors.address = "L'adresse est requise"
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (formData.capacity < 1) newErrors.capacity = 'La capacité doit être au moins 1'
    if (formData.available_beds < 0) newErrors.available_beds = 'Les places disponibles doivent être >= 0'
    if (formData.available_beds > formData.capacity) {
      newErrors.available_beds = 'Les places disponibles ne peuvent pas dépasser la capacité totale'
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Format email invalide'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    try {
      setLoading(true)

      if (isEditMode && accommodation) {
        await accommodationsService.updateAccommodation(accommodation.id, formData)
        toast.success('Hébergement mis à jour avec succès')
      } else {
        await accommodationsService.createAccommodation(formData)
        toast.success('Hébergement créé avec succès')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving accommodation:', error)
      const errorMessage = error.response?.data?.details?.join(', ') || error.response?.data?.error || 'Erreur lors de l\'enregistrement'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Modifier l\'hébergement' : 'Nouvel hébergement'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modifiez les informations de l\'hébergement gratuit' 
              : 'Ajoutez un nouvel hébergement gratuit pour les patients'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Informations de base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Maison d'accueil Alger"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="wilaya">Wilaya <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.wilaya}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, wilaya: value, commune: '' }))}
                  disabled={loadingWilayas}
                >
                  <SelectTrigger className={errors.wilaya ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner une wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayas.map((wilaya) => (
                      <SelectItem key={wilaya.id} value={wilaya.name}>
                        {wilaya.code} - {wilaya.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.wilaya && <p className="text-sm text-destructive">{errors.wilaya}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commune">Commune <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.commune}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, commune: value }))}
                  disabled={!formData.wilaya || communes.length === 0}
                >
                  <SelectTrigger className={errors.commune ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner une commune" />
                  </SelectTrigger>
                  <SelectContent>
                    {communes.map((commune) => (
                      <SelectItem key={commune.id} value={commune.name}>
                        {commune.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.commune && <p className="text-sm text-destructive">{errors.commune}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone <span className="text-destructive">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex: 0555123456"
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@example.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adresse complète <span className="text-destructive">*</span></Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Adresse détaillée de l'hébergement"
                  rows={2}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Capacité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacité totale <span className="text-destructive">*</span></Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  className={errors.capacity ? 'border-destructive' : ''}
                />
                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_beds">Places disponibles <span className="text-destructive">*</span></Label>
                <Input
                  id="available_beds"
                  type="number"
                  min="0"
                  max={formData.capacity}
                  value={formData.available_beds}
                  onChange={(e) => setFormData(prev => ({ ...prev, available_beds: parseInt(e.target.value) || 0 }))}
                  className={errors.available_beds ? 'border-destructive' : ''}
                />
                {errors.available_beds && <p className="text-sm text-destructive">{errors.available_beds}</p>}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Localisation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || null })}
                  placeholder="36.7538"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || null })}
                  placeholder="3.0588"
                />
              </div>
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-muted-foreground">
                Coordonnées: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Détails</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l'hébergement, services offerts, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Commodités (une par ligne)</Label>
                <Textarea
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
                  placeholder="Ex:\nCuisine équipée\nWi-Fi gratuit\nChauffage"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules">Conditions d'hébergement (une par ligne)</Label>
                <Textarea
                  id="rules"
                  value={formData.rules}
                  onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                  placeholder="Ex:\nRéservation obligatoire\nDurée maximale: 1 mois\nJustificatif médical requis"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Hébergement actif
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
