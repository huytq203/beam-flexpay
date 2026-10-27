import { ACCESS_TYPE_LABEL } from '../constants/rolePermissionMatrix.constants'
import type { AdminAccessType } from '../types/rolePermissionMatrix.types'

const LEGEND_SYMBOLS: Array<[string, AdminAccessType]> = [
  ['R', 'READ'],
  ['C', 'CREATE'],
  ['U', 'UPDATE'],
  ['D', 'DELETE'],
  ['A', 'APPROVE'],
  ['E', 'EXPORT']
]

const BADGE = 'rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold'

/** Chú thích dùng đúng huy hiệu như trong ô của bảng để đọc đối chiếu được ngay. */
export function MatrixLegend() {
  return (
    <ul
      aria-label='Chú thích ký hiệu'
      className='m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground'
    >
      {LEGEND_SYMBOLS.map(([symbol, type]) => (
        <li
          key={symbol}
          className='flex items-center gap-1.5'
        >
          <span className={BADGE}>{symbol}</span>
          {ACCESS_TYPE_LABEL[type]}
        </li>
      ))}
      <li className='flex items-center gap-1.5'>
        <span className='px-1.5 font-semibold'>-</span>
        Không có quyền
      </li>
      <li className='flex items-center gap-1.5'>
        <span className='font-normal text-warning-strong'>(Assigned)</span>
        Chỉ áp dụng trên merchant được gán cho chính người dùng
      </li>
    </ul>
  )
}
