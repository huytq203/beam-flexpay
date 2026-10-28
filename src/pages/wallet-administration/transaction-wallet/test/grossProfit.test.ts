import type {
  TransactionFeeDetail,
  TransactionProfit
} from '@type/apiResponseJournal'
import { describe, expect, it } from 'vitest'
import { buildGrossProfit } from '../utils/grossProfit'

const profit = (over: Partial<TransactionProfit> = {}): TransactionProfit => ({
  userFeeTotal: 3_669,
  userFeeBreakdown: [],
  feeBreakdownAvailable: true,
  feePolicyName: null,
  feePolicyValidFrom: null,
  providerCost: null,
  providerCostAvailable: false,
  grossProfit: 3_669,
  grossProfitLabel: 'Lợi nhuận gộp (chưa trừ chi phí nhà cung cấp)',
  ...over
})

const fee = (totalInputCost: number | null): TransactionFeeDetail => ({
  feeCalculationId: 'calc',
  policyName: null,
  totalFee: 3_669,
  formula: null,
  sides: [],
  components: [],
  totalInputCost,
  inputCosts: []
})

describe('buildGrossProfit', () => {
  it('trừ tổng phí NCC phải trả khỏi phí thu khách', () => {
    expect(
      buildGrossProfit({ feeAmount: 3_669 }, profit(), fee(3_644))
    ).toEqual({
      amount: 25,
      label: 'Lợi nhuận gộp (đã trừ chi phí nhà cung cấp)',
      isProviderCostDeducted: true
    })
  })

  it('chi phí NCC lớn hơn phí thu khách thì lợi nhuận âm', () => {
    expect(
      buildGrossProfit({ feeAmount: 1_000 }, null, {
        ...fee(1_500),
        totalFee: 1_000
      }).amount
    ).toBe(-500)
  })

  it('dùng chi phí NCC trong profit khi không có khối fee', () => {
    expect(
      buildGrossProfit(
        { feeAmount: 3_669 },
        profit({ providerCost: 669, providerCostAvailable: true }),
        null
      ).amount
    ).toBe(3_000)
  })

  it('chưa có chi phí NCC thì giữ phí thu khách và ghi là chưa trừ', () => {
    expect(buildGrossProfit({ feeAmount: 3_669 }, profit(), fee(null))).toEqual(
      {
        amount: 3_669,
        label: 'Lợi nhuận gộp (chưa trừ chi phí nhà cung cấp)',
        isProviderCostDeducted: false
      }
    )
  })
})
