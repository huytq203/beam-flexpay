export const GROSS_AMOUNT_BASE = 'GROSS_AMOUNT'
export const GROSS_AMOUNT_LABEL = 'Số tiền qua đối tác'
export const GROSS_AMOUNT_HELPER =
  'Nạp: số tiền bị trừ của khách (gồm phí nếu người gửi chịu). Rút: số tiền đối tác chuyển về thẻ.'

const BASE_ON_LABELS: Readonly<Record<string, string>> = {
  AMOUNT: 'Số tiền giao dịch',
  [GROSS_AMOUNT_BASE]: GROSS_AMOUNT_LABEL
}

/** Nhãn cơ sở tính của cơ sở không phải thành phần phí; undefined khi cơ sở là một thành phần khác. */
export const getAmountBaseLabel = (
  baseOn: string | null | undefined
): string | undefined => (baseOn ? BASE_ON_LABELS[baseOn] : undefined)

/** Cơ sở tính trực tiếp trên số tiền (không cần thành phần phí khác làm cơ sở). */
export const isAmountBase = (baseOn: string | null | undefined): boolean =>
  baseOn === 'AMOUNT' || baseOn === GROSS_AMOUNT_BASE

const GROSS_AMOUNT_SERVICE_TYPES: readonly string[] = [
  'EWALLET_DEPOSIT',
  'EWALLET_WITHDRAWAL'
]

/** Số tiền qua đối tác chỉ có nghĩa với chi phí đầu vào của nạp/rút ví. */
export const allowsGrossAmountBase = (
  serviceType: string | null | undefined,
  feeScope: string
): boolean =>
  feeScope === 'INPUT_COST' &&
  Boolean(serviceType) &&
  GROSS_AMOUNT_SERVICE_TYPES.includes(serviceType as string)

const BASE_ON_OPTIONS = [
  { value: 'AMOUNT', label: BASE_ON_LABELS.AMOUNT },
  { value: 'FEE_COMPONENT', label: 'Một thành phần phí khác' }
]

const GROSS_AMOUNT_OPTION = {
  value: GROSS_AMOUNT_BASE,
  label: GROSS_AMOUNT_LABEL
}

/** Miền Bank chỉ tính trên số tiền giao dịch. */
const AMOUNT_ONLY_BASE_ON_OPTIONS = [BASE_ON_OPTIONS[0]]

export const getBaseOnOptions = ({
  isBank,
  isVat,
  hasPrecedingComponents,
  allowGrossAmount = false
}: {
  isBank: boolean
  isVat: boolean
  hasPrecedingComponents: boolean
  /** Chi phí đầu vào của nạp/rút ví mới được tính trên số tiền qua đối tác. */
  allowGrossAmount?: boolean
}) => {
  const base =
    isVat || (!isBank && hasPrecedingComponents)
      ? BASE_ON_OPTIONS
      : AMOUNT_ONLY_BASE_ON_OPTIONS
  return allowGrossAmount && !isVat ? [...base, GROSS_AMOUNT_OPTION] : base
}
