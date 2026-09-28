import type { ReactNode } from 'react'

import { ButtonComponent, TooltipComponent } from '@components/index'

interface TerminalActionButtonProps {
  label: string
  title: string
  danger?: boolean
  unlock?: boolean
  icon: ReactNode
  onClick: () => void
}

export function TerminalActionButton({
  label,
  title,
  danger,
  unlock,
  icon,
  onClick
}: TerminalActionButtonProps) {
  const className = danger
    ? 'border-danger-strong/70! bg-background! text-danger-strong! shadow-none! hover:bg-danger/10!'
    : unlock
      ? 'border-success-strong/40! bg-background! text-success-strong! shadow-none! hover:bg-success-strong/10!'
      : 'border-border! bg-background! text-foreground! shadow-none! hover:bg-muted!'

  return (
    <TooltipComponent title={title}>
      <ButtonComponent
        aria-label={label}
        className={className}
        danger={danger}
        htmlType='button'
        icon={icon}
        onClick={onClick}
        size='small'
        type='default'
      />
    </TooltipComponent>
  )
}
