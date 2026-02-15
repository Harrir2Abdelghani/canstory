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
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Please enter your password'),
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
      console.log('[AUTH] Attempting login with:', { email: data.email, apiUrl })

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      console.log('[AUTH] Response status:', response.status, response.statusText)

      const result = await response.json()
      console.log('[AUTH] Response data:', result)

      if (!response.ok) {
        setIsLoading(false)
        console.error('[AUTH] Login failed:', result.error)
        toast.error(result.error || 'Invalid credentials')
        return
      }

      console.log('[AUTH] Login successful for user:', result.user.email)

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
      toast.success('Signed in successfully!')

      console.log('[AUTH] Redirecting to:', redirectTo || '/overview')
      const targetPath = redirectTo || '/overview'
      navigate({ to: targetPath, replace: true })
    } catch (error) {
      setIsLoading(false)
      console.error('[AUTH] Error during sign in:', error)
      toast.error('An error occurred during sign in')
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
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='admin' {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
