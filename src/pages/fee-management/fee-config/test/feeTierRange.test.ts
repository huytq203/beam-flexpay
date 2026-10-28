import { describe, expect, it } from 'vitest'
import {
  CalculationMethod,
  feeComponentFormSchema
} from '../schemas/feeConfig.schema'
import { TIER_LAST_MUST_BE_EMPTY_MESSAGE } from '../schemas/feeTierRange'

const tier = (maxValue: number | null) => ({
  maxValue,
  percentage: 1,
  fixedAmount: null,
  minFee: null,
  maxFee: null
})

const parse = (tiers: unknown[]) =>
  feeComponentFormSchema.safeParse({
    key: 'fee',
    feeScope: 'OUTPUT_FEE',
    componentType: 'TRANSACTION_FEE',
    baseOn: 'AMOUNT',
    baseComponentType: null,
    calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
    payerType: 'USER',
    beneficiaryType: 'SYSTEM',
    fixedAmount: 0,
    percentage: 0,
    minFee: 0,
    maxFee: 0,
    roundMode: 'UP',
    tiers
  })

const messagesAt = (
  result: ReturnType<typeof parse>,
  path: string
): string[] =>
  result.success
    ? []
    : result.error.issues
        .filter((issue) => issue.path.join('.') === path)
        .map((issue) => issue.message)

describe('khoảng của bậc phí', () => {
  it('báo lỗi khi bậc cuối có giá trị đến', () => {
    const result = parse([tier(10), tier(20)])
    expect(messagesAt(result, 'tiers.1.maxValue')).toEqual([
      TIER_LAST_MUST_BE_EMPTY_MESSAGE
    ])
  })

  it('đến phải lớn hơn từ ít nhất 1 đơn vị', () => {
    expect(
      messagesAt(parse([tier(0), tier(null)]), 'tiers.0.maxValue')
    ).toHaveLength(1)
    expect(
      messagesAt(parse([tier(1), tier(null)]), 'tiers.0.maxValue')
    ).toHaveLength(0)
    // bậc 2 bắt đầu từ 11, nên đến = 11 là không hợp lệ
    expect(
      messagesAt(parse([tier(10), tier(11), tier(null)]), 'tiers.1.maxValue')
    ).toHaveLength(1)
    expect(parse([tier(10), tier(12), tier(null)]).success).toBe(true)
  })
})
