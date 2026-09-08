import { ArrowDownIcon, ArrowUpIcon, ArrowsLeftRightIcon } from '@components/icons'
import { cn } from '@lib/utils/cn'
import {
  FEE_DIRECTION_HINT,
  FEE_DIRECTION_LABEL,
  FeeDirection,
  getFeeDirection
} from '@utils/fee-direction'
import type { ComponentType } from 'react'

interface DirectionStyle {
  readonly className: string
  readonly Icon: ComponentType<{ size?: number; weight?: 'bold' }>
}

const DIRECTION_STYLE: Readonly<Record<FeeDirection, DirectionStyle>> = {
  [FeeDirection.IN]: {
    className: 'bg-emerald-50 text-success-strong ring-success-strong/25',
    Icon: ArrowDownIcon
  },
  [FeeDirection.OUT]: {
    className: 'bg-amber-50 text-warning-strong ring-warning-strong/25',
    Icon: ArrowUpIcon
  },
  [FeeDirection.INTERNAL]: {
    className: 'bg-slate-100 text-slate-700 ring-slate-300',
    Icon: ArrowsLeftRightIcon
  }
}

export interface FeeDirectionBadgeProps {
  /** Suy chiều tiền từ loại dịch vụ. Bỏ qua khi đã truyền `direction`. */
  serviceType?: string | null
  direction?: FeeDirection | null
  /** Kèm tên loại dịch vụ dưới nhãn chiều — dùng trong ô bảng. */
  caption?: string
  className?: string
}

export const FeeDirectionBadge = ({
  serviceType,
  direction,
  caption,
  className
}: FeeDirectionBadgeProps) => {
  const resolved = direction ?? getFeeDirection(serviceType)

  if (!resolved) {
    return (
      <span className='text-muted-foreground' title='Không xác định chiều tiền'>
        —
      </span>
    )
  }

  const { className: tone, Icon } = DIRECTION_STYLE[resolved]

  const badge = (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5',
        'text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset',
        tone,
        className
      )}
      title={FEE_DIRECTION_HINT[resolved]}
    >
      <Icon size={12} weight='bold' />
      {FEE_DIRECTION_LABEL[resolved]}
    </span>
  )

  if (!caption) return badge

  return (
    <div className='flex flex-col gap-0.5'>
      {badge}
      <span className='text-xs text-muted-foreground'>{caption}</span>
    </div>
  )
}
