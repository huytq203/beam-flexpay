import type {
  TransactionFeeDetail,
  TransactionProfit,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import {
  resolveAmounts,
  resolveBearer,
  type FeeAmounts,
  type FeeBearer
} from '@utils/transaction-flow'
import { sideFeeFormulas, totalFeeFormula } from './userFeeFormula'

export type UserFeeKind = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'OTHER'

export interface UserFeeRow {
  label: string
  amount: number
  /** Dòng tiền thực đi/đến ví hoặc bank — in đậm, có vạch phân nhóm phía trên. */
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

const transferRows = (
  amounts: FeeAmounts,
  formulas: { sender: string; receiver: string }
): UserFeeRow[] => [
  { label: 'Số tiền giao dịch', amount: amounts.principal },
  {
    label: 'Số tiền trừ trên ví người chuyển',
    amount: amounts.debited,
    isTotal: true
  },
  {
    label: 'Phí người chuyển',
    amount: amounts.senderFee,
    isFee: true,
    formula: formulas.sender
  },
  {
    label: 'Số tiền cộng vào ví người nhận',
    amount: amounts.credited,
    isTotal: true
  },
  {
    label: 'Phí người nhận',
    amount: amounts.receiverFee,
    isFee: true,
    formula: formulas.receiver
  }
]

/** Nhãn đầu bị trừ và đầu nhận tiền theo loại giao dịch. */
const ENDPOINT_LABELS: Readonly<
  Record<
    Exclude<UserFeeKind, 'TRANSFER'>,
    { credited: string; debited: string }
  >
> = {
  DEPOSIT: {
    credited: 'Số tiền cộng vào ví',
    debited: 'Số tiền thực trừ trên ngân hàng'
  },
  WITHDRAWAL: {
    debited: 'Số tiền trừ trên ví',
    credited: 'Số tiền thực nhận trên ngân hàng'
  },
  OTHER: { credited: 'Số tiền thực nhận', debited: 'Tổng giá trị' }
}

/** Nạp: ví được cộng rồi mới tới số bank bị trừ; rút: ví bị trừ rồi mới tới số bank nhận. */
const singleSideRows = (
  kind: Exclude<UserFeeKind, 'TRANSFER'>,
  amounts: FeeAmounts,
  fee: number,
  formula: string
): UserFeeRow[] => {
  const labels = ENDPOINT_LABELS[kind]
  const isWithdrawal = kind === 'WITHDRAWAL'
  const before = isWithdrawal ? 'debited' : 'credited'
  const after = isWithdrawal ? 'credited' : 'debited'
  return [
    { label: 'Số tiền giao dịch', amount: amounts.principal },
    { label: labels[before], amount: amounts[before] },
    { label: 'Phí giao dịch', amount: fee, isFee: true, formula },
    { label: labels[after], amount: amounts[after], isTotal: true }
  ]
}

/**
 * Mỗi loại giao dịch nói rõ tiền đi đâu: nguồn bị trừ bao nhiêu, đích nhận bao nhiêu, phí bao nhiêu.
 * Phí NCC hiển thị ở thẻ "Chi phí nhà cung cấp" (FeeNCC), không nằm ở đây.
 */
export const buildUserFeeSummary = (
  data: UnifiedContentJournal,
  profit?: TransactionProfit | null,
  feeDetail?: TransactionFeeDetail | null
): UserFeeSummary => {
  const kind = KIND_BY_TYPE[data.transactionType] ?? 'OTHER'
  const bearer = resolveBearer(data.feeBearer)
  const amounts = resolveAmounts(data, bearer)
  const mismatch =
    amounts.debited !== data.grossAmount || amounts.credited !== data.amount
  const base = { kind, mismatch }
  const formulaInput = { profit, feeDetail, currency: data.currency ?? 'VND' }

  if (kind === 'TRANSFER') {
    const formulas = sideFeeFormulas(
      bearer,
      { sender: amounts.senderFee, receiver: amounts.receiverFee },
      formulaInput
    )
    return {
      ...base,
      badge: `Chuyển tiền · ${BEARER_LABEL[bearer]}`,
      rows: transferRows(amounts, formulas)
    }
  }
  const fee = data.feeAmount
  return {
    ...base,
    rows: singleSideRows(kind, amounts, fee, totalFeeFormula(fee, formulaInput))
  }
}
