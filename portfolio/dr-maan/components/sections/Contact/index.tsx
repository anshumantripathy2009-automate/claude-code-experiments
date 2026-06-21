'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import { waLink } from '@/lib/utils'
import clinic from '@/content/clinic.json'

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView   = useInView(sectionRef, { once: true, margin: '-10%' })

  const waLink2 = waLink(clinic.whatsapp, `Hi Dr. MaAn, I'd like directions to your clinic.`)

  return (
    <section
      ref={sectionRef}
      id="location"
      className="bg-navy-800 py-28 px-6 md:px-16 lg:px-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block text-gold/60 font-sans text-xs tracking-[0.3em] uppercase mb-4"
            >
              Find Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif font-light text-ivory text-headline"
            >
              Visit the Clinic
            </motion.h2>
          </div>
          <motion.a
            href={clinic.address.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-gold text-navy px-5 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-gold-dark transition-colors duration-300 shadow-gold w-fit"
          >
            Get Directions
            <ExternalLink size={13} />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 rounded-2xl overflow-hidden border border-ivory/5 aspect-[4/3] lg:aspect-auto lg:h-80"
          >
            <iframe
              src={`https://maps.google.com/maps?q=${clinic.address.geo.lat},${clinic.address.geo.lng}&z=16&output=embed`}
              width="100%"
              height="100%"
              loading="lazy"
              title={`Map to ${clinic.name}`}
              aria-label={`Google Map showing location of ${clinic.name}`}
              style={{ border: 0, filter: 'grayscale(40%) invert(90%) hue-rotate(180deg) brightness(0.85)' }}
            />
          </motion.div>

          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="bg-navy border border-ivory/5 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-gold" />
                </div>
                <div>
                  <p className="font-sans text-ivory/40 text-xs uppercase tracking-widest mb-1">Address</p>
                  <p className="font-sans text-ivory/80 text-sm leading-relaxed">
                    {clinic.address.street},<br />
                    {clinic.address.city}, {clinic.address.state}<br />
                    {clinic.address.pin}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-gold" />
                </div>
                <div>
                  <p className="font-sans text-ivory/40 text-xs uppercase tracking-widest mb-1">Phone</p>
                  <a
                    href={`tel:${clinic.phone}`}
                    className="font-sans text-ivory/80 text-sm hover:text-gold transition-colors duration-200"
                  >
                    {clinic.phone}
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-gold" />
                </div>
                <div>
                  <p className="font-sans text-ivory/40 text-xs uppercase tracking-widest mb-1">Email</p>
                  <a
                    href={`mailto:${clinic.email}`}
                    className="font-sans text-ivory/80 text-sm hover:text-gold transition-colors duration-200"
                  >
                    {clinic.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-navy border border-ivory/5 rounded-2xl p-6">
              <p className="font-sans text-ivory/40 text-xs uppercase tracking-widest mb-4">Clinic Hours</p>
              {clinic.hours.map((h) => (
                <div key={h.days} className="flex justify-between py-2.5 border-b border-ivory/5 last:border-0">
                  <span className="font-sans text-ivory/50 text-xs">{h.days}</span>
                  <span className="font-sans text-ivory text-xs font-medium">{h.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
