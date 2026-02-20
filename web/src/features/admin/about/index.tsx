import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Info, Target, Users, Phone, Save, Plus, Edit, Trash2, Mail, MapPin, Loader2, X, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { apiClient } from '@/lib/api-client'



interface AboutSection {
  id: string
  section: string
  title_fr: string | null
  title_ar: string | null
  title_en: string | null
  content_fr: string | null
  content_ar: string | null
  content_en: string | null
  images: any
  metadata: any
  display_order: number
  is_active: boolean
}

interface TeamMember {
  id: string
  full_name: string
  position_fr: string
  position_ar: string | null
  position_en: string | null
  bio_fr: string | null
  bio_ar: string | null
  bio_en: string | null
  email: string | null
  linkedin_url: string | null
  avatar_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ContactInfo {
  id: string
  type: string
  label_fr: string
  label_ar: string | null
  label_en: string | null
  value: string
  icon: string | null
  display_order: number
  is_active: boolean
}

interface MissionValue {
  id: string
  value: string
}

const topNav = [
  { title: 'Overview', href: '/overview', isActive: false, disabled: false },
  { title: 'Customers', href: '/users', isActive: false, disabled: false },
  { title: 'Settings', href: '/platform-config', isActive: false, disabled: false },
]

export function AboutManagement() {
  const [loading, setLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [missionValues, setMissionValues] = useState<MissionValue[]>([])
  
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null)
  
  // Form states
  const [presentationForm, setPresentationForm] = useState({ title: '', description: '', image: '' })
  const [missionForm, setMissionForm] = useState({ text: '', newValue: '' })
  const [teamForm, setTeamForm] = useState({ full_name: '', position_fr: '', bio_fr: '', email: '', linkedin_url: '', avatar_url: '' })
  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    address: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    linkedin: ''
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchSections(),
        fetchTeamMembers(),
        fetchContacts()
      ])
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const fetchSections = async () => {
    try {
      const { data } = await apiClient.instance.get('/admin/about/sections')
      
      // Set form data
      const presentation = data.find((s: AboutSection) => s.section === 'presentation')
      const mission = data.find((s: AboutSection) => s.section === 'mission')
      
      if (presentation) {
        setPresentationForm({
          title: presentation.title_fr || '',
          description: presentation.content_fr || '',
          image: presentation.images?.main || ''
        })
      }
      
      if (mission) {
        setMissionForm(prev => ({ ...prev, text: mission.content_fr || '' }))
        setMissionValues(mission.metadata?.values || [])
      }
    } catch (error) {
      console.error('Fetch sections error:', error)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const { data } = await apiClient.instance.get('/admin/about/team')
      setTeamMembers(data)
    } catch (error) {
      console.error('Fetch team error:', error)
    }
  }

  const fetchContacts = async () => {
    try {
      const { data } = await apiClient.instance.get('/admin/about/contacts')
      
      // Populate contact form
      const newContactForm = { email: '', phone: '', address: '', facebook: '', instagram: '', whatsapp: '', linkedin: '' }
      data.forEach((contact: ContactInfo) => {
        if (contact.type === 'email') newContactForm.email = contact.value
        if (contact.type === 'phone') newContactForm.phone = contact.value
        if (contact.type === 'address') newContactForm.address = contact.value
        if (contact.type === 'social' && contact.label_fr?.toLowerCase().includes('facebook')) newContactForm.facebook = contact.value
        if (contact.type === 'social' && contact.label_fr?.toLowerCase().includes('instagram')) newContactForm.instagram = contact.value
        if (contact.type === 'social' && contact.label_fr?.toLowerCase().includes('whatsapp')) newContactForm.whatsapp = contact.value
        if (contact.type === 'social' && contact.label_fr?.toLowerCase().includes('linkedin')) newContactForm.linkedin = contact.value
      })
      setContactForm(newContactForm)
    } catch (error) {
      console.error('Fetch contacts error:', error)
    }
  }

  const handleSavePresentation = async () => {
    setLoading(true)
    try {
      await apiClient.instance.put('/admin/about/sections/presentation', {
        title_fr: presentationForm.title,
        content_fr: presentationForm.description,
        images: presentationForm.image ? { main: presentationForm.image } : null
      })
      
      toast.success('Présentation enregistrée avec succès')
      await fetchSections()
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMission = async () => {
    setLoading(true)
    try {
      await apiClient.instance.put('/admin/about/sections/mission', {
        content_fr: missionForm.text,
        metadata: { values: missionValues }
      })
      
      toast.success('Mission enregistrée avec succès')
      await fetchSections()
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMissionValue = () => {
    if (!missionForm.newValue.trim()) return
    const newValue = {
      id: Date.now().toString(),
      value: missionForm.newValue.trim()
    }
    setMissionValues([...missionValues, newValue])
    setMissionForm(prev => ({ ...prev, newValue: '' }))
  }

  const handleDeleteMissionValue = (id: string) => {
    setMissionValues(missionValues.filter(v => v.id !== id))
  }

  const handleSaveTeamMember = async () => {
    if (!teamForm.full_name || !teamForm.position_fr) {
      toast.error('Le nom et le poste sont requis')
      return
    }

    setLoading(true)
    try {
      const method = editingTeamMember ? 'put' : 'post'
      const url = editingTeamMember 
        ? `/admin/about/team/${editingTeamMember.id}`
        : '/admin/about/team'
      
      await apiClient.instance[method](url, teamForm)
      
      toast.success(editingTeamMember ? 'Membre modifié' : 'Membre ajouté')
      setIsTeamDialogOpen(false)
      setEditingTeamMember(null)
      setTeamForm({ full_name: '', position_fr: '', bio_fr: '', email: '', linkedin_url: '', avatar_url: '' })
      await fetchTeamMembers()
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member)
    setTeamForm({
      full_name: member.full_name,
      position_fr: member.position_fr,
      bio_fr: member.bio_fr || '',
      email: member.email || '',
      linkedin_url: member.linkedin_url || '',
      avatar_url: member.avatar_url || ''
    })
    setIsTeamDialogOpen(true)
  }

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce membre ?')) return
    
    setLoading(true)
    try {
      await apiClient.instance.delete(`/admin/about/team/${id}`)
      toast.success('Membre supprimé')
      await fetchTeamMembers()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTeamMember = async (id: string) => {
    try {
      await apiClient.instance.patch(`/admin/about/team/${id}/toggle`)
      await fetchTeamMembers()
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleSaveContacts = async () => {
    setLoading(true)
    try {
      const contactsData: any[] = []
      
      if (contactForm.email) {
        contactsData.push({ type: 'email', label_fr: 'Email', value: contactForm.email, icon: 'Mail', display_order: 0 })
      }
      if (contactForm.phone) {
        contactsData.push({ type: 'phone', label_fr: 'Téléphone', value: contactForm.phone, icon: 'Phone', display_order: 1 })
      }
      if (contactForm.address) {
        contactsData.push({ type: 'address', label_fr: 'Adresse', value: contactForm.address, icon: 'MapPin', display_order: 2 })
      }
      if (contactForm.facebook) {
        contactsData.push({ type: 'social', label_fr: 'Facebook', value: contactForm.facebook, icon: 'Facebook', display_order: 3 })
      }
      if (contactForm.instagram) {
        contactsData.push({ type: 'social', label_fr: 'Instagram', value: contactForm.instagram, icon: 'Instagram', display_order: 4 })
      }
      if (contactForm.whatsapp) {
        contactsData.push({ type: 'social', label_fr: 'WhatsApp', value: contactForm.whatsapp, icon: 'MessageCircle', display_order: 5 })
      }
      if (contactForm.linkedin) {
        contactsData.push({ type: 'social', label_fr: 'LinkedIn', value: contactForm.linkedin, icon: 'Linkedin', display_order: 6 })
      }
      
      await apiClient.instance.put('/admin/about/contacts', { contacts: contactsData })
      
      toast.success('Contacts enregistrés avec succès')
      await fetchContacts()
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'presentation' | 'team') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'presentation') {
        setPresentationForm(prev => ({ ...prev, image: reader.result as string }))
      } else {
        setTeamForm(prev => ({ ...prev, avatar_url: reader.result as string }))
      }
    }
    reader.readAsDataURL(file)
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
              <h1 className='text-3xl font-bold tracking-tight'>Page Qui sommes-nous</h1>
              <p className='text-muted-foreground mt-2'>
                Gérez le contenu de la page "À propos"
              </p>
            </div>
          </div>

          <Tabs defaultValue='presentation' className='w-full'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='presentation' className='gap-2'>
                <Info className='h-4 w-4' />
                Présentation
              </TabsTrigger>
              <TabsTrigger value='mission' className='gap-2'>
                <Target className='h-4 w-4' />
                Mission
              </TabsTrigger>
              <TabsTrigger value='team' className='gap-2'>
                <Users className='h-4 w-4' />
                Équipe
              </TabsTrigger>
              <TabsTrigger value='contact' className='gap-2'>
                <Phone className='h-4 w-4' />
                Contacts
              </TabsTrigger>
            </TabsList>

            {/* PRESENTATION TAB */}
            <TabsContent value='presentation' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Info className='h-5 w-5' />
                    Présentation de l'organisation
                  </CardTitle>
                  <CardDescription>Modifiez le titre, la description et l'image de présentation</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='pres-title'>Titre</Label>
                    <Input
                      id='pres-title'
                      placeholder='Ex: Qui sommes-nous ?'
                      value={presentationForm.title}
                      onChange={(e) => setPresentationForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='pres-desc'>Description</Label>
                    <Textarea
                      id='pres-desc'
                      placeholder='Décrivez votre organisation...'
                      value={presentationForm.description}
                      onChange={(e) => setPresentationForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='pres-image'>Image de présentation</Label>
                    <div className='flex items-center gap-4'>
                      <Input
                        id='pres-image'
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleImageChange(e, 'presentation')}
                        className='flex-1'
                      />
                      
                    </div>
                    {presentationForm.image && (
                        <div className='relative w-32 h-24 mt-4 rounded border overflow-hidden'>
                          <img src={presentationForm.image} alt='Preview' className='w-full h-full object-cover' />
                          <button
                            onClick={() => setPresentationForm(prev => ({ ...prev, image: '' }))}
                            className='absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-80'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </div>
                      )}
                  </div>
                  <div className='flex justify-end pt-4'>
                    <Button onClick={handleSavePresentation} disabled={loading} className='gap-2'>
                      {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                      Enregistrer la présentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MISSION TAB */}
            <TabsContent value='mission' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Target className='h-5 w-5' />
                    Notre Mission
                  </CardTitle>
                  <CardDescription>Définissez la mission et les valeurs de l'organisation</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid gap-2'>
                    <Label htmlFor='mission-text'>Texte de la mission</Label>
                    <Textarea
                      id='mission-text'
                      placeholder='Décrivez la mission de votre organisation...'
                      value={missionForm.text}
                      onChange={(e) => setMissionForm(prev => ({ ...prev, text: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  
                  <div className='space-y-3'>
                    <Label>Valeurs & Points clés</Label>
                    <div className='flex gap-2'>
                      <Input
                        placeholder='Ajouter une valeur...'
                        value={missionForm.newValue}
                        onChange={(e) => setMissionForm(prev => ({ ...prev, newValue: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMissionValue()}
                      />
                      <Button onClick={handleAddMissionValue} type='button' className='gap-2'>
                        <Plus className='h-4 w-4' />
                        Ajouter
                      </Button>
                    </div>
                    {missionValues.length > 0 && (
                      <div className='space-y-2 mt-3'>
                        {missionValues.map((value) => (
                          <div key={value.id} className='flex items-center justify-between p-3 rounded-lg border bg-muted/50'>
                            <div className='flex items-center gap-2'>
                              <div className='w-2 h-2 rounded-full bg-primary' />
                              <span>{value.value}</span>
                            </div>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => handleDeleteMissionValue(value.id)}
                              className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className='flex justify-end pt-4'>
                    <Button onClick={handleSaveMission} disabled={loading} className='gap-2'>
                      {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                      Enregistrer la mission
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TEAM TAB */}
            <TabsContent value='team' className='space-y-4'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2'>
                        <Users className='h-5 w-5' />
                        Membres de l'équipe
                      </CardTitle>
                      <CardDescription>
                        Gérez les membres affichés sur la page
                      </CardDescription>
                    </div>
                    <Dialog open={isTeamDialogOpen} onOpenChange={(open) => {
                      setIsTeamDialogOpen(open)
                      if (!open) {
                        setEditingTeamMember(null)
                        setTeamForm({ full_name: '', position_fr: '', bio_fr: '', email: '', linkedin_url: '', avatar_url: '' })
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className='gap-2'>
                          <Plus className='h-4 w-4' />
                          Ajouter un membre
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
                        <DialogHeader>
                          <DialogTitle>{editingTeamMember ? 'Modifier le membre' : 'Ajouter un membre'}</DialogTitle>
                          <DialogDescription>
                            {editingTeamMember ? 'Modifiez les informations du membre' : 'Ajoutez un nouveau membre de l\'équipe'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                          <div className='grid gap-2'>
                            <Label htmlFor='team-name'>Nom complet *</Label>
                            <Input
                              id='team-name'
                              placeholder='Nom et prénom'
                              value={teamForm.full_name}
                              onChange={(e) => setTeamForm(prev => ({ ...prev, full_name: e.target.value }))}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='team-position'>Poste *</Label>
                            <Input
                              id='team-position'
                              placeholder='Titre du poste'
                              value={teamForm.position_fr}
                              onChange={(e) => setTeamForm(prev => ({ ...prev, position_fr: e.target.value }))}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='team-bio'>Biographie</Label>
                            <Textarea
                              id='team-bio'
                              placeholder='Courte biographie...'
                              value={teamForm.bio_fr}
                              onChange={(e) => setTeamForm(prev => ({ ...prev, bio_fr: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='team-email'>Email</Label>
                            <Input
                              id='team-email'
                              type='email'
                              placeholder='email@canstory.app'
                              value={teamForm.email}
                              onChange={(e) => setTeamForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='team-linkedin'>LinkedIn</Label>
                            <Input
                              id='team-linkedin'
                              placeholder='https://linkedin.com/in/...'
                              value={teamForm.linkedin_url}
                              onChange={(e) => setTeamForm(prev => ({ ...prev, linkedin_url: e.target.value }))}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='team-avatar'>Photo</Label>
                            <div className='flex items-center gap-4'>
                              <Input
                                id='team-avatar'
                                type='file'
                                accept='image/*'
                                onChange={(e) => handleImageChange(e, 'team')}
                                className='flex-1'
                              />
                              {teamForm.avatar_url && (
                                <div className='relative w-16 h-16 rounded-full border overflow-hidden'>
                                  <img src={teamForm.avatar_url} alt='Avatar' className='w-full h-full object-cover' />
                                  <button
                                    onClick={() => setTeamForm(prev => ({ ...prev, avatar_url: '' }))}
                                    className='absolute top-0 right-0 p-0.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-80'
                                  >
                                    <X className='h-3 w-3' />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant='outline' onClick={() => setIsTeamDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleSaveTeamMember} disabled={loading}>
                            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            {editingTeamMember ? 'Modifier' : 'Ajouter'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {teamMembers.length === 0 ? (
                    <div className='text-center py-12 text-muted-foreground'>
                      <Users className='h-12 w-12 mx-auto mb-3 opacity-50' />
                      <p>Aucun membre d'équipe pour le moment</p>
                      <p className='text-sm'>Cliquez sur "Ajouter un membre" pour commencer</p>
                    </div>
                  ) : (
                    <div className='rounded-md border'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Membre</TableHead>
                            <TableHead>Poste</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className='text-right'>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className='flex items-center gap-3'>
                                  <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden'>
                                    {member.avatar_url ? (
                                      <img src={member.avatar_url} alt={member.full_name} className='w-full h-full object-cover' />
                                    ) : (
                                      <span className='text-sm font-medium'>{member.full_name.charAt(0)}</span>
                                    )}
                                  </div>
                                  <div>
                                    <div className='font-medium'>{member.full_name}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{member.position_fr}</TableCell>
                              <TableCell className='text-muted-foreground'>{member.email || '—'}</TableCell>
                              <TableCell>
                                <div className='flex items-center gap-2'>
                                  <Switch
                                    checked={member.is_active}
                                    onCheckedChange={() => handleToggleTeamMember(member.id)}
                                  />
                                  <Badge variant={member.is_active ? 'default' : 'secondary'}>
                                    {member.is_active ? 'Actif' : 'Inactif'}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className='text-right'>
                                <div className='flex items-center justify-end gap-2'>
                                  <Button
                                    size='sm'
                                    variant='ghost'
                                    onClick={() => handleEditTeamMember(member)}
                                    className='h-8 w-8 p-0'
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='ghost'
                                    onClick={() => handleDeleteTeamMember(member.id)}
                                    className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CONTACTS TAB */}
            <TabsContent value='contact' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Phone className='h-5 w-5' />
                    Informations de contact
                  </CardTitle>
                  <CardDescription>
                    Gérez les coordonnées et réseaux sociaux de l'organisation
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-6 md:grid-cols-2'>
                    <div className='grid gap-2'>
                      <Label htmlFor='contact-email' className='flex items-center gap-2'>
                        <Mail className='h-4 w-4' />
                        Email
                      </Label>
                      <Input
                        id='contact-email'
                        type='email'
                        placeholder='contact@canstory.app'
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='contact-phone' className='flex items-center gap-2'>
                        <Phone className='h-4 w-4' />
                        Téléphone
                      </Label>
                      <Input
                        id='contact-phone'
                        placeholder='+213 XX XX XX XX'
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className='grid gap-2'>
                    <Label htmlFor='contact-address' className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      Adresse
                    </Label>
                    <Textarea
                      id='contact-address'
                      placeholder="Adresse complète de l'organisation"
                      value={contactForm.address}
                      onChange={(e) => setContactForm(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  
                  <div className='pt-4'>
                    <Label className='text-base mb-4 block'>Réseaux sociaux</Label>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div className='grid gap-2'>
                        <Label htmlFor='contact-facebook' className='flex items-center gap-2'>
                          <Facebook className='h-4 w-4' />
                          Facebook
                        </Label>
                        <Input
                          id='contact-facebook'
                          placeholder='https://facebook.com/...'
                          value={contactForm.facebook}
                          onChange={(e) => setContactForm(prev => ({ ...prev, facebook: e.target.value }))}
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='contact-instagram' className='flex items-center gap-2'>
                          <Instagram className='h-4 w-4' />
                          Instagram
                        </Label>
                        <Input
                          id='contact-instagram'
                          placeholder='https://instagram.com/...'
                          value={contactForm.instagram}
                          onChange={(e) => setContactForm(prev => ({ ...prev, instagram: e.target.value }))}
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='contact-whatsapp' className='flex items-center gap-2'>
                          <MessageCircle className='h-4 w-4' />
                          WhatsApp
                        </Label>
                        <Input
                          id='contact-whatsapp'
                          placeholder='+213 XX XX XX XX'
                          value={contactForm.whatsapp}
                          onChange={(e) => setContactForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='contact-linkedin' className='flex items-center gap-2'>
                          <Linkedin className='h-4 w-4' />
                          LinkedIn
                        </Label>
                        <Input
                          id='contact-linkedin'
                          placeholder='https://linkedin.com/company/...'
                          value={contactForm.linkedin}
                          onChange={(e) => setContactForm(prev => ({ ...prev, linkedin: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className='flex justify-end pt-4'>
                    <Button onClick={handleSaveContacts} disabled={loading} className='gap-2'>
                      {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                      Enregistrer les contacts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
