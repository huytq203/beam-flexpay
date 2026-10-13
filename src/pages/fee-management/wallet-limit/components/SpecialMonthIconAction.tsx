import type { ReactNode } from 'react'
import { ButtonComponent, TooltipComponent } from '@components/index'

interface SpecialMonthIconActionProps {
  label: string
  icon: ReactNode
  onClick: () => void
}

export function SpecialMonthIconAction({
  label,
  icon,
  onClick
}: SpecialMonthIconActionProps) {
  return (
    <TooltipComponent title={label}>
      <ButtonComponent
        type='default'
        size='small'
        htmlType='button'
        aria-label={label}
        icon={icon}
        onClick={onClick}
      />
    </TooltipComponent>
  )
}
