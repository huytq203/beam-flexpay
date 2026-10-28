import {
  BENEFICIARY_TYPE_LABEL,
  getMerchantCounterpartyLabel,
  PAYER_TYPE_LABEL
} from '@pages/fee-management/fee-config/constants/feeComponentParties'

/** Người chịu của một thành phần phí; "Người dùng" cũng là cách gọi cũ của người chuyển. */
export const PAYER_TYPE_FILTER_OPTIONS = [
  { value: 'USER', label: PAYER_TYPE_LABEL.USER },
  { value: 'RECEIVER', label: PAYER_TYPE_LABEL.RECEIVER },
  { value: 'MERCHANT', label: PAYER_TYPE_LABEL.MERCHANT },
  { value: 'SYSTEM', label: PAYER_TYPE_LABEL.SYSTEM }
] as const

/** Màn ĐVCNTT: hai bên của thu hộ / chi hộ là Merchant và người nộp / nhận tiền theo tab đang chọn. */
export const getMerchantPayerFilterOptions = (
  serviceType: string | undefined
) => [
  { value: 'MERCHANT', label: 'Merchant' },
  { value: 'USER', label: getMerchantCounterpartyLabel(serviceType) }
]

export const BENEFICIARY_TYPE_FILTER_OPTIONS = Object.entries(
  BENEFICIARY_TYPE_LABEL
).map(([value, label]) => ({ value, label }))

/** Bên chịu phí chuyển tiền; chọn là chỉ còn chính sách chuyển tiền. */
export const FEE_BEARER_FILTER_OPTIONS = [
  { value: 'SENDER', label: 'Chỉ người chuyển chịu' },
  { value: 'RECEIVER', label: 'Chỉ người nhận chịu' },
  { value: 'BOTH', label: 'Cả hai bên cùng chịu' }
] as const
