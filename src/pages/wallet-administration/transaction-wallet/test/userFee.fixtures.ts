import type {
  TransactionFeeDetail,
  TransactionProfit,
  UnifiedContentJournal
} from '@type/apiResponseJournal'

export const journal = (
  over: Partial<UnifiedContentJournal>
): UnifiedContentJournal => ({
  id: 'j1',
  journalCode: 'JRN',
  transactionCode: 'FW1',
  status: 'POSTED',
  transactionType: 'P2P_TRANSFER',
  from: { id: 'a', username: 'a', displayName: 'a', type: 'USER' },
  to: { id: 'b', username: 'b', displayName: 'b', type: 'USER' },
  amount: 0,
  grossAmount: 0,
  feeAmount: 0,
  currency: 'VND',
  paymentMethod: 'WALLET_BALANCE',
  bankCode: null,
  bankRefId: null,
  transactionId: null,
  reversesJournalId: null,
  reversedByJournalId: null,
  description: '',
  failureReason: null,
  createdAt: '',
  postedAt: null,
  archivedAt: null,
  sourceDomain: 'EWALLET',
  ...over
})

export const profit = (
  over: Partial<TransactionProfit> = {}
): TransactionProfit => ({
  userFeeTotal: 0,
  userFeeBreakdown: [],
  feeBreakdownAvailable: false,
  feePolicyName: null,
  feePolicyValidFrom: null,
  providerCost: null,
  providerCostAvailable: false,
  grossProfit: 0,
  grossProfitLabel: '',
  ...over
})

export const feeDetail = (
  over: Partial<TransactionFeeDetail> = {}
): TransactionFeeDetail => ({
  feeCalculationId: 'f1',
  policyName: null,
  totalFee: 0,
  formula: null,
  sides: [],
  components: [],
  totalInputCost: null,
  inputCosts: [],
  ...over
})

/** Chuyển 50.000, người chuyển chịu 1.000, người nhận chịu 1.000. */
export const transferBoth = journal({
  amount: 49000,
  grossAmount: 51000,
  feeAmount: 2000,
  feeBearer: 'BOTH',
  senderFeeAmount: 1000,
  receiverFeeAmount: 1000
})
