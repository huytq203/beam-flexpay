import { PAYMENT_METHOD_LABELS } from '@constants/feeLabels'
import { formatFeeNumber } from '@utils/fee-format'
import { marginClassName } from '../utils/reportFilters'

export const money = (value: number) => `${formatFeeNumber(value)} đ`
export const moneyCell = (value: number) => <span>{money(value)}</span>
export const marginCell = (value: number) => (
  <span
    className={marginClassName(value)}
    data-negative={value < 0 ? 'true' : undefined}
  >
    {money(value)}
  </span>
)
export const methodLabel = (value?: string | null) =>
  value ? (PAYMENT_METHOD_LABELS[value] ?? value) : '—'

