import {
  EXECUTABLE_BENEFICIARIES,
  getSelectablePayers
} from '@utils/fee-execution'

/**
 * Nhãn cho đủ năm giá trị enum `PayerType` của backend. Chỉ dùng để HIỂN THỊ
 * (kể cả dữ liệu cũ đã lưu SENDER/RECEIVER/SYSTEM); lựa chọn trên form lấy từ
 * `getPayerTypeOptions`.
 */
export const PAYER_TYPE_LABEL: Readonly<Record<string, string>> = {
  USER: 'Người chuyển',
  MERCHANT: 'Merchant',
  SYSTEM: 'Hệ thống/platform',
  SENDER: 'Người chuyển',
  RECEIVER: 'Người nhận'
}

/**
 * Dịch vụ ví đều có người chuyển và người nhận (nạp: bank → ví, rút: ví → bank,
 * chuyển: ví → ví), nên nhãn chỉ cần nói Người chuyển / Người nhận. `USER` là cách
 * gọi cũ của người chuyển.
 */
const WALLET_FLOW_PAYER_LABEL: Readonly<Record<string, string>> = {
  USER: 'Người chuyển',
  RECEIVER: 'Người nhận'
}

const WALLET_FLOW_SERVICES: readonly string[] = [
  'EWALLET_DEPOSIT',
  'EWALLET_WITHDRAWAL',
  'EWALLET_TRANSFER_INTERNAL'
]

/**
 * Nhãn riêng theo loại giao dịch, chỉ để HIỂN THỊ — giá trị gửi backend không đổi.
 * Rút tiền và hoàn tiền: phí trừ vào số tiền bên nhận nhận được (rút 1.000.000 thì
 * ngân hàng nhận 999.000, phí 1.000), nên người vận hành gọi bên chịu phí là
 * "Người nhận" dù backend vẫn lưu `USER`/`SENDER`.
 */
const SERVICE_PAYER_LABEL: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  EWALLET_WITHDRAWAL: { USER: 'Người nhận', SENDER: 'Người nhận' },
  // Hoàn tiền: phí trừ vào số tiền khách thực nhận được hoàn về.
  EWALLET_REFUND: { USER: 'Người nhận', SENDER: 'Người nhận' }
}

/** Nhãn người chịu phí của một thành phần, theo đúng loại giao dịch của chính sách. */
export const getPayerLabel = (
  payerType: string,
  serviceType?: string | null
): string => {
  const override = serviceType
    ? SERVICE_PAYER_LABEL[serviceType]?.[payerType]
    : undefined
  if (override) return override
  const labels =
    serviceType && WALLET_FLOW_SERVICES.includes(serviceType)
      ? { ...PAYER_TYPE_LABEL, ...WALLET_FLOW_PAYER_LABEL }
      : PAYER_TYPE_LABEL
  return labels[payerType] ?? payerType
}

/**
 * Người chịu phí được phép chọn: chỉ đúng payer mà `FeeExecutionCapabilityRegistry`
 * thực thi được cho loại giao dịch (USER cho luồng ví, MERCHANT cho thu/chi hộ)
 * cùng SYSTEM cho chi phí đầu vào. Chuyển tiền cho chọn USER (người chuyển, cộng
 * thêm vào số tiền chuyển) hoặc RECEIVER (trừ vào tiền người nhận nhận được).
 * Chưa chọn loại giao dịch thì mặc định USER.
 */
export const getPayerTypeOptions = (
  serviceType: string | null | undefined
): readonly { value: string; label: string }[] => {
  const payers = getSelectablePayers(serviceType)
  return [
    ...(payers.length > 0 ? payers : ['USER']).map((payer) => ({
      value: payer,
      label: getPayerLabel(payer, serviceType)
    })),
    { value: 'SYSTEM', label: PAYER_TYPE_LABEL.SYSTEM }
  ]
}

// Tạm chưa mở Merchant cho chọn tay; dịch vụ merchant vẫn có MERCHANT làm mặc định.
const OUTPUT_PAYERS: readonly string[] = ['USER', 'RECEIVER']

/**
 * Người chịu phí đầu ra trên hộp thoại: payer theo loại giao dịch đứng đầu làm giá trị mặc định,
 * các payer còn lại vẫn cho chọn để người vận hành tự sửa. Bỏ payer trùng nhãn (rút tiền gọi cả
 * USER lẫn RECEIVER là "Người nhận") để danh sách không có hai dòng giống hệt nhau.
 */
export const getOutputPayerOptions = (
  serviceType: string | null | undefined
): { value: string; label: string }[] => {
  const defaults = getSelectablePayers(serviceType)
  const ordered = [...(defaults.length > 0 ? defaults : ['USER'])]
  OUTPUT_PAYERS.forEach((payer) => {
    if (!ordered.includes(payer)) ordered.push(payer)
  })
  const seenLabels = new Set<string>()
  return ordered.flatMap((payer) => {
    const label = getPayerLabel(payer, serviceType)
    if (seenLabels.has(label)) return []
    seenLabels.add(label)
    return [{ value: payer, label }]
  })
}

export const BENEFICIARY_TYPE_LABEL: Readonly<Record<string, string>> = {
  SYSTEM: 'Hệ thống',
  MERCHANT: 'Merchant',
  BANK: 'Ngân hàng',
  PARTNER: 'Đối tác',
  TAX: 'Cơ quan thuế'
}

/**
 * Người hưởng phí mà downstream ghi sổ được. BANK chỉ là nhãn báo cáo — bút
 * toán vẫn về doanh thu của SYSTEM, chưa có luồng tách sổ hay trả tiền tự
 * động cho ngân hàng. Đổi ở BE (`FeeExecutionCapabilityRegistry`) thì đổi
 * `EXECUTABLE_BENEFICIARIES` ở `fee-execution.ts` trước, danh sách này tự
 * theo.
 */
export const BENEFICIARY_TYPE_OPTIONS = EXECUTABLE_BENEFICIARIES.map(
  (value) => ({
    value,
    label: BENEFICIARY_TYPE_LABEL[value] ?? value
  })
)

export const INPUT_COST_BENEFICIARY_OPTIONS = [
  { value: 'BANK', label: BENEFICIARY_TYPE_LABEL.BANK },
  { value: 'PARTNER', label: BENEFICIARY_TYPE_LABEL.PARTNER }
] as const
