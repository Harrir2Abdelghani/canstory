import { useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='border-none shadow-2xl backdrop-blur-md bg-white/90 dark:bg-zinc-900/90'>
        <CardHeader className='space-y-3 pb-8 text-center'>
          <CardTitle className='text-3xl font-bold tracking-tight text-primary'>
            Connexion Admin
          </CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            Entrez vos identifiants pour accéder au tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent className='pb-8'>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
