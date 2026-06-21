'use client'

import { motion } from 'framer-motion'

export function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.6, duration: 0.8 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
    >
      {/* Mouse icon */}
      <div className="w-5 h-8 rounded-full border border-ivory/20 flex items-start justify-center pt-1.5">
        <motion.div
          className="w-0.5 h-1.5 bg-gold rounded-full"
          animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <span className="font-sans text-ivory/25 text-[9px] tracking-[0.3em] uppercase">Scroll</span>
    </motion.div>
  )
}
