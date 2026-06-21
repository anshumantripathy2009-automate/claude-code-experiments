'use client'

import dynamic from 'next/dynamic'
import { HeroContent }    from './HeroContent'
import { ScrollIndicator } from './ScrollIndicator'

// Heavy R3F canvas — client only, no SSR
const HeroScene = dynamic(
  () => import('./HeroScene').then((m) => ({ default: m.HeroScene })),
  { ssr: false }
)

export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative w-full min-h-screen overflow-hidden bg-navy flex items-center"
    >
      {/* Ambient orbs */}
      <div className="orb absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] bg-gold/20 rounded-full pointer-events-none" />
      <div className="orb absolute bottom-[-20%] right-[-5%]  w-[45vw] h-[45vw] bg-mint/10 rounded-full pointer-events-none" />

      {/* 3D canvas — full viewport, right-aligned on desktop */}
      <div className="absolute inset-0 pointer-events-none">
        <HeroScene />
      </div>

      {/* Text content */}
      <HeroContent />

      {/* Scroll cue */}
      <ScrollIndicator />
    </section>
  )
}
