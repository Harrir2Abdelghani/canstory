import { useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='border-none shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80'>
        <CardHeader className='space-y-3 pb-8'>
          <CardTitle className='text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400'>
            Admin Sign In
          </CardTitle>
          <CardDescription className='text-sm text-gray-600 dark:text-gray-400'>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className='pb-8'>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
