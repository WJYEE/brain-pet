'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ToyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  children: ReactNode
}

/**
 * Shared "sticker toy" CTA button matching the v0 design system (toy-border +
 * toy-shadow + press animation). Extracted so PHASE 1 screens don't each
 * re-type the same long className string used across the existing screens.
 */
export function ToyButton({
  variant = 'primary',
  className,
  children,
  disabled,
  ...props
}: ToyButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-display text-lg font-extrabold toy-border transition-transform duration-150',
        variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground',
        disabled
          ? 'cursor-not-allowed opacity-70'
          : cn(
              variant === 'primary' ? 'toy-shadow-lg' : 'toy-shadow',
              'hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none',
            ),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
