import { supportsBearerSplit } from '@utils/fee-execution'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'

/** Giá trị tạm của ô Người chịu trong hộp thoại; khi lưu tách thành hai thành phần USER + RECEIVER. */
export const BOTH_BEARERS = 'BOTH'
export const BOTH_BEARERS_DUPLICATE_MESSAGE =
  'Người chuyển hoặc người nhận đã có thành phần cùng loại phí'
export const SENDER_PAYER = 'USER'
export const RECEIVER_PAYER = 'RECEIVER'

const isSender = (payerType: string) =>
  payerType === SENDER_PAYER || payerType === 'SENDER'

/**
 * Phí đầu ra tính trên số tiền tách theo hai bên. VAT (phí phụ thuộc) khai một dòng cho cả hai bên
 * hoặc mỗi bên một dòng với mức riêng, nên cặp VAT hai dòng cũng ghép thành một thẻ; các phí phụ
 * thuộc khác vẫn khai một dòng, khớp `validateTransferBearers`.
 */
export const canSplitBearers = (
  serviceType: string | null | undefined,
  component: Pick<FeeComponentFormValues, 'feeScope' | 'baseOn'> &
    Partial<Pick<FeeComponentFormValues, 'componentType'>>,
  originalTransactionType?: string | null
): boolean =>
  supportsBearerSplit(serviceType, originalTransactionType) &&
  component.feeScope === 'OUTPUT_FEE' &&
  (component.baseOn === 'AMOUNT' ||
    (component.baseOn === 'FEE_COMPONENT' && component.componentType === 'VAT'))

/**
 * Vị trí thành phần cùng loại phí của bên còn lại, hoặc null nếu thành phần này đứng một mình.
 * Hai thành phần ghép cặp hiện thành một thẻ và mở cùng một hộp thoại.
 */
export const findBearerPartner = (
  serviceType: string | null | undefined,
  components: readonly FeeComponentFormValues[],
  index: number,
  originalTransactionType?: string | null
): number | null => {
  const current = components[index]
  const canSplit = (component: FeeComponentFormValues) =>
    canSplitBearers(serviceType, component, originalTransactionType)
  if (!current || !canSplit(current)) return null
  const wantSender = current.payerType === RECEIVER_PAYER
  if (!wantSender && !isSender(current.payerType)) return null
  const partner = components.findIndex(
    (other, otherIndex) =>
      otherIndex !== index &&
      canSplit(other) &&
      other.componentType === current.componentType &&
      other.beneficiaryType === current.beneficiaryType &&
      (wantSender
        ? isSender(other.payerType)
        : other.payerType === RECEIVER_PAYER)
  )
  return partner === -1 ? null : partner
}

export interface ComponentGroup {
  /** Thành phần người chuyển nếu là cặp, ngược lại là chính thành phần đó. */
  primary: number
  /** Thành phần người nhận của cặp. */
  partner: number | null
}

/** Gom các vị trí cùng luồng thành nhóm hiển thị, giữ thứ tự xuất hiện. */
export const groupBearerPairs = (
  serviceType: string | null | undefined,
  components: readonly FeeComponentFormValues[],
  indexes: readonly number[],
  originalTransactionType?: string | null
): ComponentGroup[] => {
  const used = new Set<number>()
  const groups: ComponentGroup[] = []
  for (const index of indexes) {
    if (used.has(index)) continue
    const partner = findBearerPartner(
      serviceType,
      components,
      index,
      originalTransactionType
    )
    used.add(index)
    if (partner === null || used.has(partner)) {
      groups.push({ primary: index, partner: null })
      continue
    }
    used.add(partner)
    const senderFirst = isSender(components[index].payerType)
    groups.push(
      senderFirst
        ? { primary: index, partner }
        : { primary: partner, partner: index }
    )
  }
  return groups
}
