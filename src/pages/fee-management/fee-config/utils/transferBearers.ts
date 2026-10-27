import { supportsBearerSplit } from '@utils/fee-execution'

interface BearerComponent {
  feeScope: string
  componentType: string
  baseOn: string
  baseComponentType?: string | null
  payerType: string
}

export const TRANSFER_BEARER_TYPES_MESSAGE =
  'Cả hai bên cùng chịu phí phải cùng loại phí: mỗi loại phí có một thành phần người chuyển và một thành phần người nhận'
export const TRANSFER_BEARER_DEPENDENT_MESSAGE =
  'Phí phụ thuộc (ví dụ VAT) khi cả hai bên cùng chịu phí: khai một dòng cho cả hai bên, hoặc hai dòng mỗi bên một dòng (mỗi bên một mức); không khai hai dòng cùng một bên'
export const TRANSFER_BEARER_BASE_MESSAGE =
  'Phí phụ thuộc phải tính trên loại phí có ở cả hai bên'
export const TRANSFER_BEARER_DEPENDENT_SIDE_MESSAGE =
  'VAT (phí phụ thuộc) phải cùng người chịu với phí gốc: phí gốc chỉ một bên chịu thì VAT cũng do đúng bên đó chịu'

export const ONE_SIDE_BEARER_MESSAGE =
  'Nạp tiền và rút tiền chỉ cấu hình phí cho một bên chịu (người chuyển hoặc người nhận), không cấu hình cả hai'

const ONE_SIDE_SERVICES: readonly string[] = [
  'EWALLET_DEPOSIT',
  'EWALLET_WITHDRAWAL'
]

const isReceiver = (payerType: string) => payerType === 'RECEIVER'

/**
 * Bản sao phía FE của luật backend cho các luồng cho cả hai bên cùng chịu (`supportsBearerSplit`).
 * Người chuyển chịu hoặc người nhận chịu: không ràng buộc thêm. Cả hai bên cùng chịu: phí tính trên số tiền phải cùng loại ở hai bên, phí phụ
 * thuộc một dòng cho cả hai bên hoặc mỗi bên một dòng, và phải dựa trên loại phí có ở cả hai bên.
 *
 * @returns thông báo lỗi, hoặc null nếu hợp lệ
 */
export const validateTransferBearers = (
  serviceType: string | null | undefined,
  components: readonly BearerComponent[],
  originalTransactionType?: string | null
): string | null => {
  const output = components.filter((item) => item.feeScope === 'OUTPUT_FEE')
  if (serviceType && ONE_SIDE_SERVICES.includes(serviceType)) {
    // Đổi loại giao dịch giữ nguyên thành phần cũ, nên cặp hai bên của chuyển tiền có thể còn sót lại.
    return output.some((item) => isReceiver(item.payerType)) &&
      output.some((item) => !isReceiver(item.payerType))
      ? ONE_SIDE_BEARER_MESSAGE
      : null
  }
  if (!supportsBearerSplit(serviceType, originalTransactionType)) return null
  const hasReceiver = output.some((item) => isReceiver(item.payerType))
  const hasSender = output.some((item) => !isReceiver(item.payerType))
  if (!hasReceiver || !hasSender) return null

  const sender = new Set<string>()
  const receiver = new Set<string>()
  const dependent = new Set<string>()
  const dependentSides = new Set<string>()
  for (const item of output) {
    if (item.baseOn === 'FEE_COMPONENT') {
      // Một dòng áp cho cả hai bên; hai dòng thì mỗi bên một dòng với mức riêng. Hai dòng cùng bên là
      // tính phí phụ thuộc hai lần.
      const sideKey = `${item.componentType}:${isReceiver(item.payerType)}`
      if (dependentSides.has(sideKey)) {
        return TRANSFER_BEARER_DEPENDENT_MESSAGE
      }
      dependentSides.add(sideKey)
      dependent.add(item.componentType)
    } else {
      ;(isReceiver(item.payerType) ? receiver : sender).add(item.componentType)
    }
  }
  // Một bên chỉ có VAT mà không có phí gốc: VAT khai sai bên, không phải cả hai bên cùng chịu.
  if (sender.size === 0 || receiver.size === 0) {
    return TRANSFER_BEARER_DEPENDENT_SIDE_MESSAGE
  }
  const sameTypes =
    sender.size === receiver.size &&
    [...sender].every((type) => receiver.has(type))
  if (!sameTypes) return TRANSFER_BEARER_TYPES_MESSAGE

  const available = new Set([...sender, ...dependent])
  const missingBase = output.some(
    (item) =>
      item.baseOn === 'FEE_COMPONENT' &&
      !available.has((item.baseComponentType ?? '').toUpperCase())
  )
  return missingBase ? TRANSFER_BEARER_BASE_MESSAGE : null
}
