import * as React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../tooltip/Tooltip'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from './SidebarContext'
import { menuButtonVariants } from './menuButtonVariants'

// ─── Group ────────────────────────────────────────────────────────────────────

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar='group'
    className={cn('relative flex flex-col w-full min-w-0 px-2', className)}
    {...props}
  />
))
SidebarGroup.displayName = 'SidebarGroup'

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  return (
    <div
      ref={ref}
      data-sidebar='group-label'
      className={cn(
        'flex min-h-8 shrink-0 items-center rounded-md px-2 py-1',
        'text-xs font-bold leading-tight text-sidebar-foreground/50 uppercase tracking-wide',
        'motion-safe:transition-all motion-safe:duration-200 overflow-hidden select-none',
        state === 'collapsed' ? 'opacity-0 h-0 mb-0 hidden' : 'opacity-100',
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar='group-content'
    className={cn('w-full', className)}
    {...props}
  />
))
SidebarGroupContent.displayName = 'SidebarGroupContent'

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar='menu'
    className={cn('flex flex-col gap-0.5 list-none m-0 p-0 w-full', className)}
    {...props}
  />
))
SidebarMenu.displayName = 'SidebarMenu'

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar='menu-item'
    className={cn('group/menu-item relative', className)}
    {...props}
  />
))
SidebarMenuItem.displayName = 'SidebarMenuItem'

// ─── SidebarMenuButton ────────────────────────────────────────────────────────

/** Props for a sidebar menu button */
export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render as child element instead of a button */
  asChild?: boolean
  /** Marks the button as the currently active item */
  isActive?: boolean
  /** Tooltip text shown when the sidebar is collapsed */
  tooltip?: string
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg'
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    { className, isActive = false, tooltip, size = 'md', children, ...props },
    ref
  ) => {
    const { state } = useSidebar()
    const isCollapsed = state === 'collapsed'

    const button = (
      <button
        ref={ref}
        type='button'
        data-sidebar='menu-button'
        data-active={isActive}
        data-size={size}
        className={menuButtonVariants({
          size,
          collapsed: isCollapsed,
          className
        })}
        {...props}
      >
        {isCollapsed ? React.Children.toArray(children)[0] : children}
      </button>
    )

    if (isCollapsed && tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger render={button} />
          <TooltipContent side='right'>{tooltip}</TooltipContent>
        </Tooltip>
      )
    }

    return button
  }
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

// ─── SidebarMenuSub ───────────────────────────────────────────────────────────

export const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  if (state === 'collapsed') return null
  return (
    <ul
      ref={ref}
      data-sidebar='menu-sub'
      className={cn(
        'mx-3.5 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 list-none',
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSub.displayName = 'SidebarMenuSub'

export const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>((props, ref) => (
  <li
    ref={ref}
    {...props}
  />
))
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

// ─── Badge & Skeleton ─────────────────────────────────────────────────────────

export const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar='menu-badge'
    className={cn(
      'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1 text-xs',
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

export const SidebarMenuSkeleton: React.FC<{ showIcon?: boolean }> = ({
  showIcon = true
}) => (
  <div className='flex h-9 items-center gap-2 rounded-md px-2'>
    {showIcon && (
      <div className='h-4 w-4 rounded bg-sidebar-accent motion-safe:animate-pulse shrink-0' />
    )}
    <div className='h-4 flex-1 rounded bg-sidebar-accent motion-safe:animate-pulse' />
  </div>
)

export { SidebarNavLink } from './SidebarNavLink'
export type { SidebarNavLinkProps } from './SidebarNavLink'
export { SidebarMenuCollapsible } from './SidebarMenuCollapsible'
export type { SidebarMenuCollapsibleProps } from './SidebarMenuCollapsible'
