'use client'

import { useEffect, useRef } from 'react'
import { lerp } from '@/lib/utils'

export function MagneticCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos     = useRef({ x: -100, y: -100 })  // off-screen until first move
  const ringPos = useRef({ x: -100, y: -100 })
  const rafId   = useRef<number>(0)

  useEffect(() => {
    // Skip on touch-only devices
    if (!window.matchMedia('(hover: hover)').matches) return

    const dot  = dotRef.current!
    const ring = ringRef.current!

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    // Smoothly follow cursor using lerp
    const tick = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.12)
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.12)

      dot.style.transform  = `translate(calc(${pos.current.x}px - 50%), calc(${pos.current.y}px - 50%))`
      ring.style.transform = `translate(calc(${ringPos.current.x}px - 50%), calc(${ringPos.current.y}px - 50%))`

      rafId.current = requestAnimationFrame(tick)
    }

    // Add cursor state classes on hover targets
    const addHover = (e: Event) => {
      const el = e.currentTarget as HTMLElement
      document.body.classList.add(el.dataset.cursorClass ?? 'cursor-hover')
    }
    const removeHover = () => {
      document.body.classList.remove('cursor-hover', 'cursor-link')
    }

    const bindHoverTargets = () => {
      document.querySelectorAll<HTMLElement>(
        'a, button, [role="button"], input, textarea, select, [data-cursor]'
      ).forEach((el) => {
        el.addEventListener('mouseenter', addHover)
        el.addEventListener('mouseleave', removeHover)
      })
    }

    window.addEventListener('mousemove', onMove)
    rafId.current = requestAnimationFrame(tick)
    bindHoverTargets()

    // Re-bind when DOM changes (Next.js navigation)
    const observer = new MutationObserver(bindHoverTargets)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId.current)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div id="cursor-dot"  ref={dotRef}  aria-hidden="true" />
      <div id="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  )
}
