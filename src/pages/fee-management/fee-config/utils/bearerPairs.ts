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
 * Chỉ phí đầu ra tính trên số tiền mới tách theo hai bên; phí phụ thuộc (VAT) khai một dòng và
 * backend tự chia theo phí của từng bên, khớp `validateTransferBearers`.
 */
export const canSplitBearers = (
  serviceType: string | null | undefined,
  component: Pick<FeeComponentFormValues, 'feeScope' | 'baseOn'>
): boolean =>
  supportsBearerSplit(serviceType) &&
  component.feeScope === 'OUTPUT_FEE' &&
  component.baseOn === 'AMOUNT'

/**
 * Vị trí thành phần cùng loại phí của bên còn lại, hoặc null nếu thành phần này đứng một mình.
 * Hai thành phần ghép cặp hiện thành một thẻ và mở cùng một hộp thoại.
 */
export const findBearerPartner = (
  serviceType: string | null | undefined,
  components: readonly FeeComponentFormValues[],
  index: number
): number | null => {
  const current = components[index]
  if (!current || !canSplitBearers(serviceType, current)) return null
  const wantSender = current.payerType === RECEIVER_PAYER
  if (!wantSender && !isSender(current.payerType)) return null
  const partner = components.findIndex(
    (other, otherIndex) =>
      otherIndex !== index &&
      canSplitBearers(serviceType, other) &&
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
  indexes: readonly number[]
): ComponentGroup[] => {
  const used = new Set<number>()
  const groups: ComponentGroup[] = []
  for (const index of indexes) {
    if (used.has(index)) continue
    const partner = findBearerPartner(serviceType, components, index)
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
