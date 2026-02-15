'use client'

import { motion } from 'framer-motion'

export function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orb 1 - Purple */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 dark:from-purple-600/20 dark:to-pink-600/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ top: '10%', right: '10%' }}
      />

      {/* Orb 2 - Blue */}
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/25 to-cyan-500/25 dark:from-blue-600/15 dark:to-cyan-600/15 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        style={{ bottom: '20%', left: '15%' }}
      />

      {/* Orb 3 - Pink */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 dark:from-pink-600/15 dark:to-purple-600/15 blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -60, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        style={{ top: '50%', left: '50%' }}
      />

      {/* Orb 4 - Accent */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 dark:from-violet-600/15 dark:to-fuchsia-600/15 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 50, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
        style={{ top: '30%', right: '30%' }}
      />
    </div>
  )
}
