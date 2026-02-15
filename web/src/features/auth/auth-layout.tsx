"use client"

import { useCanstoryLogo } from '../landing/hooks/use-canstory-logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const logoSources = useCanstoryLogo()

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900'>
      {/* Animated Background Orbs */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-400/30 blur-3xl animate-pulse' style={{ animationDuration: '4s' }}></div>
        <div className='absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-pink-400/20 blur-3xl animate-pulse' style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className='absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-violet-400/25 blur-3xl animate-pulse' style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className='absolute h-1 w-1 rounded-full bg-purple-400/40'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Logo in Top Left */}
      <div className='absolute top-6 left-6 z-10 flex items-center gap-1'>
        <div className='relative h-10 w-10'>
          <img
            src={logoSources.light}
            alt='Canstory logo'
            className='block h-full w-full object-contain dark:hidden'
          />
          <img
            src={logoSources.dark}
            alt='Canstory logo'
            className='hidden h-full w-full object-contain dark:block drop-shadow-[0_4px_16px_rgba(125,90,180,0.45)]'
            aria-hidden='true'
          />
        </div>
        <h1 className='text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400'>
          Canstory
        </h1>
      </div>

      {/* Main Content */}
      <div className='relative z-10 flex min-h-screen items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          {children}
        </div>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          50% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
          }
        }
      `}</style>
    </div>
  )
}
