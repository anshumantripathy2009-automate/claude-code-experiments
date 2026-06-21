'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { waLink } from '@/lib/utils'
import clinic from '@/content/clinic.json'

export function Doctor() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView   = useInView(sectionRef, { once: true, margin: '-10%' })

  const wa = waLink(clinic.whatsapp, `Hi Dr. MaAn, I'd like to book a consultation.`)

  return (
    <section
      ref={sectionRef}
      id="doctor"
      className="bg-navy relative overflow-hidden py-24 lg:py-0"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy to-navy-700 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:min-h-screen lg:items-center">

        {/* Image column */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:h-full lg:min-h-screen overflow-hidden"
        >
          <div className="relative h-[420px] lg:h-full mx-6 lg:mx-0 rounded-2xl lg:rounded-none overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80"
              alt="Dr. MaAn — Specialist in Implantology & Aesthetic Dentistry"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Gradient overlay bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />

            {/* Floating credential badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="absolute bottom-6 left-6 right-6 lg:right-auto bg-navy/90 backdrop-blur-xl border border-gold/20 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <div>
                <p className="font-sans text-ivory text-sm font-semibold">{clinic.doctor.specialization}</p>
                <p className="font-sans text-ivory/40 text-xs">{clinic.doctor.experience} clinical experience</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content column */}
        <div className="px-6 py-12 lg:px-16 lg:py-24 flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block text-gold/60 font-sans text-xs tracking-[0.3em] uppercase mb-4"
          >
            Meet Your Doctor
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-light text-ivory text-headline mb-2"
          >
            {clinic.doctor.name}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="font-sans text-gold text-sm tracking-wide mb-8"
          >
            {clinic.doctor.title}
          </motion.p>

          {/* Bio */}
          {clinic.doctor.bio.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.45 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-sans text-ivory/55 text-sm leading-relaxed mb-4"
            >
              {paragraph}
            </motion.p>
          ))}

          {/* Pull quote */}
          <motion.blockquote
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="border-l-2 border-gold pl-5 mt-6 mb-8"
          >
            <p className="font-serif italic text-ivory/70 text-lg font-light leading-snug">
              {clinic.doctor.pullQuote}
            </p>
          </motion.blockquote>

          {/* Credentials */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-2.5 mb-10"
          >
            {clinic.doctor.credentials.map((cred) => (
              <li key={cred} className="flex items-center gap-3 font-sans text-ivory/50 text-sm">
                <CheckCircle2 size={14} className="text-gold flex-shrink-0" />
                {cred}
              </li>
            ))}
          </motion.ul>

          <motion.a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="inline-flex items-center gap-2.5 bg-gold text-navy px-7 py-3.5 rounded-full font-sans font-semibold text-sm tracking-wide hover:bg-gold-dark transition-colors duration-300 shadow-gold w-fit"
          >
            Book a Consultation
          </motion.a>
        </div>
      </div>
    </section>
  )
}
