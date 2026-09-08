/**
 * Định dạng số tiền và công thức phí dùng chung cho module Phí và tab cấu hình
 * phí trong chi tiết ví. Mọi số tiền hiển thị đầy đủ chữ số (The Full Digit
 * Rule) — không rút gọn, không làm tròn để vừa cột.
 */
const FEE_NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 4
})

export const formatFeeNumber = (value: number): string =>
  FEE_NUMBER_FORMATTER.format(value)

/** Min/Max bằng 0 hoặc null đều mang nghĩa "không giới hạn". */
export const formatFeeLimit = (value: number | null | undefined): string =>
  value === null || value === undefined || value <= 0
    ? '—'
    : `${formatFeeNumber(value)} đ`

export const formatTierRange = (
  tierFrom: number | null,
  tierTo: number | null
): string => {
  if (tierFrom === null && tierTo === null) return 'Không chia bậc'
  if (tierFrom === null && tierTo !== null) {
    return `Đến ${formatFeeNumber(tierTo)}`
  }
  if (tierFrom !== null && tierTo === null) {
    return `${formatFeeNumber(tierFrom)} trở lên`
  }

  return tierFrom !== null && tierTo !== null
    ? `${formatFeeNumber(tierFrom)} – ${formatFeeNumber(tierTo)}`
    : 'Không chia bậc'
}

const hasValue = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && value > 0

export interface FeeAmountInput {
  calculationMethod?: string | number | null
  fixedAmount?: number | null
  percentage?: number | null
  tiers?: readonly unknown[] | null
}

/**
 * Mức phí của một thành phần, ở dạng đọc được trong một ô bảng.
 *
 * Thành phần chia bậc không quy về một con số được — mức phí phụ thuộc số tiền
 * giao dịch — nên trả về số bậc thay vì một con số giả. Đây là lý do bảng
 * thành phần phí không cộng tổng.
 */
export const formatFeeComponentAmount = (
  component: FeeAmountInput
): string => {
  const tierCount = component.tiers?.length ?? 0
  if (tierCount > 0) return `${tierCount} bậc`

  const parts: string[] = []
  const isTiered =
    component.calculationMethod === 'FLAT_TIER' ||
    component.calculationMethod === 'PROGRESSIVE_TIER'
  if (hasValue(component.fixedAmount)) {
    parts.push(`${formatFeeNumber(component.fixedAmount)} đ`)
  }
  if (hasValue(component.percentage)) {
    parts.push(`${formatFeeNumber(component.percentage)}%`)
  }

  if (parts.length > 0) return parts.join(' + ')

  return isTiered ? 'Theo bậc' : '—'
}
