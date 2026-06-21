'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Procedural tooth built from LatheGeometry (incisor profile).
 * Swap this with useGLTF('/models/tooth.glb') when you have a real asset.
 * Compress the GLB with: npx gltf-pipeline -i tooth.glb -o tooth-draco.glb --draco.compressionLevel 7
 */
export function ToothMesh() {
  const groupRef  = useRef<THREE.Group>(null)
  const crownRef  = useRef<THREE.Mesh>(null)
  const ringRef   = useRef<THREE.Mesh>(null)
  const mouseRef  = useRef({ x: 0, y: 0 })

  // Build incisor/premolar lathe profile
  const crownGeometry = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.01,  1.55),   // apex
      new THREE.Vector2(0.18,  1.35),
      new THREE.Vector2(0.38,  1.00),
      new THREE.Vector2(0.50,  0.55),
      new THREE.Vector2(0.52,  0.10),   // max bulge
      new THREE.Vector2(0.48, -0.05),   // equator
      new THREE.Vector2(0.40, -0.18),   // CEJ — neck constriction
      new THREE.Vector2(0.32, -0.40),
      new THREE.Vector2(0.24, -0.75),
      new THREE.Vector2(0.14, -1.15),
      new THREE.Vector2(0.06, -1.48),
      new THREE.Vector2(0.01, -1.60),   // root apex
    ]
    const geo = new THREE.LatheGeometry(pts, 64, 0, Math.PI * 2)
    geo.computeVertexNormals()
    return geo
  }, [])

  // Track mouse for subtle parallax
  useMemo(() => {
    const handle = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    if (typeof window !== 'undefined') window.addEventListener('mousemove', handle)
    return () => { if (typeof window !== 'undefined') window.removeEventListener('mousemove', handle) }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Slow auto-rotation on Y axis
    groupRef.current.rotation.y += delta * 0.18

    // Subtle mouse-reactive tilt
    groupRef.current.rotation.x += (mouseRef.current.y * 0.08 - groupRef.current.rotation.x) * 0.05
    groupRef.current.rotation.z += (-mouseRef.current.x * 0.06 - groupRef.current.rotation.z) * 0.05

    // Gentle float
    groupRef.current.position.y = Math.sin(Date.now() * 0.0008) * 0.06

    // Pulsing gold ring
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4
      const s = 1 + Math.sin(Date.now() * 0.002) * 0.04
      ringRef.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={groupRef} position={[1.2, 0, 0]} scale={1.1}>

      {/* ── Main tooth crown ── */}
      <mesh ref={crownRef} geometry={crownGeometry} castShadow>
        {/* MeshTransmissionMaterial for glass/enamel look */}
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.3}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transmission={0.15}
          ior={1.5}
          chromaticAberration={0.02}
          color="#F5F0E8"           /* ivory enamel */
          attenuationColor="#C9E8D0"
          attenuationDistance={0.4}
          envMapIntensity={2.5}
          distortion={0.08}
          distortionScale={0.15}
          temporalDistortion={0.06}
        />
      </mesh>

      {/* ── Gold implant collar ring at CEJ ── */}
      <mesh ref={ringRef} position={[0, -0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.025, 16, 80]} />
        <meshStandardMaterial
          color="#C9A961"
          metalness={0.95}
          roughness={0.1}
          envMapIntensity={3}
        />
      </mesh>

      {/* ── Subtle root shadow (dark translucent cone) ── */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.28, 0.01, 1.0, 32]} />
        <meshStandardMaterial
          color="#0A1628"
          transparent
          opacity={0.35}
          roughness={1}
        />
      </mesh>

    </group>
  )
}
