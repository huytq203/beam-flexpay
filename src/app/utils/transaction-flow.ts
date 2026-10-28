import type { UnifiedContentJournal } from '@type/apiResponseJournal'

export type FeeBearer = 'SENDER' | 'RECEIVER' | 'BOTH'

type FeeSource = Pick<
  UnifiedContentJournal,
  | 'amount'
  | 'feeAmount'
  | 'grossAmount'
  | 'senderFeeAmount'
  | 'receiverFeeAmount'
>

type FlowSource = FeeSource &
  Pick<UnifiedContentJournal, 'feeBearer' | 'transactionType'>

export interface FeeAmounts {
  principal: number
  senderFee: number
  receiverFee: number
  /** Số bị trừ ở nguồn tiền (ví người chuyển / bank khi nạp / ví khi rút). */
  debited: number
  /** Số thực đến đích (ví người nhận / ví khi nạp / bank khi rút). */
  credited: number
}

/** BE để trống `feeBearer` khi người chuyển chịu phí, kể cả nạp/rút. */
export const resolveBearer = (
  feeBearer: string | null | undefined
): FeeBearer =>
  feeBearer === 'RECEIVER' || feeBearer === 'BOTH' ? feeBearer : 'SENDER'

/**
 * API không có field "số tiền yêu cầu"; field mang số này tuỳ bên chịu phí:
 * SENDER → `amount`, RECEIVER → `grossAmount`, BOTH → `grossAmount − senderFeeAmount`.
 */
export const resolveAmounts = (
  data: FeeSource,
  bearer: FeeBearer
): FeeAmounts => {
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
  const principal =
    bearer === 'SENDER' ? data.amount : data.grossAmount - senderFee
  return {
    principal,
    senderFee,
    receiverFee,
    debited: principal + senderFee,
    credited: principal - receiverFee
  }
}

type FlowEndpoint = 'WALLET' | 'BANK'

interface FlowRoute {
  debited?: FlowEndpoint
  credited?: FlowEndpoint
}

/**
 * Theo bảng nghiệp vụ "Lịch sử chung": chuyển tiền và thanh toán ví chỉ ghi phía ví bị trừ,
 * không ghi phía nhận; hoàn tiền là tiền quay về ví khách.
 */
const FLOW_BY_TYPE: Readonly<Record<string, FlowRoute>> = {
  CASH_IN: { debited: 'BANK', credited: 'WALLET' },
  CASH_OUT: { debited: 'WALLET', credited: 'BANK' },
  P2P_TRANSFER: { debited: 'WALLET' },
  MERCHANT_PAYMENT: { debited: 'WALLET' },
  REVERSAL: { credited: 'WALLET' }
}

const NO_TOTALS = {
  walletDebit: 0,
  walletCredit: 0,
  bankDebit: 0,
  bankCredit: 0
}

interface FlowTotals {
  walletDebit: number
  walletCredit: number
  bankDebit: number
  bankCredit: number
}

export interface TransactionFlow {
  principal: number
  senderFee: number
  receiverFee: number
  /** null khi loại giao dịch chưa có quy tắc dòng tiền — hiện "--" thay vì đoán. */
  totals: FlowTotals | null
}

export const buildTransactionFlow = (record: FlowSource): TransactionFlow => {
  const amounts = resolveAmounts(record, resolveBearer(record.feeBearer))
  const route = FLOW_BY_TYPE[record.transactionType]
  const amountAt = (
    side: 'debited' | 'credited',
    endpoint: FlowEndpoint
  ): number => (route?.[side] === endpoint ? amounts[side] : 0)

  return {
    principal: amounts.principal,
    senderFee: amounts.senderFee,
    receiverFee: amounts.receiverFee,
    totals: route
      ? {
          walletDebit: amountAt('debited', 'WALLET'),
          walletCredit: amountAt('credited', 'WALLET'),
          bankDebit: amountAt('debited', 'BANK'),
          bankCredit: amountAt('credited', 'BANK')
        }
      : null
  }
}

type DeductionSource = FlowSource & Pick<UnifiedContentJournal, 'from'>

export interface FeeDeduction {
  walletFee: number
  bankFee: number
  /** Chỉ chuyển tiền trong hệ thống: phí trừ ví tách riêng người chuyển / người nhận. */
  walletSplit: { senderFee: number; receiverFee: number } | null
}

const bySource = (
  record: DeductionSource,
  fee: number
): Omit<FeeDeduction, 'walletSplit'> =>
  record.from?.type === 'BANK'
    ? { walletFee: 0, bankFee: fee }
    : { walletFee: fee, bankFee: 0 }

/**
 * Phí bị trừ ở đâu: chuyển tiền trong hệ thống luôn trừ ví hai bên; loại khác (nạp, rút, thanh toán,
 * hoàn) xét nguồn tiền — nguồn là bank thì phí trừ bank, còn lại trừ ví.
 */
export const resolveFeeDeduction = (record: DeductionSource): FeeDeduction => {
  const { senderFee, receiverFee } = resolveAmounts(
    record,
    resolveBearer(record.feeBearer)
  )
  if (record.transactionType === 'P2P_TRANSFER') {
    return {
      walletFee: senderFee + receiverFee,
      bankFee: 0,
      walletSplit: { senderFee, receiverFee }
    }
  }
  return { ...bySource(record, senderFee + receiverFee), walletSplit: null }
}

export interface PersonalFlow
  extends Omit<TransactionFlow, 'senderFee' | 'receiverFee'> {
  /** Phí của chính chủ ví đang xem (người chuyển hoặc người nhận). */
  fee: number
  walletFee: number
  bankFee: number
}

/**
 * Góc nhìn "ví riêng": chuyển tiền chỉ hiện phần của ví đang xem
 * (người nhận: phí nhận + số cộng ví; người chuyển: phí chuyển + số trừ ví).
 */
export const buildPersonalFlow = (
  record: DeductionSource & Pick<UnifiedContentJournal, 'to'>,
  viewerId: string | null | undefined
): PersonalFlow => {
  const flow = buildTransactionFlow(record)
  const { senderFee, receiverFee, ...rest } = flow
  if (record.transactionType !== 'P2P_TRANSFER') {
    const fee = senderFee + receiverFee
    return { ...rest, fee, ...bySource(record, fee) }
  }
  const amounts = resolveAmounts(record, resolveBearer(record.feeBearer))
  const isReceiver = Boolean(viewerId) && record.to?.id === viewerId
  const fee = isReceiver ? receiverFee : senderFee
  return {
    principal: flow.principal,
    fee,
    walletFee: fee,
    bankFee: 0,
    totals: {
      ...NO_TOTALS,
      walletCredit: isReceiver ? amounts.credited : 0,
      walletDebit: isReceiver ? 0 : amounts.debited
    }
  }
}
