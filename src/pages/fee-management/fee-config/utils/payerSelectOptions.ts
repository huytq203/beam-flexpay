import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import { BOTH_BEARERS, RECEIVER_PAYER } from './bearerPairs'

export interface PayerOption {
  value: string
  label: string
}

export const BOTH_BEARERS_OPTION: PayerOption = {
  value: BOTH_BEARERS,
  label: 'Cả hai bên cùng chịu'
}

const sideOf = (payerType: string) =>
  payerType === RECEIVER_PAYER ? 'RECEIVER' : 'SENDER'

/**
 * VAT tính trên phí gốc và luôn do chính bên chịu phí gốc trả: backend tách dòng VAT theo bên của
 * phí gốc, và từ chối lúc duyệt nếu dòng VAT khai bên khác. Trả người chịu của phí gốc khi nó chỉ
 * nằm ở một bên; null khi ở cả hai bên (một dòng VAT cho cả hai) hoặc chưa có phí gốc phía trên.
 */
export const dependentPayerFor = (
  baseType: string | null | undefined,
  preceding: readonly FeeComponentFormValues[]
): string | null => {
  if (!baseType) return null
  const bases = preceding.filter(
    (component) =>
      component.feeScope === 'OUTPUT_FEE' &&
      component.baseOn === 'AMOUNT' &&
      component.componentType === baseType
  )
  const sides = new Set(bases.map((component) => sideOf(component.payerType)))
  return sides.size === 1 ? bases[0].payerType : null
}

/**
 * Phí gốc có ở cả hai bên: VAT khi đó chọn được "Cả hai bên" với mỗi bên một mức, hoặc chỉ một bên
 * (một dòng, tự áp cho cả hai bên). Phí gốc một bên thì VAT bị khoá theo bên đó (`dependentPayerFor`).
 */
export const hasBaseOnBothSides = (
  baseType: string | null | undefined,
  preceding: readonly FeeComponentFormValues[]
): boolean => {
  if (!baseType) return false
  const sides = new Set(
    preceding
      .filter(
        (component) =>
          component.feeScope === 'OUTPUT_FEE' &&
          component.baseOn === 'AMOUNT' &&
          component.componentType === baseType
      )
      .map((component) => sideOf(component.payerType))
  )
  return sides.size === 2
}

/** Người chịu bày trên hộp thoại: VAT khoá theo bên của phí gốc, phí thường thêm "Cả hai bên" khi tách được. */
export const buildPayerSelectOptions = (
  payerTypeOptions: readonly PayerOption[],
  canSplit: boolean,
  vatPayer: string | null
): PayerOption[] => {
  const locked = payerTypeOptions.filter(({ value }) => value === vatPayer)
  if (locked.length > 0) return locked
  return canSplit
    ? [...payerTypeOptions, BOTH_BEARERS_OPTION]
    : [...payerTypeOptions]
}

/** Dịch vụ mà người chuyển và người nhận không cấu hình riêng lẻ cạnh nhau. */
const ONE_SIDE_SERVICES: readonly string[] = [
  'EWALLET_TRANSFER_INTERNAL',
  'EWALLET_DEPOSIT',
  'EWALLET_WITHDRAWAL'
]

/**
 * Chuyển tiền, nạp, rút: đã có phí của một bên thì phí khác chỉ được thêm cho đúng bên đó, không cấu
 * hình bên còn lại riêng lẻ. Muốn cả hai bên thì chọn "Cả hai bên cùng chịu" (chỉ chuyển tiền), tạo ra
 * một cặp; đã có cặp thì phí mới cũng phải theo cặp. Phí phụ thuộc (VAT) và phí đầu vào không tính là
 * một bên: VAT đã khoá theo phí gốc.
 */
export const restrictPayerOptions = (
  serviceType: string | null | undefined,
  options: readonly PayerOption[],
  siblings: readonly FeeComponentFormValues[]
): PayerOption[] => {
  if (!serviceType || !ONE_SIDE_SERVICES.includes(serviceType)) {
    return [...options]
  }
  const sides = new Set(
    siblings
      .filter(
        (component) =>
          component.feeScope === 'OUTPUT_FEE' &&
          component.baseOn !== 'FEE_COMPONENT'
      )
      .map((component) => sideOf(component.payerType))
  )
  if (sides.size === 0) return [...options]
  if (sides.size === 1) {
    const [side] = sides
    return options.filter(
      ({ value }) => value !== BOTH_BEARERS && sideOf(value) === side
    )
  }
  const both = options.filter(({ value }) => value === BOTH_BEARERS)
  return both.length > 0 ? both : [...options]
}
