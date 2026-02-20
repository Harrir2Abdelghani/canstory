"use client"

import { useCanstoryLogo } from '../landing/hooks/use-canstory-logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const logoSources = useCanstoryLogo()

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-[#fafafa] dark:bg-[#07050e]'>
      {/* Professional Tech Background */}
      <div className='absolute inset-0 z-0 pointer-events-none'>
        {/* Persistent Theme Glows */}
        <div className='absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] animate-pulse duration-[8s]' />
        <div className='absolute top-[20%] -right-[5%] w-[35%] h-[35%] rounded-full bg-indigo-500/10 blur-[80px] animate-pulse duration-[10s] delay-700' />
        <div className='absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse duration-[12s] delay-1000' />

        {/* Dynamic Dot Pattern (Visible & Animated) */}
        <div className='absolute inset-0 dot-pattern opacity-[0.6] dark:opacity-[0.3]' />

        {/* Floating Technical Particles */}
        <div className='absolute inset-0'>
           {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className='absolute rounded-full bg-purple-500/20 blur-[1px] particle-float'
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                animationDuration: `${10 + (i % 10)}s`,
                animationDelay: `-${i * 0.7}s`,
              }}
            />
          ))}
        </div>

        {/* Subtle Brand Scanning Beams */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='beam beam-1' />
          <div className='beam beam-2' />
        </div>

        {/* Grainy Texture for Premium Feel */}
        <div className='absolute inset-0 opacity-[0.03] mix-blend-overlay' style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      </div>

      {/* Logo Section */}
      <div className='absolute top-3 left-4 z-20 flex items-center gap-2'>
        <div className='relative h-9 w-9'>
          <img
            src={logoSources.light}
            alt='Canstory logo'
            className='block h-full w-full object-contain dark:hidden'
          />
          <img
            src={logoSources.dark}
            alt='Canstory logo'
            className='hidden h-full w-full object-contain dark:block drop-shadow-[0_0_12px_rgba(125,90,180,0.4)]'
            aria-hidden='true'
          />
        </div>
        <h1 className='text-xl font-bold tracking-tight text-slate-800 dark:text-white/90'>
          Canstory
        </h1>
      </div>

      {/* Main Container */}
      <div className='relative z-10 flex min-h-screen items-center justify-center p-6'>
        <div className='w-full max-w-md'>
          {children}
        </div>
      </div>

      <style>{`
        .dot-pattern {
          background-image: radial-gradient(rgba(125, 90, 180, 0.25) 1.5px, transparent 1.5px);
          background-size: 32px 32px;
          animation: slide-bg 100s linear infinite;
        }

        @keyframes slide-bg {
          from { background-position: 0 0; }
          to { background-position: 1000px 1000px; }
        }

        .particle-float {
          animation: float-up linear infinite;
        }

        @keyframes float-up {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-10vh) translateX(40px); opacity: 0; }
        }

        .beam {
          position: absolute;
          width: 150vw;
          height: 100vh;
          top: -25%;
          left: -25%;
          background: linear-gradient(90deg, transparent, rgba(125, 90, 180, 0.05), transparent);
          transform: rotate(-35deg);
        }

        .beam-1 { animation: sweep 18s linear infinite; }
        .beam-2 { animation: sweep 22s linear infinite; animation-delay: 4s; }

        @keyframes sweep {
          0% { transform: rotate(-35deg) translateX(-100%); }
          100% { transform: rotate(-35deg) translateX(100%); }
        }
      `}</style>
    </div>
  )
}
