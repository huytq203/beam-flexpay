import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../tooltip/Tooltip'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from './SidebarContext'
import { menuButtonVariants } from './menuButtonVariants'
import { SidebarMenuSub } from './SidebarMenu'

// ─── SidebarMenuCollapsible — nhóm có sub-items ───────────────────────────────

/** Props for a collapsible sidebar menu group with sub-items */
export interface SidebarMenuCollapsibleProps {
  /** Unique identifier for the group */
  id: string
  /** Icon displayed next to the group label */
  icon: React.ReactNode
  /** Display text for the collapsible group header */
  label: string
  children: React.ReactNode
  /** Whether the group is initially expanded */
  defaultOpen?: boolean
  /** When true, the group auto-expands and shows an active indicator */
  isChildActive?: boolean
}

export const SidebarMenuCollapsible: React.FC<SidebarMenuCollapsibleProps> = ({
  icon,
  label,
  children,
  defaultOpen = false,
  isChildActive = false
}) => {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const [isOpen, setIsOpen] = React.useState(defaultOpen || isChildActive)
  // Thu gọn sidebar chỉ ẩn sub-menu khi render, không ghi đè `isOpen`, nên mở rộng
  // lại là về đúng trạng thái cũ. Có mục con active (đổi route, mở rộng lại sidebar)
  // thì mở nhóm: cập nhật ngay trong render thay vì effect để tránh render dây chuyền.
  const [prevChildActive, setPrevChildActive] = React.useState(isChildActive)
  const [prevCollapsed, setPrevCollapsed] = React.useState(isCollapsed)
  if (isChildActive !== prevChildActive || isCollapsed !== prevCollapsed) {
    setPrevChildActive(isChildActive)
    setPrevCollapsed(isCollapsed)
    if (isChildActive && !isCollapsed) setIsOpen(true)
  }
  const isExpanded = !isCollapsed && isOpen

  const trigger = (
    <button
      type='button'
      aria-expanded={isExpanded}
      data-active={isChildActive && isCollapsed}
      onClick={() => {
        if (!isCollapsed) setIsOpen(!isOpen)
      }}
      className={menuButtonVariants({
        collapsed: isCollapsed,
        className:
          isChildActive && isCollapsed
            ? 'text-sidebar-accent-foreground!'
            : 'text-sidebar-foreground/70!'
      })}
    >
      <span className='flex h-5 w-5 shrink-0 items-center justify-center'>
        {icon}
      </span>
      {!isCollapsed && (
        <>
          <span className='flex-1 truncate text-left'>{label}</span>
          <ChevronRight
            className={cn(
              'ml-auto h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40',
              'motion-safe:transition-transform motion-safe:duration-200',
              isOpen && 'rotate-90'
            )}
          />
        </>
      )}
    </button>
  )

  return (
    <>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger render={trigger} />
          <TooltipContent side='right'>{label}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}

      {/* Sub-items với animation mượt - Sử dụng SidebarMenuSub (ul) để hợp lệ HTML */}
      <SidebarMenuSub
        className={cn(
          'overflow-hidden motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-in-out',
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </SidebarMenuSub>
    </>
  )
}
SidebarMenuCollapsible.displayName = 'SidebarMenuCollapsible'
