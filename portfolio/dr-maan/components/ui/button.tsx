'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-sans font-semibold tracking-wide rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
        variant === 'default'  && 'bg-gold text-navy hover:bg-gold-dark shadow-gold',
        variant === 'ghost'    && 'border border-ivory/15 text-ivory/70 hover:text-ivory hover:border-ivory/30 backdrop-blur-sm',
        variant === 'outline'  && 'border border-gold/40 text-gold hover:bg-gold hover:text-navy',
        size === 'sm'          && 'px-5 py-2 text-sm',
        size === 'md'          && 'px-7 py-3.5 text-sm',
        size === 'lg'          && 'px-9 py-4 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
