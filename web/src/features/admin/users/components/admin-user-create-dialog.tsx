import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useAdminUsersContext } from './admin-users-provider'
import { useCreateAdminUser } from '@/hooks/use-admin-users'
import { type CreateAdminUserPayload } from '@/services/admin-users.service'

const createUserSchema = z.object({
  full_name: z.string().min(3, 'Le nom complet est requis'),
  email: z.string().email('Adresse email invalide'),
  role: z.string().min(1, 'Veuillez sélectionner un rôle'),
  wilaya: z.string().min(1, 'La wilaya est requise'),
  commune: z.string().min(1, 'La commune est requise'),
  language: z.string().min(1, 'La langue est requise'),
  phone: z.string().optional(),
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
  is_active: z.boolean(),
  password: z.string().min(8, 'Minimum 8 caractères').optional(),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

const roleOptions = [
  { label: 'Super administrateur', value: 'superadmin' },
  { label: 'Administrateur', value: 'admin' },
]

const languageOptions = [
  { label: 'Français', value: 'fr' },
  { label: 'Arabe', value: 'ar' },
  { label: 'Anglais', value: 'en' },
]

export function AdminUserCreateDialog() {
  const { createDialogOpen, setCreateDialogOpen } = useAdminUsersContext()
  const { mutate, isPending } = useCreateAdminUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const defaultValues: CreateUserFormValues = {
    full_name: '',
    email: '',
    role: 'admin',
    wilaya: '',
    commune: '',
    language: 'fr',
    phone: '',
    avatar: undefined,
    is_active: true,
    password: '',
  }

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  })

  const updatePreview = (file?: File) => {
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
  }

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const resetAndClose = () => {
    form.reset(defaultValues)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    updatePreview(undefined)
    setCreateDialogOpen(false)
  }

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const onSubmit = async (values: CreateUserFormValues) => {
    const {
      avatar,
      full_name,
      email,
      role,
      wilaya,
      commune,
      language,
      phone,
      is_active,
      password,
    } = values

    let avatarPayload: CreateAdminUserPayload['avatar']
    if (avatar) {
      const data = await fileToBase64(avatar)
      avatarPayload = {
        data,
        name: avatar.name,
        type: avatar.type,
      }
    }

    const payload: CreateAdminUserPayload = {
      email: email.trim(),
      full_name: full_name.trim(),
      role,
      wilaya: wilaya.trim(),
      commune: commune.trim(),
      language,
      phone: phone ? phone.trim() : undefined,
      is_active,
      password: password ? password : undefined,
      avatar: avatarPayload,
    }

    mutate(payload, {
      onSuccess: () => {
        resetAndClose()
      },
    })
  }

  return (
    <Dialog
      open={createDialogOpen}
      onOpenChange={(open) => {
        if (open) {
          setCreateDialogOpen(true)
        } else {
          resetAndClose()
        }
      }}
    >
      <DialogContent className='sm:max-w-2xl mt-4'>
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte administrateur. Un mot de passe temporaire sera généré automatiquement si
            vous n'en définissez pas. Pour les autres rôles, utilisez la page Annuaire.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='full_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex: Abdelghani' {...field} />
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
                      <Input placeholder='Ex: Alger' {...field} />
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
                      <Input placeholder='Ex: Hydra' {...field} />
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
                name='avatar'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar (optionnel)</FormLabel>
                    <FormControl>
                      <div className='flex items-center gap-4'>
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
                            updatePreview(file)
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
                            A
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
                          {field.value && (
                            <Button
                              type='button'
                              variant='ghost'
                              onClick={() => {
                                field.onChange(undefined)
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = ''
                                }
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
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border px-4 py-3'>
                    <div>
                      <FormLabel>Activer le compte</FormLabel>
                      <p className='text-sm text-muted-foreground'>Permet l'accès immédiat à la plateforme.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe (optionnel)</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='Laisser vide pour générer' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex items-center justify-end gap-2'>
              <Button type='button' variant='outline' onClick={resetAndClose} disabled={isPending}>
                Annuler
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
