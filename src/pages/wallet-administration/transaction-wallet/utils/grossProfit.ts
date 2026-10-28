import type {
  TransactionFeeDetail,
  TransactionProfit,
  UnifiedContentJournal
} from '@type/apiResponseJournal'

const NET_LABEL = 'Lợi nhuận gộp (đã trừ chi phí nhà cung cấp)'
const BEFORE_COST_LABEL = 'Lợi nhuận gộp (chưa trừ chi phí nhà cung cấp)'

/** Tổng phí NCC phải trả: ưu tiên phí đầu vào đọc từ fee service, không có thì mới dùng profit cũ. */
export const resolveProviderCost = (
  fee: TransactionFeeDetail | null | undefined,
  profit: TransactionProfit | null | undefined
): number | null => {
  if (fee) return fee.totalInputCost
  return profit?.providerCostAvailable ? profit.providerCost : null
}

export interface GrossProfitView {
  amount: number | null
  label: string
  isProviderCostDeducted: boolean
}

/**
 * Lợi nhuận gộp = phí thu khách − tổng phí NCC phải trả. Chưa có chi phí NCC thì vẫn hiện phí thu
 * khách, ghi rõ là chưa trừ, thay vì coi như chi phí bằng 0.
 */
export const buildGrossProfit = (
  transaction: Pick<UnifiedContentJournal, 'feeAmount'>,
  profit: TransactionProfit | null | undefined,
  fee: TransactionFeeDetail | null | undefined
): GrossProfitView => {
  const revenue = profit?.userFeeTotal ?? fee?.totalFee ?? transaction.feeAmount
  const providerCost = resolveProviderCost(fee, profit)
  if (providerCost == null) {
    return {
      amount: profit?.grossProfit ?? revenue,
      label: profit?.grossProfitLabel ?? BEFORE_COST_LABEL,
      isProviderCostDeducted: false
    }
  }
  return {
    amount: revenue - providerCost,
    label: NET_LABEL,
    isProviderCostDeducted: true
  }
}
