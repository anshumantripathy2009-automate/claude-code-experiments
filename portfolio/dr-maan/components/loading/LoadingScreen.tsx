'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate asset preload progress
    let current = 0
    const step = () => {
      current += Math.random() * 18 + 4
      if (current >= 100) {
        setProgress(100)
        setTimeout(() => setVisible(false), 600)
      } else {
        setProgress(Math.min(current, 99))
        setTimeout(step, 80 + Math.random() * 80)
      }
    }
    const id = setTimeout(step, 200)
    return () => clearTimeout(id)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="loading-screen"
          className="fixed inset-0 z-[99999] bg-navy flex flex-col items-center justify-center gap-10"
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* Brand mark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            <p className="font-serif text-gold/60 text-xs tracking-[0.3em] uppercase mb-3">
              Superspeciality Dental
            </p>
            <h1 className="font-serif text-ivory text-5xl md:text-6xl font-light tracking-tight">
              Dr. MaAn&apos;s
            </h1>
          </motion.div>

          {/* Progress bar */}
          <div className="w-48 h-px bg-ivory/10 relative overflow-hidden rounded-full">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gold rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Progress number */}
          <motion.span
            className="font-sans text-gold/40 text-xs tabular-nums"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {Math.round(progress)}%
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
