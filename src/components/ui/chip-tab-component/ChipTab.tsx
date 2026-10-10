import { cn } from '@lib/utils/cn'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { tv } from 'tailwind-variants'

const chipTab = tv({
  base: [
    'inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md border px-3',
    'text-[13px] font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'disabled:cursor-not-allowed disabled:opacity-60'
  ],
  variants: {
    isActive: {
      true: 'border-primary bg-primary text-primary-foreground',
      false: 'border-border bg-white text-foreground hover:bg-accent'
    }
  }
})

export interface ChipTabProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'role' | 'children' | 'type'
  > {
  isActive: boolean
  /** `button` dùng aria-pressed (bộ lọc bật/tắt); `tab` dùng aria-selected trong tablist. */
  role?: 'button' | 'tab'
  icon?: ReactNode
  children: ReactNode
}

export const ChipTab = ({
  isActive,
  role = 'button',
  icon,
  className,
  children,
  ...rest
}: ChipTabProps) => (
  <button
    {...rest}
    type='button'
    role={role === 'tab' ? 'tab' : undefined}
    aria-pressed={role === 'button' ? isActive : undefined}
    aria-selected={role === 'tab' ? isActive : undefined}
    className={cn(chipTab({ isActive }), className)}
  >
    {icon}
    {children}
  </button>
)
