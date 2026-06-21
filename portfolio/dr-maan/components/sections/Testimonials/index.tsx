'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  { name: 'Priya Sahoo',     initials: 'PS', treatment: 'Smile Design & Veneers',    quote: 'Dr. MaAn completely transformed my smile. I went from hiding my teeth in photos to confidently smiling in every frame. Absolutely worth every rupee.' },
  { name: 'Rahul Mohanty',   initials: 'RM', treatment: 'Dental Implants',            quote: 'Lost a front tooth in an accident. The implant she placed is indistinguishable from my natural teeth — even my family can\'t tell the difference.' },
  { name: 'Suchitra Panda',  initials: 'SP', treatment: 'Pediatric Dentistry',        quote: 'My 8-year-old was terrified of dentists. After one visit to Dr. MaAn\'s clinic, she actually asks when she can go back. The staff is incredibly gentle.' },
  { name: 'Akhil Kumar',     initials: 'AK', treatment: 'Root Canal Treatment',       quote: 'Had a root canal done here. Zero pain during the procedure, zero discomfort after. Best dental experience I\'ve ever had in 30 years.' },
  { name: 'Ananya Rath',     initials: 'AR', treatment: 'Invisible Aligners',         quote: 'My teeth were completely straight in 14 months with clear aligners. I wore them throughout college without anyone noticing. Results are stunning.' },
  { name: 'Debasmita Nayak', initials: 'DN', treatment: 'Laser Teeth Whitening',      quote: 'Laser whitening gave me 7 shades brighter teeth in a single session. My colleagues thought I\'d had veneers. Can\'t stop smiling honestly.' },
  { name: 'Sourav Biswal',   initials: 'SB', treatment: 'Full Mouth Rehabilitation',  quote: 'From the equipment to the waiting area to the doctor herself — everything feels premium. This is not your average dental clinic, not by a mile.' },
  { name: 'Meera Tripathy',  initials: 'MT', treatment: 'Dental Implants',            quote: 'Dr. MaAn explained every step of my implant procedure in detail. I felt informed, cared for, and completely at ease throughout my treatment.' },
]

const ROW_A = TESTIMONIALS
const ROW_B = [...TESTIMONIALS].reverse()

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="min-w-[320px] max-w-[320px] bg-navy border border-ivory/5 rounded-2xl p-6 mx-3 flex flex-col gap-4 flex-shrink-0">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={12} className="fill-gold text-gold" />
        ))}
      </div>
      <p className="font-sans text-ivory/55 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3 pt-2 border-t border-ivory/5">
        <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
          <span className="text-gold text-xs font-semibold">{t.initials}</span>
        </div>
        <div>
          <p className="text-ivory/80 text-sm font-sans font-semibold">{t.name}</p>
          <p className="text-ivory/30 text-xs font-sans">{t.treatment}</p>
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView   = useInView(sectionRef, { once: true, margin: '-10%' })

  return (
    <section ref={sectionRef} id="transformations" className="bg-navy-800 py-28 overflow-hidden">
      <div className="px-6 md:px-16 lg:px-24 mb-16 max-w-7xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-block text-gold/60 font-sans text-xs tracking-[0.3em] uppercase mb-4"
        >
          Patient Stories
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif font-light text-ivory text-headline"
        >
          What Our Patients<br />
          <span className="text-gold">Say About Us</span>
        </motion.h2>
      </div>

      {/* Row A — left to right */}
      <div className="relative mb-4 overflow-hidden">
        <div className="flex animate-marquee" style={{ width: 'max-content' }}>
          {[...ROW_A, ...ROW_A].map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>

      {/* Row B — right to left */}
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee-rev" style={{ width: 'max-content' }}>
          {[...ROW_B, ...ROW_B].map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
