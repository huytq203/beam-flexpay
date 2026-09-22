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
    ? 'size-8! border-danger-strong/70! bg-background! p-0! text-danger-strong! shadow-none! hover:bg-danger/10!'
    : unlock
      ? 'size-8! border-success-strong/40! bg-background! p-0! text-success-strong! shadow-none! hover:bg-success-strong/10!'
      : 'size-8! border-border! bg-background! p-0! text-foreground! shadow-none! hover:bg-muted!'

  return (
    <TooltipComponent title={title}>
      <ButtonComponent
        aria-label={label}
        className={className}
        danger={danger}
        htmlType='button'
        icon={icon}
        onClick={onClick}
        type='default'
      />
    </TooltipComponent>
  )
}
