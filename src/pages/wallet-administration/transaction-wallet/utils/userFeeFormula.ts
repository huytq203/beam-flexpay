import type {
  TransactionFeeDetail,
  TransactionProfit
} from '@type/apiResponseJournal'

export type FeeBearer = 'SENDER' | 'RECEIVER' | 'BOTH'

/** Phần chung giữa cấu phần của fee service và breakdown cũ của profit. */
interface FeePart {
  componentType: string | null
  percentage: number | null
  fixedAmount: number | null
  payerType?: string | null
}

const SENDER_PAYERS = new Set(['USER', 'SENDER'])
const MISSING_FORMULA = 'Chưa có chi tiết cấu phần phí'

const sum = (values: (number | null)[]): number =>
  values.reduce<number>((total, value) => total + (value ?? 0), 0)

const number = (value: number): string =>
  value.toLocaleString('en-US', { maximumFractionDigits: 4 })

/** Luôn đủ ba vế "Phí % + Phí cố định + VAT", vế nào không có thì ghi 0. */
const composeFormula = (parts: readonly FeePart[], currency: string) => {
  const isVat = (part: FeePart): boolean => part.componentType === 'VAT'
  const fees = parts.filter((part) => !isVat(part))
  const percentage = sum(fees.map((part) => part.percentage))
  const fixed = sum(fees.map((part) => part.fixedAmount))
  const vat = sum(parts.filter(isVat).map((part) => part.percentage))
  return `Phí ${number(percentage)}% + Phí cố định ${number(fixed)} ${currency} + VAT ${number(vat)}%`
}

/** Fee service ưu tiên hơn breakdown cũ của profit. */
const feePartsOf = (
  profit?: TransactionProfit | null,
  feeDetail?: TransactionFeeDetail | null
): FeePart[] => {
  if (feeDetail) return feeDetail.components
  return profit?.feeBreakdownAvailable ? profit.userFeeBreakdown : []
}

const formulaOf = (
  parts: readonly FeePart[] | undefined,
  amount: number,
  currency: string,
  fallback?: string | null
): string => {
  if (parts && parts.length > 0) return composeFormula(parts, currency)
  if (amount === 0) return composeFormula([], currency)
  return fallback ?? MISSING_FORMULA
}

interface FormulaInput {
  profit?: TransactionProfit | null
  feeDetail?: TransactionFeeDetail | null
  currency: string
}

export const totalFeeFormula = (
  amount: number,
  { profit, feeDetail, currency }: FormulaInput
): string =>
  formulaOf(feePartsOf(profit, feeDetail), amount, currency, feeDetail?.formula)

/** Chia cấu phần về đúng bên trả; cả hai bên chịu mà thiếu payerType thì không đoán. */
const splitParts = (
  parts: FeePart[],
  bearer: FeeBearer
): { sender?: FeePart[]; receiver?: FeePart[] } => {
  if (bearer === 'SENDER') return { sender: parts, receiver: [] }
  if (bearer === 'RECEIVER') return { sender: [], receiver: parts }
  if (parts.some((part) => !part.payerType)) return {}
  const isSender = (part: FeePart): boolean =>
    SENDER_PAYERS.has(part.payerType ?? '')
  return {
    sender: parts.filter(isSender),
    receiver: parts.filter((part) => !isSender(part))
  }
}

const sideFallback = (
  feeDetail: TransactionFeeDetail | null | undefined,
  side: 'SENDER' | 'RECEIVER'
): string | undefined =>
  feeDetail?.sides.find((item) => item.payerType === side)?.formula

export const sideFeeFormulas = (
  bearer: FeeBearer,
  fees: { sender: number; receiver: number },
  { profit, feeDetail, currency }: FormulaInput
): { sender: string; receiver: string } => {
  const parts = splitParts(feePartsOf(profit, feeDetail), bearer)
  return {
    sender: formulaOf(
      parts.sender,
      fees.sender,
      currency,
      sideFallback(feeDetail, 'SENDER')
    ),
    receiver: formulaOf(
      parts.receiver,
      fees.receiver,
      currency,
      sideFallback(feeDetail, 'RECEIVER')
    )
  }
}
