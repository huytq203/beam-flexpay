import { COMPONENT_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import type {
  TransactionFeeDetail,
  TransactionProfit,
  UnifiedContentJournal,
  UserFeeBreakdownItem
} from '@type/apiResponseJournal'

export type UserFeeKind = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'OTHER'
type FeeBearer = 'SENDER' | 'RECEIVER' | 'BOTH'

export interface UserFeeRow {
  label: string
  amount: number
  /** Dòng tổng (Tổng giá trị / Tổng thực nhận / Tổng tiền chuyển…). */
  isTotal?: boolean
  isFee?: boolean
  formula?: string
}

export interface UserFeeSummary {
  kind: UserFeeKind
  badge?: string
  rows: UserFeeRow[]
  /** Gốc tính từ hai phía không khớp — báo lệch thay vì đoán. */
  mismatch: boolean
}

const KIND_BY_TYPE: Readonly<Record<string, UserFeeKind>> = {
  CASH_IN: 'DEPOSIT',
  CASH_OUT: 'WITHDRAWAL',
  P2P_TRANSFER: 'TRANSFER'
}

const BEARER_LABEL: Readonly<Record<FeeBearer, string>> = {
  SENDER: 'Người chuyển chịu phí',
  RECEIVER: 'Người nhận chịu phí',
  BOTH: 'Cả hai chịu phí'
}

const SENDER_PAYERS = new Set(['USER', 'SENDER'])

const resolveBearer = (
  feeBearer: string | null | undefined,
  kind: UserFeeKind
): FeeBearer => {
  if (feeBearer === 'SENDER' || feeBearer === 'RECEIVER') return feeBearer
  if (feeBearer === 'BOTH') return 'BOTH'
  return kind === 'WITHDRAWAL' ? 'RECEIVER' : 'SENDER'
}

const money = (value: number): string => value.toLocaleString('en-US')

const formatItem = (item: UserFeeBreakdownItem): string => {
  const parts: string[] = []
  if (item.percentage) {
    parts.push(
      item.baseValue == null
        ? `${item.percentage}%`
        : `${item.percentage}% × ${money(item.baseValue)}`
    )
  }
  if (item.fixedAmount) parts.push(money(item.fixedAmount))
  const label = getFeeLabel(item.componentType, COMPONENT_TYPE_LABELS, '')
  const expression = parts.length > 0 ? parts.join(' + ') : '0'
  return `${label} ${expression} = ${money(item.calculatedFee)}`
}

const formulaOf = (items: UserFeeBreakdownItem[]): string | undefined =>
  items.length > 0 ? items.map(formatItem).join(' · ') : undefined

/** Công thức theo từng phía chỉ khi quy được cấu phần về đúng bên trả. */
const sideFormulas = (
  items: UserFeeBreakdownItem[],
  bearer: FeeBearer
): { sender?: string; receiver?: string } => {
  if (items.length === 0) return {}
  if (bearer !== 'BOTH') {
    return bearer === 'SENDER'
      ? { sender: formulaOf(items) }
      : { receiver: formulaOf(items) }
  }
  if (items.some((item) => !item.payerType)) return {}
  const isSender = (item: UserFeeBreakdownItem): boolean =>
    SENDER_PAYERS.has(item.payerType ?? '')
  return {
    sender: formulaOf(items.filter(isSender)),
    receiver: formulaOf(items.filter((item) => !isSender(item)))
  }
}

/** Công thức backend dựng sẵn từ fee service, theo đúng phía chịu phí. */
const feeSideFormula = (
  fee: TransactionFeeDetail,
  side: 'SENDER' | 'RECEIVER'
): string | undefined =>
  fee.sides.find((item) => item.payerType === side)?.formula ?? undefined

const feeFormulas = (
  fee: TransactionFeeDetail
): { sender?: string; receiver?: string } => ({
  sender: feeSideFormula(fee, 'SENDER'),
  receiver: feeSideFormula(fee, 'RECEIVER')
})

const breakdownOf = (
  profit?: TransactionProfit | null
): UserFeeBreakdownItem[] =>
  profit?.feeBreakdownAvailable ? profit.userFeeBreakdown : []

/**
 * Công thức phí ưu tiên khối `fee` (wallet-core đọc từ fee service); không có thì mới dựng từ
 * `profit` cũ. Phí NCC hiển thị ở thẻ "Chi phí nhà cung cấp" (FeeNCC), không nằm ở đây.
 */
export const buildUserFeeSummary = (
  data: UnifiedContentJournal,
  profit?: TransactionProfit | null,
  feeDetail?: TransactionFeeDetail | null
): UserFeeSummary => {
  const kind = KIND_BY_TYPE[data.transactionType] ?? 'OTHER'
  const bearer = resolveBearer(data.feeBearer, kind)
  const fee = data.feeAmount
  const senderFee =
    bearer === 'BOTH'
      ? (data.senderFeeAmount ?? 0)
      : bearer === 'SENDER'
        ? fee
        : 0
  const receiverFee =
    bearer === 'BOTH'
      ? (data.receiverFeeAmount ?? 0)
      : bearer === 'RECEIVER'
        ? fee
        : 0
  const principal = data.grossAmount - senderFee
  const mismatch = principal - receiverFee !== data.amount
  const items = breakdownOf(profit)
  const base = { kind, mismatch }
  const principalRow: UserFeeRow = {
    label: 'Số tiền giao dịch',
    amount: principal
  }

  if (kind === 'TRANSFER') {
    const formulas = feeDetail
      ? feeFormulas(feeDetail)
      : sideFormulas(items, bearer)
    return {
      ...base,
      badge: `Chuyển tiền · ${BEARER_LABEL[bearer]}`,
      rows: [
        principalRow,
        {
          label: 'Phí người chuyển',
          amount: senderFee,
          isFee: true,
          formula: formulas.sender
        },
        {
          label: 'Tổng tiền chuyển',
          amount: principal + senderFee,
          isTotal: true
        },
        {
          label: 'Phí người nhận',
          amount: receiverFee,
          isFee: true,
          formula: formulas.receiver
        },
        {
          label: 'Tổng tiền nhận',
          amount: principal - receiverFee,
          isTotal: true
        }
      ]
    }
  }

  const feeRow: UserFeeRow = {
    label: 'Tổng phí',
    amount: fee,
    isFee: true,
    formula: feeDetail ? (feeDetail.formula ?? undefined) : formulaOf(items)
  }
  const totalRow: UserFeeRow =
    kind === 'WITHDRAWAL'
      ? { label: 'Tổng thực nhận', amount: principal - fee, isTotal: true }
      : { label: 'Tổng giá trị', amount: principal + fee, isTotal: true }
  return { ...base, rows: [principalRow, feeRow, totalRow] }
}
