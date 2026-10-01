import { COMPONENT_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import { formatFeeNumber } from '@utils/fee-format'
import {
  CalculationMethod,
  usesTiers,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'

/** Nhãn công thức tính, dùng chung cho thẻ thành phần và phần xem trước. */
export const CALCULATION_METHOD_LABEL: Readonly<Record<string, string>> = {
  [CalculationMethod.DIRECT]: 'Mặc định',
  [CalculationMethod.FLAT_TIER]: 'Toàn phần',
  [CalculationMethod.PROGRESSIVE_TIER]: 'Lũy tiến',
  [CalculationMethod.FREE]: 'Miễn phí'
}

/** Công thức của một thành phần, gọn đủ để nằm trong một dòng chọn. */
export const describeFormula = (component: FeeComponentFormValues): string => {
  if (component.calculationMethod === CalculationMethod.FREE) return 'Miễn phí'
  if (usesTiers(component.calculationMethod)) {
    return `${component.tiers.length} bậc`
  }

  const parts: string[] = []
  const percentage = component.percentage ?? 0
  const fixedAmount = component.fixedAmount ?? 0
  if (percentage > 0) parts.push(`${formatFeeNumber(percentage)}%`)
  if (fixedAmount > 0) parts.push(`${formatFeeNumber(fixedAmount)} đ`)
  // Không đặt mức nào nghĩa là thành phần này không thu tiền.
  return parts.length > 0 ? parts.join(' + ') : 'Miễn phí'
}

export interface BaseTypeSummary {
  readonly type: string
  readonly label: string
  /** Các thành phần thuộc loại này, theo đúng thứ tự tính. */
  readonly components: readonly FeeComponentFormValues[]
  /** Công thức rút gọn của từng thành phần, dùng cho nhãn ô chọn. */
  readonly formulas: readonly string[]
  /** Có nhiều hơn một thành phần cùng loại, nên cơ sở tính là tổng của chúng. */
  readonly isSum: boolean
}

/**
 * Tóm tắt một loại phí được dùng làm cơ sở tính.
 *
 * Backend gom kết quả theo LOẠI, không theo từng thành phần: nó cộng dồn mọi
 * thành phần cùng loại rồi mới cho thành phần sau tra vào. Nên khi một loại có
 * hai thành phần, không có cái nào để "chọn" — cơ sở tính là tổng của cả hai,
 * và màn phải nói đúng điều đó thay vì bày ra một lựa chọn không tồn tại.
 */
export const summariseBaseType = (
  type: string,
  preceding: readonly FeeComponentFormValues[],
  payerType?: string
): BaseTypeSummary => {
  const matching = preceding.filter(
    (component) =>
      component.componentType === type &&
      (!payerType ||
        (component.payerType === 'SYSTEM') === (payerType === 'SYSTEM'))
  )

  return {
    type,
    label: getFeeLabel(type, COMPONENT_TYPE_LABELS),
    components: matching,
    formulas: matching.map(describeFormula),
    isSum: matching.length > 1
  }
}

/** Các loại phí đã xuất hiện phía trên, giữ nguyên thứ tự lần đầu gặp. */
export const collectBaseTypes = (
  preceding: readonly FeeComponentFormValues[],
  payerType?: string
): readonly string[] => [
  ...new Set(
    preceding
      .filter(
        (component) =>
          !payerType ||
          (component.payerType === 'SYSTEM') === (payerType === 'SYSTEM')
      )
      .map((component) => component.componentType)
      .filter((type) => type.length > 0)
  )
]
