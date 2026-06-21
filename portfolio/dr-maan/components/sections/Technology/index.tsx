'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useCounterAnimation } from '@/hooks/useCounterAnimation'
import clinic from '@/content/clinic.json'

const STATS = [
  { value: 5000, suffix: '+', label: 'Patients Treated',       desc: 'and counting' },
  { value: 15,   suffix: '+', label: 'Years of Experience',    desc: 'since 2009' },
  { value: 100,  suffix: '%', label: 'Sterilization Standard', desc: 'hospital-grade, every time' },
]

const TECH_ICONS: Record<string, string> = {
  'Digital OPG / X-Ray':  'M3 9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9-4v2m0 8v2M7 9h.01M17 9h.01',
  'CBCT 3D Scanner':       'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  'Intraoral Camera':      'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
  'Class B Autoclave':     'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
}

function StatCounter({ value, suffix, label, desc, trigger }: typeof STATS[0] & { trigger: boolean }) {
  const count = useCounterAnimation(value, 1800, trigger)
  return (
    <div className="flex flex-col items-center text-center">
      <span className="font-serif text-gold text-[clamp(3rem,6vw,5rem)] font-light leading-none">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="font-sans text-ivory text-sm font-medium mt-2">{label}</span>
      <span className="font-sans text-ivory/30 text-xs mt-1">{desc}</span>
    </div>
  )
}

export function Technology() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView   = useInView(sectionRef, { once: true, margin: '-10%' })

  return (
    <section
      ref={sectionRef}
      id="technology"
      className="bg-navy-800 relative overflow-hidden py-28 px-6 md:px-16 lg:px-24"
    >
      {/* Accent orb */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-block text-gold/60 font-sans text-xs tracking-[0.3em] uppercase mb-4"
        >
          Clinic Technology
        </motion.span>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-light text-ivory text-headline max-w-lg"
          >
            Powered by the Latest<br />
            <span className="text-gold">in Dental Science</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-sans text-ivory/40 text-sm leading-relaxed max-w-xs"
          >
            We invest in the best equipment so you get the most accurate
            diagnosis and the most comfortable treatment possible.
          </motion.p>
        </div>

        {/* Technology grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-24">
          {clinic.technology.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative border border-ivory/5 bg-navy rounded-2xl p-7 overflow-hidden hover:border-gold/20 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="mb-5">
                  <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={TECH_ICONS[tech.name] ?? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} />
                  </svg>
                </div>
                <h3 className="font-sans text-ivory font-medium text-base mb-1">{tech.name}</h3>
                <p className="font-sans text-ivory/35 text-sm leading-relaxed">{tech.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 border-t border-ivory/5 pt-16">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
            >
              <StatCounter {...stat} trigger={isInView} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
