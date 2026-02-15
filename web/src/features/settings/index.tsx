import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Lock, User, Eye, EyeOff, Upload } from 'lucide-react'
import axios from 'axios'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function Settings() {
  const [user, setUser] = useState<any>(null)
  const [wilayas, setWilayas] = useState<any[]>([])
  const [communes, setCommunes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('account')
  const [showPassword, setShowPassword] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    wilaya: '',
    commune: '',
    avatar: null as File | null,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [userRes, wilayasRes] = await Promise.all([
        axios.get('/api/auth/me', { withCredentials: true }),
        axios.get('/api/admin/wilayas', { withCredentials: true }),
      ])

      setUser(userRes.data)
      const fetchedWilayas = wilayasRes.data || []
      setWilayas(fetchedWilayas)
      setAvatarPreview(userRes.data.avatar_url)

      // Find wilaya ID if the data contains a name
      const userWilaya = userRes.data.wilaya
      const foundWilaya = fetchedWilayas.find(
        (w: any) => w.id === userWilaya || w.name === userWilaya
      )
      const wilayaId = foundWilaya ? foundWilaya.id : userWilaya

      setProfileData({
        full_name: userRes.data.full_name || '',
        phone: userRes.data.phone || '',
        wilaya: wilayaId,
        commune: userRes.data.commune || '',
        avatar: null,
      })

      if (wilayaId) {
        const communesRes = await axios.get(`/api/admin/communes?wilaya_id=${wilayaId}`, {
          withCredentials: true,
        })
        const fetchedCommunes = communesRes.data || []
        setCommunes(fetchedCommunes)

        // Find commune ID if the data contains a name
        const userCommune = userRes.data.commune
        const foundCommune = fetchedCommunes.find(
          (c: any) => c.id === userCommune || c.name === userCommune
        )
        if (foundCommune) {
          setProfileData((prev) => ({ ...prev, commune: foundCommune.id }))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image trop grande (max 5MB)')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
        setProfileData({ ...profileData, avatar: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleWilayaChange = async (wilayaId: string) => {
    setProfileData({ ...profileData, wilaya: wilayaId, commune: '' })

    try {
      const res = await axios.get(`/api/admin/communes?wilaya_id=${wilayaId}`, {
        withCredentials: true,
      })
      setCommunes(res.data || [])
    } catch (error) {
      console.error('Error fetching communes:', error)
      toast.error('Erreur lors du chargement des communes')
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profileData.full_name) {
      toast.error('Le nom complet est requis')
      return
    }

    setIsSavingProfile(true)
    try {
      const formData = new FormData()
      formData.append('full_name', profileData.full_name)
      formData.append('phone', profileData.phone || '')
      formData.append('wilaya', profileData.wilaya || '')
      formData.append('commune', profileData.commune || '')
      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar)
      }

      const response = await axios.patch(`/api/admin/users/${user.id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setUser(response.data)
      setAvatarPreview(response.data.avatar_url)
      setIsEditingProfile(false)
      setProfileData({ ...profileData, avatar: null })
      toast.success('Profil mis à jour avec succès')
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setIsChangingPassword(true)
    try {
      await axios.post(
        '/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      )
      toast.success('Mot de passe changé avec succès')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Password change error:', error)
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const getWilayaName = (id: string) => {
    return wilayas.find((w) => w.id === id)?.name || id
  }

  const getCommuneName = (id: string) => {
    return communes.find((c) => c.id === id)?.name || id
  }

  if (loading) {
    return (
      <>
        <Header>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex items-center justify-center h-96'>
            <p className='text-muted-foreground'>Chargement...</p>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Paramètres</h1>
            <p className='text-muted-foreground mt-2'>Gérez vos paramètres de compte et vos préférences</p>
          </div>

          <Separator />

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full max-w-md grid-cols-2'>
              <TabsTrigger value='account' className='flex items-center gap-2'>
                <User size={16} />
                Compte
              </TabsTrigger>
              <TabsTrigger value='security' className='flex items-center gap-2'>
                <Lock size={16} />
                Sécurité
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value='account' className='space-y-6 w-full'>
              <Card className='w-full'>
                <CardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                  <div>
                    <CardTitle>Informations du compte</CardTitle>
                    <CardDescription>Vos informations personnelles</CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setIsEditingProfile(true)}
                      className='w-full sm:w-auto'
                    >
                      Modifier
                    </Button>
                  )}
                </CardHeader>
                <CardContent className='w-full'>
                  {!isEditingProfile ? (
                    <div className='space-y-6'>
                      <div className='flex flex-col sm:flex-row sm:items-start gap-6'>
                        <div className='flex-shrink-0'>
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt='Avatar'
                              className='h-24 w-24 rounded-full object-cover border-4 border-primary'
                            />
                          ) : (
                            <div className='flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-3xl font-bold'>
                              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                          )}
                        </div>
                        <div className='flex-1 w-full space-y-4'>
                          <div className='grid gap-2'>
                            <Label className='text-xs font-semibold text-muted-foreground uppercase'>Nom complet</Label>
                            <p className='text-lg font-semibold'>{user?.full_name || '-'}</p>
                          </div>
                          <div className='grid gap-2'>
                            <Label className='text-xs font-semibold text-muted-foreground uppercase'>Email</Label>
                            <p className='text-base'>{user?.email || '-'}</p>
                          </div>
                          <div className='grid gap-2'>
                            <Label className='text-xs font-semibold text-muted-foreground uppercase'>Rôle</Label>
                            <p className='text-base capitalize font-medium'>{user?.role || '-'}</p>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className='w-full space-y-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                          <div className='grid gap-2'>
                            <Label className='text-xs font-semibold text-muted-foreground uppercase'>Téléphone</Label>
                            <p className='text-base'>{user?.phone || '-'}</p>
                          </div>
                          <div className='grid gap-2'>
                            <Label className='text-xs font-semibold text-muted-foreground uppercase'>Wilaya</Label>
                            <p className='text-base'>{getWilayaName(user?.wilaya) || '-'}</p>
                          </div>
                        </div>
                        <div className='grid gap-2'>
                          <Label className='text-xs font-semibold text-muted-foreground uppercase'>Commune</Label>
                          <p className='text-base'>{getCommuneName(user?.commune) || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className='space-y-6 w-full'>
                      <div className='flex flex-col sm:flex-row sm:items-start gap-6'>
                        <div className='flex-shrink-0'>
                          <div className='relative'>
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt='Avatar Preview'
                                className='h-24 w-24 rounded-full object-cover border-4 border-primary'
                              />
                            ) : (
                              <div className='flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-3xl font-bold'>
                                {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                              </div>
                            )}
                            <label className='absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90 transition'>
                              <Upload size={16} />
                              <input
                                type='file'
                                accept='image/*'
                                onChange={handleAvatarChange}
                                disabled={isSavingProfile}
                                className='hidden'
                              />
                            </label>
                          </div>
                        </div>
                        <div className='flex-1 w-full space-y-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='full_name' className='text-sm font-semibold'>
                              Nom complet *
                            </Label>
                            <Input
                              id='full_name'
                              value={profileData.full_name}
                              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                              disabled={isSavingProfile}
                              placeholder='Votre nom complet'
                              className='w-full'
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='phone' className='text-sm font-semibold'>
                              Téléphone
                            </Label>
                            <Input
                              id='phone'
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              disabled={isSavingProfile}
                              placeholder='+213 555 123 456'
                              className='w-full'
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className='w-full space-y-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='wilaya' className='text-sm font-semibold'>
                              Wilaya
                            </Label>
                            <Select value={profileData.wilaya} onValueChange={handleWilayaChange} disabled={isSavingProfile}>
                              <SelectTrigger className='w-full'>
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

                          <div className='space-y-2'>
                            <Label htmlFor='commune' className='text-sm font-semibold'>
                              Commune
                            </Label>
                            <Select
                              value={profileData.commune}
                              onValueChange={(value) => setProfileData({ ...profileData, commune: value })}
                              disabled={!profileData.wilaya || isSavingProfile}
                            >
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder={profileData.wilaya ? 'Sélectionner une commune' : 'Sélectionnez d\'abord une wilaya'} />
                              </SelectTrigger>
                              <SelectContent>
                                {communes.map((commune) => (
                                  <SelectItem key={commune.id} value={commune.id}>
                                    {commune.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className='flex flex-col sm:flex-row gap-2 pt-4 w-full'>
                        <Button type='submit' disabled={isSavingProfile} className='w-full sm:flex-1'>
                          {isSavingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          disabled={isSavingProfile}
                          onClick={() => {
                            setIsEditingProfile(false)
                            setAvatarPreview(user?.avatar_url)
                            setProfileData({
                              full_name: user?.full_name || '',
                              phone: user?.phone || '',
                              wilaya: user?.wilaya || '',
                              commune: user?.commune || '',
                              avatar: null,
                            })
                          }}
                          className='w-full sm:flex-1'
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value='security' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Changer le mot de passe</CardTitle>
                  <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='current-password'>Mot de passe actuel *</Label>
                      <div className='relative'>
                        <Input
                          id='current-password'
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Entrez votre mot de passe actuel'
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          disabled={isChangingPassword}
                          className='pr-10'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='new-password'>Nouveau mot de passe *</Label>
                      <Input
                        id='new-password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Entrez votre nouveau mot de passe'
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        disabled={isChangingPassword}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='confirm-password'>Confirmer le mot de passe *</Label>
                      <Input
                        id='confirm-password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Confirmez votre nouveau mot de passe'
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        disabled={isChangingPassword}
                      />
                    </div>

                    <Button type='submit' disabled={isChangingPassword} className='w-full'>
                      {isChangingPassword ? 'Changement en cours...' : 'Changer le mot de passe'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
