'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CASES = [
  {
    id: 1,
    label: 'Dental Implants',
    detail: 'Missing front tooth restored to perfection in two visits',
    before: { src: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&q=80', alt: 'Patient before dental implant procedure' },
    after:  { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80', alt: 'Patient after dental implant procedure — confident bright smile' },
  },
  {
    id: 2,
    label: 'Smile Design & Veneers',
    detail: '8 porcelain veneers crafted for a Hollywood-grade smile transformation',
    before: { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', alt: 'Patient before smile design procedure' },
    after:  { src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80', alt: 'Patient after smile design procedure — natural veneers result' },
  },
  {
    id: 3,
    label: 'Clear Aligner Therapy',
    detail: 'Crowded teeth corrected over 14 months — no metal, no visibility',
    before: { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', alt: 'Patient before orthodontic treatment' },
    after:  { src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80', alt: 'Patient after orthodontic treatment — straight confident smile' },
  },
]

function BeforeAfterSlider({ before, after }: { before: { src: string; alt: string }; after: { src: string; alt: string } }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const dragging = useRef(false)

  const update = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const { left, width } = containerRef.current.getBoundingClientRect()
    setPos(Math.max(2, Math.min(98, ((clientX - left) / width) * 100)))
  }, [])

  const onMouseMove  = (e: React.MouseEvent)  => { if (dragging.current) update(e.clientX) }
  const onTouchMove  = (e: React.TouchEvent)  => update(e.touches[0].clientX)
  const startDrag    = () => { dragging.current = true }
  const stopDrag     = () => { dragging.current = false }

  useEffect(() => {
    window.addEventListener('mouseup', stopDrag)
    return () => window.removeEventListener('mouseup', stopDrag)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] overflow-hidden rounded-2xl select-none cursor-ew-resize"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* Before layer */}
      <div className="absolute inset-0">
        <Image src={before.src} alt={before.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        <span className="absolute top-4 left-4 bg-navy/80 backdrop-blur-sm text-ivory/70 text-xs font-sans px-3 py-1 rounded-full">
          Before
        </span>
      </div>

      {/* After layer — clip-path reveal */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Image src={after.src} alt={after.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        <span className="absolute top-4 right-4 bg-gold text-navy text-xs font-sans px-3 py-1 rounded-full font-semibold">
          After
        </span>
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80"
        style={{ left: `${pos}%` }}
      >
        {/* Handle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize"
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <ChevronLeft size={12} className="text-navy -mr-0.5" />
          <ChevronRight size={12} className="text-navy -ml-0.5" />
        </div>
      </div>
    </div>
  )
}

export function Transformations() {
  const sectionRef  = useRef<HTMLElement>(null)
  const isInView    = useInView(sectionRef, { once: true, margin: '-10%' })
  const [active, setActive] = useState(0)
  const current = CASES[active]

  return (
    <section ref={sectionRef} id="results" className="bg-navy py-28 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block text-gold/60 font-sans text-xs tracking-[0.3em] uppercase mb-4"
            >
              Real Results
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif font-light text-ivory text-headline"
            >
              Patient<br />
              <span className="text-gold">Transformations</span>
            </motion.h2>
          </div>
          {/* Case selector */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-3"
          >
            {CASES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-full font-sans text-xs font-medium transition-all duration-300 ${
                  active === i
                    ? 'bg-gold text-navy'
                    : 'border border-ivory/15 text-ivory/50 hover:border-gold/40 hover:text-ivory/70'
                }`}
              >
                Case {c.id}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
        >
          {/* Slider */}
          <BeforeAfterSlider before={current.before} after={current.after} />

          {/* Case info */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-block bg-gold/10 text-gold text-xs font-sans px-3 py-1 rounded-full mb-4">
                {current.label}
              </span>
              <p className="font-sans text-ivory/50 text-sm leading-relaxed">
                {current.detail}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Treatment Duration', value: '2–4 visits' },
                { label: 'Pain Level',          value: 'Minimal' },
                { label: 'Recovery Time',       value: '24–48 hrs' },
                { label: 'Longevity',           value: '15–25 years' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-navy-800 border border-ivory/5 rounded-xl p-4">
                  <p className="font-sans text-ivory/30 text-xs mb-1">{label}</p>
                  <p className="font-sans text-ivory text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>

            <p className="font-sans text-ivory/30 text-xs italic">
              * Individual results may vary. Drag the slider to compare before &amp; after.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
