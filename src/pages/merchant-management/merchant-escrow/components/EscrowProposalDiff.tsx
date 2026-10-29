import { diffEscrowConfig, formatEscrowValue } from '../utils/escrowConfigDiff'
import type { EscrowConfig } from '../types/merchantEscrow.types'

/**
 * Bảng Tham số / Đang áp dụng / Đề xuất cho người duyệt. Đề xuất làm giảm bảo đảm thường nằm ở
 * trường phụ (tắt chuyển khoản, nới hạn, bỏ chặn thanh toán) chứ không phải mức tiền, nên chỉ
 * hiện mức tiền là không đủ để duyệt đúng.
 */
export function EscrowProposalDiff({
  current,
  proposal
}: {
  current: EscrowConfig | null
  proposal: EscrowConfig
}) {
  const rows = diffEscrowConfig(current, proposal)
  if (rows.length === 0)
    return (
      <p className='text-sm text-muted-foreground'>
        Đề xuất không khác cấu hình đang áp dụng.
      </p>
    )
  return (
    <table
      aria-label='Các tham số thay đổi'
      className='w-full text-left text-sm'
    >
      <thead className='text-xs text-muted-foreground'>
        <tr>
          <th className='py-1 pr-2 font-medium'>Tham số</th>
          <th className='py-1 pr-2 font-medium'>Đang áp dụng</th>
          <th className='py-1 pr-2 font-medium'>Đề xuất</th>
          <th className='py-1 font-medium' />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.parameter}
            className={`border-t border-border ${row.reducesProtection ? 'bg-warning/10' : ''}`}
          >
            <td className='py-1 pr-2'>{row.parameter}</td>
            <td className='py-1 pr-2 tabular-nums'>
              {current
                ? formatEscrowValue(row.parameter, row.oldValue)
                : 'Chưa có'}
            </td>
            <td className='py-1 pr-2 tabular-nums'>
              {formatEscrowValue(row.parameter, row.newValue)}
            </td>
            <td className='py-1'>
              {row.reducesProtection && (
                <span className='rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-strong'>
                  Giảm bảo đảm
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
