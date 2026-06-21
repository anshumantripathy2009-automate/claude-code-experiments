'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react'
import { waLink } from '@/lib/utils'
import clinic from '@/content/clinic.json'

const schema = z.object({
  name:    z.string().min(2, 'Please enter your name'),
  phone:   z.string().min(10, 'Enter a valid 10-digit number'),
  service: z.string().min(1, 'Select a service'),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function Booking() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView   = useInView(sectionRef, { once: true, margin: '-10%' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setStatus('sending')
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, source: 'dr-maan-website', timestamp: new Date().toISOString() }),
        })
      }
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const waDirectLink = waLink(
    clinic.whatsapp,
    `Hi Dr. MaAn, I'd like to book a consultation. My name is [Name] and I'm interested in [Service].`
  )

  const inputClass = 'w-full bg-navy-800 border border-ivory/10 rounded-xl px-4 py-3.5 font-sans text-ivory text-sm placeholder:text-ivory/25 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300'

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="bg-navy relative overflow-hidden py-28 px-6 md:px-16 lg:px-24"
    >
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — headline + hours */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block text-gold/60 font-sans text-xs tracking-[0.3em] uppercase mb-4"
            >
              Get Started
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif font-light text-ivory text-headline mb-6"
            >
              Ready for Your<br />
              <span className="text-gold">Dream Smile?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-sans text-ivory/40 text-sm leading-relaxed mb-10 max-w-sm"
            >
              Book a free consultation today. No pressure, no judgment — just
              an honest assessment of your smile and what&apos;s possible.
            </motion.p>

            {/* Clinic hours */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="border border-ivory/5 rounded-2xl p-6 mb-8"
            >
              <p className="font-sans text-ivory/40 text-xs tracking-[0.2em] uppercase mb-4">Clinic Hours</p>
              {clinic.hours.map((h) => (
                <div key={h.days} className="flex justify-between items-center py-2 border-b border-ivory/5 last:border-0">
                  <span className="font-sans text-ivory/60 text-sm">{h.days}</span>
                  <span className="font-sans text-ivory text-sm font-medium">{h.time}</span>
                </div>
              ))}
            </motion.div>

            {/* WhatsApp alt */}
            <motion.a
              href={waDirectLink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="inline-flex items-center gap-2.5 border border-ivory/10 text-ivory/60 hover:text-ivory hover:border-ivory/25 px-6 py-3 rounded-full font-sans text-sm transition-all duration-300"
            >
              <MessageCircle size={15} className="text-green-400" />
              Or message on WhatsApp directly
            </motion.a>
          </div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-navy-800 border border-ivory/5 rounded-2xl p-8"
          >
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <CheckCircle2 size={48} className="text-gold" />
                <h3 className="font-serif text-ivory text-xl font-light">Consultation Booked!</h3>
                <p className="font-sans text-ivory/40 text-sm max-w-xs">
                  We&apos;ll reach out within 30 minutes to confirm your appointment.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('name')}
                      placeholder="Your full name"
                      className={inputClass}
                      aria-label="Full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400 font-sans">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="Phone number"
                      className={inputClass}
                      aria-label="Phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-400 font-sans">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <select
                    {...register('service')}
                    className={`${inputClass} appearance-none`}
                    aria-label="Service interested in"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a treatment...</option>
                    {clinic.services.map((s) => (
                      <option key={s.slug} value={s.slug} className="bg-navy text-ivory">
                        {s.name}
                      </option>
                    ))}
                    <option value="not-sure" className="bg-navy text-ivory">Not sure yet — I need advice</option>
                  </select>
                  {errors.service && (
                    <p className="mt-1 text-xs text-red-400 font-sans">{errors.service.message}</p>
                  )}
                </div>

                <textarea
                  {...register('message')}
                  placeholder="Any specific concerns or questions? (optional)"
                  rows={4}
                  className={`${inputClass} resize-none`}
                  aria-label="Additional message"
                />

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center gap-2.5 bg-gold text-navy px-7 py-4 rounded-xl font-sans font-semibold text-sm tracking-wide hover:bg-gold-dark transition-colors duration-300 shadow-gold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    'Sending...'
                  ) : (
                    <>
                      Book Free Consultation
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <p className="text-center text-red-400 text-xs font-sans">
                    Something went wrong. Please{' '}
                    <a href={waDirectLink} target="_blank" rel="noopener noreferrer" className="underline">
                      WhatsApp us directly
                    </a>
                    .
                  </p>
                )}

                <p className="text-center text-ivory/20 text-xs font-sans">
                  Free consultation · No obligation · 30-minute response guarantee
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
