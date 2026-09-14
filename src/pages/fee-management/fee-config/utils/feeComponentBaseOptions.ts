const BASE_ON_OPTIONS = [
  { value: 'AMOUNT', label: 'Số tiền giao dịch' },
  { value: 'FEE_COMPONENT', label: 'Một thành phần phí khác' }
]

/** Miền Bank chỉ tính trên số tiền giao dịch. */
const AMOUNT_ONLY_BASE_ON_OPTIONS = [BASE_ON_OPTIONS[0]]

export const getBaseOnOptions = ({
  isBank,
  isVat,
  hasPrecedingComponents
}: {
  isBank: boolean
  isVat: boolean
  hasPrecedingComponents: boolean
}) =>
  isVat || (!isBank && hasPrecedingComponents)
    ? BASE_ON_OPTIONS
    : AMOUNT_ONLY_BASE_ON_OPTIONS
