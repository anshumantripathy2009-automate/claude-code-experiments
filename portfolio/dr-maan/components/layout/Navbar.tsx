'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import { waLink } from '@/lib/utils'
import clinic from '@/content/clinic.json'

const NAV_LINKS = [
  { href: '#services',        label: 'Services' },
  { href: '#technology',      label: 'Technology' },
  { href: '#doctor',          label: 'Dr. MaAn' },
  { href: '#transformations', label: 'Results' },
  { href: '#contact',         label: 'Contact' },
]

export function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-navy/90 backdrop-blur-xl border-b border-ivory/5 py-3'
            : 'py-6'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex flex-col leading-none" aria-label="Dr. MaAn's Dental — Home">
            <span className="font-serif text-gold text-[10px] tracking-[0.25em] uppercase mb-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
              Superspeciality Dental
            </span>
            <span className="font-serif text-ivory text-xl font-light tracking-tight group-hover:text-gold transition-colors duration-300">
              Dr. MaAn&apos;s
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="font-sans text-ivory/60 hover:text-gold text-sm font-medium tracking-wide transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-gold after:transition-all hover:after:w-full"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href={waLink(clinic.whatsapp, `Hi Dr. MaAn, I'd like to book a consultation.`)}
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 bg-gold text-navy px-5 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-gold-dark transition-colors duration-300 shadow-gold"
            >
              Book Consultation
            </a>
            <a
              href={`tel:${clinic.phone}`}
              className="hidden sm:flex w-9 h-9 items-center justify-center border border-ivory/10 rounded-full text-ivory/50 hover:text-gold hover:border-gold/40 transition-all duration-300"
              aria-label="Call clinic"
            >
              <Phone size={15} />
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center border border-ivory/10 rounded-full text-ivory/70 hover:text-gold hover:border-gold/40 transition-all"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-navy/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {NAV_LINKS.map(({ href, label }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="font-serif text-ivory/80 hover:text-gold text-3xl font-light transition-colors"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
            <a
              href={waLink(clinic.whatsapp, `Hi Dr. MaAn, I'd like to book a consultation.`)}
              target="_blank" rel="noopener noreferrer"
              className="mt-4 bg-gold text-navy px-8 py-3 rounded-full font-sans font-bold text-base"
            >
              Book Consultation
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
