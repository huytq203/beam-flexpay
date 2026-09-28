import type { ReactNode } from 'react'
import { ButtonComponent, TooltipComponent } from '@components/index'

interface NotificationRowActionProps {
  label: string
  icon: ReactNode
  onClick: () => void
}

export function NotificationRowAction({
  label,
  icon,
  onClick
}: NotificationRowActionProps) {
  return (
    <TooltipComponent title={label}>
      <ButtonComponent
        aria-label={label}
        size='small'
        type='default'
        icon={icon}
        onClick={onClick}
      />
    </TooltipComponent>
  )
}
