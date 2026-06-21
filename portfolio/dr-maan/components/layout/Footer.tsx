'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { waLink } from '@/lib/utils'
import clinic from '@/content/clinic.json'

const LINKS = [
  { href: '#services',     label: 'Services' },
  { href: '#technology',   label: 'Technology' },
  { href: '#doctor',       label: 'Dr. MaAn' },
  { href: '#results',      label: 'Transformations' },
  { href: '#contact',      label: 'Book Now' },
]

export function Footer() {
  const wa = waLink(clinic.whatsapp, `Hi Dr. MaAn, I'd like to book a consultation.`)

  return (
    <footer className="bg-navy border-t border-ivory/5">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex flex-col leading-none mb-4">
              <span className="font-serif text-gold/60 text-[9px] tracking-[0.3em] uppercase mb-1">
                Superspeciality Dental
              </span>
              <span className="font-serif text-ivory text-2xl font-light">
                Dr. MaAn&apos;s
              </span>
            </div>
            <p className="font-sans text-ivory/35 text-sm leading-relaxed max-w-xs mb-6">
              {clinic.tagline} — Bhubaneswar&apos;s most advanced dental studio,
              where precision meets artistry.
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-gold text-navy px-6 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-gold-dark transition-colors duration-300 shadow-gold"
            >
              Book a Consultation
            </a>
          </div>

          {/* Quick links */}
          <div>
            <p className="font-sans text-ivory/40 text-xs tracking-[0.2em] uppercase mb-5">Quick Links</p>
            <ul className="space-y-3">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-sans text-ivory/50 hover:text-gold text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-sans text-ivory/40 text-xs tracking-[0.2em] uppercase mb-5">Contact</p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={13} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="font-sans text-ivory/40 text-xs leading-relaxed">
                  {clinic.address.street}, {clinic.address.city}
                </span>
              </li>
              <li>
                <a
                  href={`tel:${clinic.phone}`}
                  className="flex items-center gap-3 font-sans text-ivory/40 hover:text-gold text-xs transition-colors duration-200"
                >
                  <Phone size={13} className="text-gold flex-shrink-0" />
                  {clinic.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${clinic.email}`}
                  className="flex items-center gap-3 font-sans text-ivory/40 hover:text-gold text-xs transition-colors duration-200"
                >
                  <Mail size={13} className="text-gold flex-shrink-0" />
                  {clinic.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ivory/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-ivory/20 text-xs">
            © {new Date().getFullYear()} {clinic.name}. All rights reserved.
          </p>
          <p className="font-sans text-ivory/20 text-xs">
            Crafted by{' '}
            <a
              href="https://noirflow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/40 hover:text-gold transition-colors duration-200"
            >
              NoirFlow ⚡
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
