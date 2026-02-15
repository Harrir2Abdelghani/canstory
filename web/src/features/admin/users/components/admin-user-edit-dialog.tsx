import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useUpdateAdminUser } from '@/hooks/use-admin-users'
import { useAdminUsersContext } from './admin-users-provider'

const editUserSchema = z.object({
  full_name: z.string().min(3, 'Le nom complet est requis'),
  email: z.string().email('Adresse email invalide'),
  role: z.string().min(1, 'Veuillez sélectionner un rôle'),
  wilaya: z.string().min(1, 'La wilaya est requise'),
  commune: z.string().min(1, 'La commune est requise'),
  language: z.string().min(1, 'La langue est requise'),
  phone: z.string().optional(),
  is_active: z.boolean(),
  avatar: z
    .any()
    .refine((file) => file === undefined || file instanceof File, 'Fichier image invalide')
    .refine(
      (file) => file === undefined || file.size <= 5 * 1024 * 1024,
      'Image trop volumineuse (5 Mo maximum)'
    )
    .refine(
      (file) =>
        file === undefined ||
        ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type),
      'Format non supporté'
    )
    .optional(),
})

type EditUserFormData = z.infer<typeof editUserSchema>

const roleOptions = [
  { label: 'Super administrateur', value: 'superadmin' },
  { label: 'Administrateur', value: 'admin' },
  { label: 'Médecin', value: 'doctor' },
  { label: 'Pharmacie', value: 'pharmacy' },
  { label: 'Association', value: 'association' },
  { label: 'Centre de cancer', value: 'cancer_center' },
  { label: 'Laboratoire', value: 'laboratory' },
  { label: 'Patient', value: 'patient' },
]

const languageOptions = [
  { label: 'Français', value: 'fr' },
  { label: 'Arabe', value: 'ar' },
  { label: 'Anglais', value: 'en' },
]

export function AdminUserEditDialog() {
  const {
    editingUser,
    setEditingUser,
    setEditDialogOpen,
    editDialogOpen,
  } = useAdminUsersContext()
  const { mutate: updateUser, isPending } = useUpdateAdminUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: '',
      email: '',
      role: 'patient',
      wilaya: '',
      commune: '',
      language: 'fr',
      phone: '',
      is_active: true,
      avatar: undefined,
    },
  })

  useEffect(() => {
    if (editingUser) {
      form.reset({
        full_name: editingUser.full_name,
        email: editingUser.email,
        role: editingUser.role,
        wilaya: editingUser.wilaya || '',
        commune: editingUser.commune || '',
        language: (editingUser.language as string) || 'fr',
        phone: editingUser.phone || '',
        is_active: editingUser.is_active === true,
        avatar: undefined,
      })
      setAvatarPreview(editingUser.avatar_url ?? null)
      setRemoveAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [editingUser, form])

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  if (!editingUser) {
    return null
  }

  const closeDialog = () => {
    setEditDialogOpen(false)
    setEditingUser(null)
  }

  const updatePreview = (file?: File) => {
    setAvatarPreview((prev) => {
      if (prev && prev !== editingUser.avatar_url) {
        URL.revokeObjectURL(prev)
      }
      return file ? URL.createObjectURL(file) : editingUser.avatar_url ?? null
    })
  }

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const onSubmit = async (values: EditUserFormData) => {
    const payload: any = {
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      role: values.role,
      wilaya: values.wilaya.trim(),
      commune: values.commune.trim(),
      language: values.language,
      phone: values.phone ? values.phone.trim() : null,
      is_active: values.is_active,
    }

    if (removeAvatar) {
      payload.avatar_url = null
    }

    if (values.avatar) {
      const data = await fileToBase64(values.avatar)
      payload.avatar = {
        data,
        name: values.avatar.name,
        type: values.avatar.type,
      }
    }

    updateUser(
      {
        userId: editingUser.id,
        payload,
      },
      {
        onSuccess: () => {
          closeDialog()
        },
      }
    )
  }

  return (
    <Dialog
      open={editDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog()
        } else {
          setEditDialogOpen(true)
        }
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Modifier l’utilisateur</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations du compte sans affecter les autres utilisateurs.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='full_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder='Nom complet' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='utilisateur@canstory.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Sélectionner un rôle' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='language'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir la langue' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languageOptions.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='wilaya'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wilaya</FormLabel>
                    <FormControl>
                      <Input placeholder='Wilaya' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='commune'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commune</FormLabel>
                    <FormControl>
                      <Input placeholder='Commune' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder='+213 650 00 00 00' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border px-4 py-3'>
                    <div>
                      <FormLabel>Compte actif</FormLabel>
                      <p className='text-sm text-muted-foreground'>Contrôle l’accès de l’utilisateur.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='avatar'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar (optionnel)</FormLabel>
                  <FormControl>
                    <div className='flex flex-wrap items-center gap-4'>
                      <input
                        ref={(node) => {
                          fileInputRef.current = node ?? null
                          field.ref(node)
                        }}
                        type='file'
                        accept='image/png,image/jpeg,image/webp,image/gif'
                        className='hidden'
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          field.onChange(file)
                          if (file) {
                            updatePreview(file)
                            setRemoveAvatar(false)
                          }
                        }}
                      />
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt='Prévisualisation avatar'
                          className='h-12 w-12 rounded-full object-cover'
                        />
                      ) : (
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground'>
                          {editingUser.full_name.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                      )}
                      <div className='flex flex-wrap gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isPending}
                        >
                          {field.value ? 'Changer' : 'Téléverser'}
                        </Button>
                        {(field.value || editingUser.avatar_url) && (
                          <Button
                            type='button'
                            variant='ghost'
                            onClick={() => {
                              field.onChange(undefined)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ''
                              }
                              setRemoveAvatar(true)
                              updatePreview(undefined)
                            }}
                            disabled={isPending}
                          >
                            Retirer
                          </Button>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex items-center justify-end gap-2'>
              <Button type='button' variant='outline' onClick={closeDialog} disabled={isPending}>
                Annuler
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
