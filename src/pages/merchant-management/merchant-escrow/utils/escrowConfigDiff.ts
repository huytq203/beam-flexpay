import { formatCurrency } from '@utils/formatNumber'
import {
  ESCROW_OVERDUE_ACTION_LABEL,
  ESCROW_REQUIREMENT_MODE_LABEL,
  ESCROW_REVIEW_CYCLE_LABEL
} from '../constants/merchantEscrow.constants'
import type { EscrowConfig } from '../types/merchantEscrow.types'

/** Các tham số có giá trị là số tiền (tên theo đúng chuỗi BE trả ở preview). */
const MONEY_PARAMETERS = new Set([
  'Mức ký quỹ yêu cầu',
  'Mức tối thiểu',
  'Mức tối đa'
])

const ENUM_LABEL: Record<string, string> = {
  ...ESCROW_REQUIREMENT_MODE_LABEL,
  ...ESCROW_REVIEW_CYCLE_LABEL,
  ...ESCROW_OVERDUE_ACTION_LABEL,
  true: 'Có',
  false: 'Không'
}

/** Giá trị cũ/mới dạng chuỗi thô (`"true"`, `"FIXED"`, số tiền) -> nhãn đọc được. */
export const formatEscrowValue = (
  parameter: string,
  value: string | null
): string => {
  if (value === null) return '—'
  if (MONEY_PARAMETERS.has(parameter) && /^-?\d+$/.test(value))
    return formatCurrency(Number(value))
  return ENUM_LABEL[value] ?? value
}

export interface EscrowDiffRow {
  parameter: string
  oldValue: string | null
  newValue: string | null
  /** True khi thay đổi này làm giảm mức bảo đảm (cùng quy tắc với BE). */
  reducesProtection: boolean
}

const str = (value: unknown): string | null =>
  value === null || value === undefined ? null : String(value)

/**
 * So đề xuất chờ duyệt với cấu hình đang áp dụng, chỉ trả các tham số khác nhau.
 * Quy tắc "giảm bảo đảm" lặp lại MerchantEscrowConfigService.candidate() của BE: giảm mức yêu
 * cầu, tắt chuyển khoản/cấn trừ đang bật, nới thời hạn, hạ BLOCK_PAYMENTS xuống WARN_ONLY. BE
 * không trả cờ theo từng trường cho đề xuất đã lưu, nên người duyệt cần FE chỉ ra trường nào.
 * Chưa có cấu hình đang áp dụng (`current` null) thì không có gì để gọi là "giảm".
 */
export function diffEscrowConfig(
  current: EscrowConfig | null,
  proposal: EscrowConfig
): EscrowDiffRow[] {
  const rows: EscrowDiffRow[] = []
  const add = (
    parameter: string,
    oldValue: unknown,
    newValue: unknown,
    reduces: boolean
  ) => {
    const before = current ? str(oldValue) : null
    const after = str(newValue)
    if (before === after) return
    rows.push({
      parameter,
      oldValue: before,
      newValue: after,
      reducesProtection: current !== null && reduces
    })
  }

  add(
    'Mức ký quỹ yêu cầu',
    current?.requiredAmount,
    proposal.requiredAmount,
    proposal.requiredAmount < (current?.requiredAmount ?? 0)
  )
  add(
    'Cách xác định mức',
    current?.requirementMode,
    proposal.requirementMode,
    false
  )
  add(
    'Cho phép nạp bằng chuyển khoản',
    current?.allowTransfer,
    proposal.allowTransfer,
    current?.allowTransfer === true && !proposal.allowTransfer
  )
  add(
    'Cho phép cấn trừ tại lệnh rút',
    current?.allowSetoff,
    proposal.allowSetoff,
    current?.allowSetoff === true && !proposal.allowSetoff
  )
  add(
    'Thời hạn phải đủ ký quỹ (ngày)',
    current?.deadlineDays,
    proposal.deadlineDays,
    proposal.deadlineDays > (current?.deadlineDays ?? Infinity)
  )
  add(
    'Cảnh báo trước hạn (ngày)',
    current?.reminderDays,
    proposal.reminderDays,
    false
  )
  add(
    'Xử lý khi quá hạn',
    current?.overdueAction,
    proposal.overdueAction,
    current?.overdueAction === 'BLOCK_PAYMENTS' &&
      proposal.overdueAction === 'WARN_ONLY'
  )
  // Tham số theo doanh thu chỉ có nghĩa khi đề xuất dùng AVERAGE_REVENUE.
  if (proposal.requirementMode === 'AVERAGE_REVENUE') {
    add('Số ngày doanh thu', current?.revenueDays, proposal.revenueDays, false)
    add('Mức tối thiểu', current?.minAmount, proposal.minAmount, false)
    add('Mức tối đa', current?.maxAmount, proposal.maxAmount, false)
    add('Chu kỳ soát xét', current?.reviewCycle, proposal.reviewCycle, false)
  }
  return rows
}
