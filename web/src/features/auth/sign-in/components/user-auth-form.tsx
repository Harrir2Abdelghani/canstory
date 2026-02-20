import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide'),
  password: z
    .string()
    .min(1, 'Veuillez entrer votre mot de passe'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const apiUrl = origin ? `${origin}/api/auth/sign-in` : '/api/auth/sign-in'
      console.log('[AUTH] Tentative de connexion avec:', { email: data.email, apiUrl })

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setIsLoading(false)
        console.error('[AUTH] Échec de la connexion:', result.error)
        toast.error(result.error || 'Identifiants invalides')
        return
      }

      const normalizedUser = {
        accountNo: result.user.id,
        email: result.user.email,
        role: [result.user.role || 'admin'],
        exp: Date.now() + 24 * 60 * 60 * 1000,
        fullName: result.user.full_name ?? null,
        avatarUrl: result.user.avatar_url ?? null,
      }

      auth.setUser(normalizedUser)

      setIsLoading(false)
      toast.success('Connexion réussie !')

      const targetPath = redirectTo || '/overview'
      navigate({ to: targetPath, replace: true })
    } catch (error) {
      setIsLoading(false)
      console.error('[AUTH] Erreur lors de la connexion:', error)
      toast.error('Une erreur est survenue lors de la connexion')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='nom@exemple.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity'
              >
                Mot de passe oublié ?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-16 h-11 bg-primary hover:bg-primary/90 rounded-xl shadow-lg transition-all active:scale-[0.98]' disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='animate-spin mr-2 h-4 w-4' />
          ) : (
            <LogIn className='mr-2 h-4 w-4' />
          )}
          Se connecter
        </Button>
      </form>
    </Form>
  )
}
