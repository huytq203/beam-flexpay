import {
  ArrowDownIcon,
  ArrowsLeftRightIcon,
  ArrowUpIcon,
  ScalesIcon
} from '@components/icons'
import SegmentedComponent from '@components/ui/segmented-component'
import { cn } from '@lib/utils/cn'
import { FEE_DIRECTION_HINT, FeeDirection } from '@utils/fee-direction'
import type { ReactNode } from 'react'

const ALL = 'ALL' as const
type FilterValue = FeeDirection | typeof ALL

const renderOption = (icon: ReactNode, label: string): ReactNode => (
  <span className='inline-flex items-center gap-1.5 px-1 py-0.5'>
    {icon}
    {label}
  </span>
)

const OPTIONS: readonly {
  value: FilterValue
  label: ReactNode
  title: string
}[] = [
  {
    value: ALL,
    label: renderOption(<ScalesIcon size={14} />, 'Tất cả'),
    title: 'Mọi chiều tiền'
  },
  {
    value: FeeDirection.IN,
    label: renderOption(<ArrowDownIcon size={14} weight='bold' />, 'Đầu vào'),
    title: FEE_DIRECTION_HINT[FeeDirection.IN]
  },
  {
    value: FeeDirection.OUT,
    label: renderOption(<ArrowUpIcon size={14} weight='bold' />, 'Đầu ra'),
    title: FEE_DIRECTION_HINT[FeeDirection.OUT]
  },
  {
    value: FeeDirection.INTERNAL,
    label: renderOption(<ArrowsLeftRightIcon size={14} />, 'Nội bộ'),
    title: FEE_DIRECTION_HINT[FeeDirection.INTERNAL]
  }
]

export interface FeeDirectionFilterProps {
  value: FeeDirection | null
  onChange: (next: FeeDirection | null) => void
  className?: string
}

export const FeeDirectionFilter = ({
  value,
  onChange,
  className
}: FeeDirectionFilterProps) => (
  <SegmentedComponent<FilterValue>
    ariaLabel='Lọc theo chiều tiền'
    value={value ?? ALL}
    options={[...OPTIONS]}
    onChange={(next) => onChange(next === ALL ? null : next)}
    className={cn('w-fit max-w-full overflow-x-auto', className)}
  />
)
