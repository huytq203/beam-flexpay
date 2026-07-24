import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type Side = 'top' | 'right' | 'bottom' | 'left'

interface TooltipCtx {
  open: boolean
  setOpen: (value: boolean) => void
}

const Ctx = React.createContext<TooltipCtx | null>(null)

export const Tooltip: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Ctx.Provider value={{ open, setOpen }}>
      <span className={cn('relative inline-flex w-full', className)}>
        {children}
      </span>
    </Ctx.Provider>
  )
}

export const TooltipTrigger: React.FC<{
  render: React.ReactElement
}> = ({ render }) => {
  const ctx = React.useContext(Ctx)
  const show = () => ctx?.setOpen(true)
  const hide = () => ctx?.setOpen(false)

  return React.cloneElement(render as React.ReactElement<Record<string, unknown>>, {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide
  })
}

const sideClasses: Record<Side, string> = {
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2'
}

export const TooltipContent: React.FC<{
  side?: Side
  className?: string
  children: React.ReactNode
}> = ({ side = 'top', className, children }) => {
  const ctx = React.useContext(Ctx)
  if (!ctx?.open) return null

  return (
    <span
      role='tooltip'
      className={cn(
        'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md',
        sideClasses[side],
        className
      )}
    >
      {children}
    </span>
  )
}
