import { supportsBearerSplit } from '@utils/fee-execution'

interface BearerComponent {
  feeScope: string
  componentType: string
  baseOn: string
  baseComponentType?: string | null
  payerType: string
}

export const TRANSFER_BEARER_TYPES_MESSAGE =
  'Cả hai bên cùng chịu phí phải cùng loại phí: mỗi loại phí có một thành phần người gửi và một thành phần người nhận'
export const TRANSFER_BEARER_DEPENDENT_MESSAGE =
  'Phí phụ thuộc (ví dụ VAT) chỉ khai một dòng khi cả hai bên cùng chịu phí, hệ thống tự tính theo phí của từng bên'
export const TRANSFER_BEARER_BASE_MESSAGE =
  'Phí phụ thuộc phải tính trên loại phí có ở cả hai bên'

const isReceiver = (payerType: string) => payerType === 'RECEIVER'

/**
 * Bản sao phía FE của luật backend cho chuyển tiền. Người gửi chịu hoặc người nhận chịu: không
 * ràng buộc thêm. Cả hai bên cùng chịu: phí tính trên số tiền phải cùng loại ở hai bên, phí phụ
 * thuộc chỉ một dòng mỗi loại và phải dựa trên loại phí có ở cả hai bên.
 *
 * @returns thông báo lỗi, hoặc null nếu hợp lệ
 */
export const validateTransferBearers = (
  serviceType: string | null | undefined,
  components: readonly BearerComponent[]
): string | null => {
  if (!supportsBearerSplit(serviceType)) return null
  const output = components.filter((item) => item.feeScope === 'OUTPUT_FEE')
  const hasReceiver = output.some((item) => isReceiver(item.payerType))
  const hasSender = output.some((item) => !isReceiver(item.payerType))
  if (!hasReceiver || !hasSender) return null

  const sender = new Set<string>()
  const receiver = new Set<string>()
  const dependent = new Set<string>()
  for (const item of output) {
    if (item.baseOn === 'FEE_COMPONENT') {
      if (dependent.has(item.componentType)) {
        return TRANSFER_BEARER_DEPENDENT_MESSAGE
      }
      dependent.add(item.componentType)
    } else {
      ;(isReceiver(item.payerType) ? receiver : sender).add(item.componentType)
    }
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
