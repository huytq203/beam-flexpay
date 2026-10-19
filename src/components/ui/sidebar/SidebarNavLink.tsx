import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { Tooltip, TooltipTrigger, TooltipContent } from '../tooltip/Tooltip'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from './SidebarContext'
import { menuButtonVariants } from './menuButtonVariants'

// ─── SidebarNavLink — wraps React Router NavLink ─────────────────────────────

/** Props for a sidebar navigation link (wraps React Router NavLink) */
export interface SidebarNavLinkProps {
  /** Route path for the link */
  to: string
  /** Icon rendered before the label */
  icon?: React.ReactNode
  /** Display text for the link; also used as tooltip when collapsed */
  label: string
  /** Match route exactly (React Router `end` prop) */
  end?: boolean
  /** Badge element rendered after the label */
  badge?: React.ReactNode
  /** Link size variant */
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** React Router state passed on navigation */
  state?: unknown
}

export const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({
  to,
  icon,
  label,
  end = false,
  badge,
  size = 'md',
  className,
  state: navigationState
}) => {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const link = (
    <NavLink
      to={to}
      end={end}
      state={navigationState}
      className={({ isActive }) =>
        cn(
          menuButtonVariants({ size, collapsed: isCollapsed, className }),
          isActive
            ? 'bg-sidebar-accent! text-sidebar-accent-foreground! font-semibold'
            : 'text-sidebar-foreground/70!'
        )
      }
    >
      {icon && (
        <span className='flex h-5 w-5 shrink-0 items-center justify-center'>
          {icon}
        </span>
      )}
      {!isCollapsed && (
        <>
          <span className='flex-1 truncate'>{label}</span>
          {badge && <span className='ml-auto shrink-0'>{badge}</span>}
        </>
      )}
    </NavLink>
  )

  if (isCollapsed && label) {
    return (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side='right'>{label}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}
SidebarNavLink.displayName = 'SidebarNavLink'
