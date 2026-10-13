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
  USER: 'Người dùng',
  MERCHANT: 'Merchant',
  SYSTEM: 'Hệ thống/platform',
  SENDER: 'Người gửi',
  RECEIVER: 'Người nhận'
}

/**
 * Chỉ chuyển tiền cần phân biệt người gửi và người nhận (ví → ví). Nạp và rút giữ
 * nhãn thường: khách hàng ở cả hai đầu nên không có hai bên để chọn.
 */
const TRANSFER_PAYER_LABEL: Readonly<Record<string, string>> = {
  USER: 'Người gửi',
  RECEIVER: 'Người nhận'
}

/**
 * Người chịu phí được phép chọn: chỉ đúng payer mà `FeeExecutionCapabilityRegistry`
 * thực thi được cho loại giao dịch (USER cho luồng ví, MERCHANT cho thu/chi hộ)
 * cùng SYSTEM cho chi phí đầu vào. Chuyển tiền cho chọn USER (người gửi, cộng
 * thêm vào số tiền chuyển) hoặc RECEIVER (trừ vào tiền người nhận nhận được).
 * Chưa chọn loại giao dịch thì mặc định USER.
 */
export const getPayerTypeOptions = (
  serviceType: string | null | undefined
): readonly { value: string; label: string }[] => {
  const payers = getSelectablePayers(serviceType)
  const labels =
    serviceType === 'EWALLET_TRANSFER_INTERNAL'
      ? { ...PAYER_TYPE_LABEL, ...TRANSFER_PAYER_LABEL }
      : PAYER_TYPE_LABEL
  return [
    ...(payers.length > 0 ? payers : ['USER']).map((payer) => ({
      value: payer,
      label: labels[payer] ?? payer
    })),
    { value: 'SYSTEM', label: PAYER_TYPE_LABEL.SYSTEM }
  ]
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

export const WALLET_FEE_BENEFICIARY_OPTIONS = [
  { value: 'SYSTEM', label: BENEFICIARY_TYPE_LABEL.SYSTEM }
] as const

export const INPUT_COST_BENEFICIARY_OPTIONS = [
  { value: 'BANK', label: BENEFICIARY_TYPE_LABEL.BANK },
  { value: 'PARTNER', label: BENEFICIARY_TYPE_LABEL.PARTNER }
] as const
