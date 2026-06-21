'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Zap, Smile, Activity, AlignCenter, Heart, Sparkles } from 'lucide-react'
import { waLink } from '@/lib/utils'
import clinic from '@/content/clinic.json'

gsap.registerPlugin(ScrollTrigger)

const ICONS: Record<string, React.ReactNode> = {
  implant:   <Zap size={28} />,
  smile:     <Smile size={28} />,
  root:      <Activity size={28} />,
  braces:    <AlignCenter size={28} />,
  kids:      <Heart size={28} />,
  whitening: <Sparkles size={28} />,
}

const cardVariant = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef   = useRef<HTMLDivElement>(null)
  const headRef    = useRef<HTMLDivElement>(null)
  const isInView   = useInView(headRef, { once: true, margin: '-15%' })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      const section = sectionRef.current
      const track   = trackRef.current
      if (!section || !track) return

      const ctx = gsap.context(() => {
        const totalScroll = () => track.scrollWidth - window.innerWidth + 64

        gsap.to(track, {
          x: () => -totalScroll(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            pinSpacing: true,
            scrub: 1.2,
            start: 'top top',
            end: () => `+=${totalScroll()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
      }, section)

      return () => ctx.revert()
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="services"
      className="bg-navy relative overflow-hidden"
    >
      {/* Header row — always visible */}
      <div ref={headRef} className="px-6 md:px-16 lg:px-24 pt-24 pb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-gold/60 font-sans text-xs tracking-[0.3em] uppercase mb-4"
          >
            What We Offer
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-light text-ivory text-headline"
          >
            Treatments Built<br />
            <span className="text-gold">for Real Life</span>
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-sans text-ivory/40 text-sm leading-relaxed max-w-xs"
        >
          Every procedure at Dr. MaAn's is performed with Swiss-grade instruments
          and backed by over 15 years of clinical excellence.
        </motion.p>
      </div>

      {/* Cards track */}
      <div
        ref={trackRef}
        className="flex flex-col gap-4 px-6 pb-24 lg:flex-row lg:items-stretch lg:gap-6 lg:px-16 lg:pb-24 lg:w-max"
      >
        {clinic.services.map((service, i) => {
          const wa = waLink(clinic.whatsapp, `Hi Dr. MaAn, I'd like to book a consultation for ${service.name}.`)
          return (
            <motion.a
              key={service.slug}
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              custom={i}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariant}
              className="group service-card relative bg-navy-800 border border-ivory/5 rounded-2xl p-8 flex flex-col gap-6 hover:border-gold/30 transition-all duration-500 hover:shadow-gold lg:w-[340px] lg:flex-shrink-0"
            >
              {/* Number */}
              <span className="absolute top-6 right-6 font-serif text-ivory/10 text-3xl font-light">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy transition-all duration-300">
                {ICONS[service.icon]}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-serif text-ivory font-light text-xl mb-2 group-hover:text-gold transition-colors duration-300">
                  {service.name}
                </h3>
                <p className="font-sans text-ivory/40 text-sm leading-relaxed">
                  {service.shortDesc}
                </p>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-gold/60 group-hover:text-gold text-sm font-sans font-medium transition-colors duration-300">
                Book this treatment
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </motion.a>
          )
        })}
      </div>
    </section>
  )
}
