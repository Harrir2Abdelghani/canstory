import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Cog, Save } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { usePlatformConfig, useUpdateMultiplePlatformConfigs } from '@/hooks/use-platform-config'

export function GeneralTab() {
  const { data: configData, isLoading } = usePlatformConfig()
  const updateConfigs = useUpdateMultiplePlatformConfigs()

  const [formData, setFormData] = useState({
    platform_name: '',
    contact_email: '',
    default_language: 'fr',
    enable_registration: true,
    enable_community: true,
    maintenance_mode: false,
  })

  useEffect(() => {
    if (configData && configData.length > 0) {
      const newFormData = { ...formData }
      configData.forEach((config) => {
        const key = config.key as keyof typeof formData
        if (key in newFormData) {
          const value = config.value
          if (typeof newFormData[key] === 'boolean') {
            newFormData[key] = (typeof value === 'boolean' ? value : String(value) === 'true') as never
          } else {
            newFormData[key] = String(value).replace(/^"|"$/g, '') as never
          }
        }
      })
      setFormData(newFormData)
    }
  }, [configData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const configs = [
        { key: 'platform_name', value: formData.platform_name, config_type: 'string' },
        { key: 'contact_email', value: formData.contact_email, config_type: 'string' },
        { key: 'default_language', value: formData.default_language, config_type: 'string' },
        { key: 'enable_registration', value: formData.enable_registration, config_type: 'boolean' },
        { key: 'enable_community', value: formData.enable_community, config_type: 'boolean' },
        { key: 'maintenance_mode', value: formData.maintenance_mode, config_type: 'boolean' },
      ]
      await updateConfigs.mutateAsync(configs)
    } catch (error) {
      console.error('Error updating platform config:', error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <p className='text-muted-foreground'>Chargement...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Cog className='h-5 w-5' />
            Paramètres Généraux
          </CardTitle>
          <CardDescription>
            Configuration générale de la plateforme Canstory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Platform Information */}
            <div className='space-y-4 border-b pb-6'>
              <h3 className='font-semibold text-sm'>Informations de la Plateforme</h3>
              
              <div className='grid gap-2'>
                <Label htmlFor='platform_name'>Nom de la plateforme</Label>
                <Input
                  id='platform_name'
                  value={formData.platform_name}
                  onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                  placeholder='Canstory'
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='contact_email'>Email de contact</Label>
                <Input
                  id='contact_email'
                  type='email'
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder='contact@canstory.com'
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='default_language'>Langue par défaut</Label>
                <Select
                  value={formData.default_language}
                  onValueChange={(value) =>
                    setFormData({ ...formData, default_language: value })
                  }
                >
                  <SelectTrigger id='default_language'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='fr'>Français</SelectItem>
                    <SelectItem value='en'>English</SelectItem>
                    <SelectItem value='ar'>العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className='space-y-4 border-b pb-6'>
              <h3 className='font-semibold text-sm'>Fonctionnalités</h3>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='enable_registration' className='font-normal'>
                    Activer l'inscription
                  </Label>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Permettre aux nouveaux utilisateurs de s'inscrire
                  </p>
                </div>
                <Switch
                  id='enable_registration'
                  checked={formData.enable_registration}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enable_registration: checked })
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='enable_community' className='font-normal'>
                    Activer la communauté
                  </Label>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Permettre les posts et discussions communautaires
                  </p>
                </div>
                <Switch
                  id='enable_community'
                  checked={formData.enable_community}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enable_community: checked })
                  }
                />
              </div>
            </div>

            {/* Maintenance */}
            <div className='space-y-4'>
              <h3 className='font-semibold text-sm'>Maintenance</h3>

              <div className='flex items-center justify-between p-4 border rounded-lg bg-destructive/5'>
                <div>
                  <Label htmlFor='maintenance_mode' className='font-normal'>
                    Mode maintenance
                  </Label>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Désactiver l'accès à la plateforme pour les utilisateurs
                  </p>
                </div>
                <Switch
                  id='maintenance_mode'
                  checked={formData.maintenance_mode}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, maintenance_mode: checked })
                  }
                />
              </div>
            </div>

            <Button type='submit' className='gap-2' disabled={updateConfigs.isPending}>
              <Save className='h-4 w-4' />
              {updateConfigs.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
