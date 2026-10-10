import type { ReactNode } from 'react'
import { ButtonComponent, TooltipComponent } from '@components/index'

interface RefundActionButtonProps {
  label: string
  ariaLabel?: string
  icon: ReactNode
  variant: 'icon' | 'text'
  onClick: () => void
  tone?: 'default' | 'primary' | 'danger'
  loading?: boolean
}

export function RefundActionButton({
  label,
  ariaLabel,
  icon,
  variant,
  onClick,
  tone = 'default',
  loading
}: RefundActionButtonProps) {
  const type = tone === 'primary' ? 'primary' : 'default'
  if (variant === 'text') {
    return (
      <ButtonComponent
        htmlType='button'
        type={type}
        danger={tone === 'danger'}
        icon={icon}
        content={label}
        loading={loading}
        onClick={onClick}
      />
    )
  }
  return (
    <TooltipComponent title={label}>
      <ButtonComponent
        htmlType='button'
        size='small'
        type={type}
        danger={tone === 'danger'}
        aria-label={ariaLabel ?? label}
        icon={icon}
        loading={loading}
        onClick={onClick}
      />
    </TooltipComponent>
  )
}
