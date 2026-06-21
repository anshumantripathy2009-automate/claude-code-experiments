import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Clamp a number between min and max */
export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max)

/** Map a value from one range to another */
export const mapRange = (
  val: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin)

/** Format WhatsApp URL */
export const waLink = (phone: string, message: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

/** Lerp */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
