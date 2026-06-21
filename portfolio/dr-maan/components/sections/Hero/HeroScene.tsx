'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing'
import { ToothMesh } from './ToothMesh'
import { ParticleField } from './ParticleField'

function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        height={300}
        intensity={0.4}
      />
      <DepthOfField
        focusDistance={0.018}
        focalLength={0.04}
        bokehScale={2.5}
        height={480}
      />
      <Vignette offset={0.4} darkness={0.7} eskil={false} />
      <Noise opacity={0.018} />
    </EffectComposer>
  )
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45, near: 0.1, far: 60 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
      aria-hidden="true"
    >
      {/* Adaptive performance */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#F8F5F0"
        castShadow
      />
      <pointLight position={[-4, 2, 3]} intensity={0.6} color="#C9A961" />
      <pointLight position={[4, -3, -2]} intensity={0.3} color="#9FD8C7" />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* Scene */}
      <Suspense fallback={null}>
        <ParticleField />
        <ToothMesh />
      </Suspense>

      {/* Post-processing */}
      <Suspense fallback={null}>
        <Effects />
      </Suspense>
    </Canvas>
  )
}
