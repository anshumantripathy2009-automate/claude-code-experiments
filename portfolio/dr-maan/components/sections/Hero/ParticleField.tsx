'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 420

export function ParticleField() {
  const meshRef    = useRef<THREE.Points>(null)
  const mouseRef   = useRef({ x: 0, y: 0 })

  // Random positions in a sphere
  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const phases    = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r     = 3.5 + Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi) - 2

      phases[i] = Math.random() * Math.PI * 2
    }
    return { positions, phases }
  }, [])

  // Mouse tracking for parallax
  useMemo(() => {
    const h = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5),
        y: (e.clientY / window.innerHeight - 0.5),
      }
    }
    if (typeof window !== 'undefined') window.addEventListener('mousemove', h)
    return () => { if (typeof window !== 'undefined') window.removeEventListener('mousemove', h) }
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    // Slow drift + mouse parallax
    meshRef.current.rotation.y  = t * 0.025 + mouseRef.current.x * 0.15
    meshRef.current.rotation.x  = mouseRef.current.y * 0.1

    // Breathe individual particles via geometry attribute
    const pos = meshRef.current.geometry.attributes.position
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const base = positions[i * 3 + 1]
      pos.setY(i, base + Math.sin(t * 0.5 + phases[i]) * 0.08)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#C9A961"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
