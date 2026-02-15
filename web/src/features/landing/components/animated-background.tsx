'use client'

import { motion } from 'framer-motion'
import { ParticleSystem } from './particle-system'
import { FloatingOrbs } from './floating-orbs'

interface AnimatedBackgroundProps {
  variant?: 'hero' | 'section' | 'minimal'
  showParticles?: boolean
  showOrbs?: boolean
  className?: string
}

export function AnimatedBackground({
  variant = 'hero',
  showParticles = true,
  showOrbs = true,
  className = '',
}: AnimatedBackgroundProps) {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: variant === 'hero' ? '40px 40px' : '32px 32px',
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent dark:via-primary/10" />

      {/* Floating Orbs */}
      {showOrbs && <FloatingOrbs />}

      {/* Particle System */}
      {showParticles && variant === 'hero' && <ParticleSystem particleCount={60} />}
      {showParticles && variant === 'section' && <ParticleSystem particleCount={30} />}

      {/* Animated Gradient Lines */}
      {variant === 'hero' && (
        <>
          <motion.div
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleX: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleX: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </>
      )}
    </div>
  )
}
