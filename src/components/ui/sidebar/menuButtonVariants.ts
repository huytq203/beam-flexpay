import { tv } from 'tailwind-variants'

export const menuButtonVariants = tv({
  base: [
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md',
    'text-sm font-medium outline-none ring-sidebar-ring motion-safe:transition-all motion-safe:duration-150',
    'hover:bg-accent hover:text-accent-foreground',
    'focus-visible:ring-2 active:bg-accent/80',
    'disabled:pointer-events-none disabled:opacity-50',
    'group-has-data-[sidebar=menu-action]/menu-item:pr-8',
    // Data state active
    'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-semibold'
  ],
  variants: {
    size: {
      sm: 'h-8 px-2 text-sm',
      md: 'h-10 px-2.5 text-md',
      lg: 'h-12 px-3 text-base'
    },
    collapsed: {
      true: 'justify-center px-0',
      false: 'justify-start'
    }
  },
  defaultVariants: { size: 'md', collapsed: false }
})
