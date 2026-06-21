'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, ChevronDown } from 'lucide-react'
import { waLink } from '@/lib/utils'
import clinic from '@/content/clinic.json'

const HEADLINE = 'Smiles, Engineered with Precision.'
const WORDS    = HEADLINE.split(' ')

const CREDENTIALS = [
  { value: '15+', label: 'Years Experience' },
  { value: '8K+', label: 'Smiles Restored' },
  { value: '99%', label: 'Patient Satisfaction' },
]

/* Per-word reveal variant */
const wordVariant = {
  hidden: { y: '110%', opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.85 + i * 0.07,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function HeroContent() {
  const waBooking   = waLink(clinic.whatsapp, `Hi Dr. MaAn, I'd like to book a free consultation.`)
  const waWhatsApp  = waLink(clinic.whatsapp, `Hi Dr. MaAn, I have a question.`)

  return (
    <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-16 lg:px-24 pt-28 pb-20 max-w-3xl">

      {/* Specialty pill */}
      <motion.div
        custom={0.5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-center gap-2 mb-8"
      >
        <span className="inline-flex items-center gap-2 border border-gold/30 bg-gold/5 backdrop-blur-sm rounded-full px-4 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="font-sans text-gold/80 text-xs tracking-[0.2em] uppercase font-medium">
            Superspeciality Dental & Implant Care
          </span>
        </span>
      </motion.div>

      {/* Headline — word-by-word reveal */}
      <h1 className="font-serif font-light leading-[1.05] mb-6" style={{ fontSize: 'clamp(2.6rem, 6vw, 5.5rem)' }}>
        <span className="sr-only">{HEADLINE}</span>
        <span aria-hidden="true" className="flex flex-wrap gap-x-[0.28em]">
          {WORDS.map((word, i) => (
            <span key={i} className="overflow-hidden inline-block">
              <motion.span
                className="inline-block text-ivory"
                custom={i}
                initial="hidden"
                animate="visible"
                variants={wordVariant}
                style={{
                  color: word === 'Precision.' ? 'var(--gold)' : undefined,
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </span>
      </h1>

      {/* Sub-headline */}
      <motion.p
        custom={1.55}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="font-sans text-ivory/50 text-base md:text-lg leading-relaxed mb-10 max-w-xl"
      >
        Bhubaneswar&apos;s most advanced dental studio — where Swiss engineering,
        ceramic artistry, and gentle care meet to give you a smile that lasts a lifetime.
      </motion.p>

      {/* CTAs */}
      <motion.div
        custom={1.75}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-wrap items-center gap-4 mb-14"
      >
        <a
          href={waBooking}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 bg-gold text-navy px-7 py-3.5 rounded-full font-sans font-semibold text-sm tracking-wide hover:bg-gold-dark transition-all duration-300 shadow-gold"
        >
          Book Free Consultation
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </a>
        <a
          href={waWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 border border-ivory/15 text-ivory/70 hover:text-ivory hover:border-ivory/30 px-7 py-3.5 rounded-full font-sans font-medium text-sm tracking-wide transition-all duration-300 backdrop-blur-sm"
        >
          <MessageCircle size={15} className="text-green-400 group-hover:scale-110 transition-transform duration-200" />
          WhatsApp Dr. MaAn
        </a>
      </motion.div>

      {/* Credentials strip */}
      <motion.div
        custom={2.0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-center gap-8"
      >
        {CREDENTIALS.map(({ value, label }, i) => (
          <div key={i} className="flex flex-col">
            <span className="font-serif text-gold text-2xl md:text-3xl font-light leading-none">{value}</span>
            <span className="font-sans text-ivory/35 text-[10px] tracking-[0.15em] uppercase mt-1">{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
