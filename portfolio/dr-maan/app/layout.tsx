import type { Metadata, Viewport } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'

import { LenisProvider }   from '@/components/providers/LenisProvider'
import { MagneticCursor }  from '@/components/cursor/MagneticCursor'
import { LoadingScreen }   from '@/components/loading/LoadingScreen'
import { Navbar }          from '@/components/layout/Navbar'
import clinic              from '@/content/clinic.json'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title:       `${clinic.name} | ${clinic.address.city}`,
  description: `${clinic.tagline} Advanced dental implants, cosmetic dentistry, and smile makeovers in ${clinic.address.city}. Book your free consultation today.`,
  keywords:    ['dentist', 'dental implants', 'cosmetic dentistry', 'smile makeover', clinic.address.city, 'orthodontics'],
  authors:     [{ name: clinic.doctor.name }],
  openGraph: {
    title:       clinic.name,
    description: clinic.tagline,
    type:        'website',
    locale:      'en_IN',
    siteName:    clinic.name,
  },
  twitter: {
    card:        'summary_large_image',
    title:       clinic.name,
    description: clinic.tagline,
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  themeColor: '#0A1628',
  width:      'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context':   'https://schema.org',
  '@type':      ['Dentist', 'MedicalClinic', 'LocalBusiness'],
  name:          clinic.name,
  description:   clinic.tagline,
  address: {
    '@type':         'PostalAddress',
    streetAddress:    clinic.address.street,
    addressLocality:  clinic.address.city,
    addressRegion:    clinic.address.state,
    postalCode:       clinic.address.pin,
    addressCountry:   'IN',
  },
  geo: {
    '@type':    'GeoCoordinates',
    latitude:    clinic.address.geo.lat,
    longitude:   clinic.address.geo.lng,
  },
  url:            process.env.NEXT_PUBLIC_SITE_URL ?? '',
  telephone:      clinic.phone,
  priceRange:     '₹₹₹',
  servesCuisine:  undefined,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-navy text-ivory antialiased overflow-x-hidden">
        {/* Page curtain for transitions */}
        <div id="page-curtain" aria-hidden="true" />

        <LenisProvider>
          <LoadingScreen />
          <MagneticCursor />
          <Navbar />
          <main>{children}</main>
        </LenisProvider>
      </body>
    </html>
  )
}
