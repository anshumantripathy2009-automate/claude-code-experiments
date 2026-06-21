import dynamic from 'next/dynamic'
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp'
import { Footer }           from '@/components/layout/Footer'
import { Technology }       from '@/components/sections/Technology'
import { Doctor }           from '@/components/sections/Doctor'
import { Testimonials }     from '@/components/sections/Testimonials'
import { Transformations }  from '@/components/sections/Transformations'
import { Booking }          from '@/components/sections/Booking'
import { Contact }          from '@/components/sections/Contact'

// R3F canvas must be client-only
const Hero     = dynamic(() => import('@/components/sections/Hero').then((m) => ({ default: m.Hero })),     { ssr: false })
const Services = dynamic(() => import('@/components/sections/Services').then((m) => ({ default: m.Services })), { ssr: false })

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Technology />
      <Doctor />
      <Transformations />
      <Testimonials />
      <Booking />
      <Contact />
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
