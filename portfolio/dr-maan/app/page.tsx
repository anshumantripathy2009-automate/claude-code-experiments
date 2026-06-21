import dynamic from 'next/dynamic'

// Dynamic import so R3F canvas never touches the server
const Hero = dynamic(
  () => import('@/components/sections/Hero').then((m) => ({ default: m.Hero })),
  { ssr: false }
)

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Remaining sections will be added here */}
    </>
  )
}
