import type { WalletLimitSpecialMonth } from '@type/walletLimit.type'
import { useScreenAccess } from '@/app/permissions'
import { cn } from '@lib/utils/cn'
import { CardComponent } from '@components/index'
import {
  buildCalendarCells,
  type CalendarCell
} from '../utils/specialMonth.utils'

interface SpecialMonthCalendarProps {
  year: number
  months: readonly WalletLimitSpecialMonth[]
  isReady: boolean
  onAdd: (monthKey: string) => void
}

const CELL_BASE =
  'flex min-h-16 min-w-0 flex-col justify-between gap-1 rounded-lg border p-2 text-left'

const LEGEND = [
  { label: 'Tháng đặc biệt', className: 'border-primary bg-primary' },
  { label: 'Đã qua', className: 'border-border bg-muted' },
  { label: 'Còn trống, bấm để thêm', className: 'border-dashed border-border' },
  { label: 'Tháng hiện tại', className: 'border-border ring-2 ring-foreground' }
]

interface CellProps {
  cell: CalendarCell
  canAdd: boolean
  onAdd: (monthKey: string) => void
}

function CalendarCellView({ cell, canAdd, onAdd }: CellProps) {
  const { month, isPast, isCurrent, number, key } = cell
  const title = `T${number}`
  const ring = isCurrent && 'ring-2 ring-foreground'

  if (month) {
    return (
      <div
        title={month.name}
        className={cn(
          CELL_BASE,
          isPast
            ? 'border-border bg-muted text-muted-foreground'
            : 'border-primary bg-primary text-primary-foreground',
          ring
        )}
      >
        <b className='text-[11px] tracking-wider'>{title}</b>
        <span className='line-clamp-2 text-[11px] leading-[14px] break-words'>
          {month.name}
        </span>
      </div>
    )
  }
  if (isPast || !canAdd) {
    return (
      <div
        className={cn(
          CELL_BASE,
          'border-dashed border-border text-muted-foreground',
          isPast && 'opacity-55',
          ring
        )}
      >
        <b className='text-[11px] tracking-wider'>{title}</b>
      </div>
    )
  }
  return (
    <button
      type='button'
      aria-label={`Thêm tháng ${String(number).padStart(2, '0')}/${key.slice(0, 4)}`}
      onClick={() => onAdd(key)}
      className={cn(
        CELL_BASE,
        'cursor-pointer border-dashed border-border text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-foreground',
        ring
      )}
    >
      <b className='text-[11px] tracking-wider'>{title}</b>
      <span className='text-[11px]'>+ Thêm</span>
    </button>
  )
}

export function SpecialMonthCalendar({
  year,
  months,
  isReady,
  onAdd
}: SpecialMonthCalendarProps) {
  const { can } = useScreenAccess('WALLET_LIMIT_SPECIAL_MONTH')
  const cells = buildCalendarCells(year, months)
  const count = cells.filter((cell) => cell.month).length

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-base font-bold'>
          Lịch năm <span className='tabular-nums'>{year}</span>
        </h2>
        {isReady && (
          <span className='text-xs text-muted-foreground'>
            {count} trong 12 tháng
          </span>
        )}
      </div>
      <div className='grid grid-cols-6 gap-2 md:grid-cols-12'>
        {cells.map((cell) => (
          <CalendarCellView
            key={cell.key}
            cell={cell}
            canAdd={can('create')}
            onAdd={onAdd}
          />
        ))}
      </div>
      <ul className='mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
        {LEGEND.map((item) => (
          <li
            key={item.label}
            className='flex items-center gap-2'
          >
            <i
              className={cn(
                'inline-block size-2.5 rounded-sm border',
                item.className
              )}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </CardComponent>
  )
}
