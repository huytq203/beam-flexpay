import type { ReactNode } from 'react'

import { ButtonComponent, TooltipComponent } from '@components/index'

export function AccessActionButton({
  label,
  icon,
  onClick,
  danger = false
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <TooltipComponent title={label}>
      <ButtonComponent
        aria-label={label}
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
