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
