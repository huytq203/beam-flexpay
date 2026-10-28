import { zodResolver } from '@hookform/resolvers/zod'
import type { ResolverOptions } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import {
  CalculationMethod,
  feeComponentFormSchema,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import { TIER_LAST_MUST_BE_EMPTY_MESSAGE } from '../schemas/feeTierRange'
import { deferLastTierCheck } from '../utils/deferLastTierCheck'

const tier = (maxValue: number | null, overrides = {}) => ({
  maxValue,
  fixedAmount: null,
  percentage: null,
  minFee: null,
  maxFee: null,
  ...overrides
})

const component = (
  tiers: FeeComponentFormValues['tiers']
): FeeComponentFormValues => ({
  key: 'c',
  feeScope: 'OUTPUT_FEE',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.FLAT_TIER,
  payerType: 'USER',
  beneficiaryType: 'SYSTEM',
  fixedAmount: null,
  percentage: null,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers
})

const options = (names: string[]): ResolverOptions<FeeComponentFormValues> => ({
  names,
  fields: {},
  shouldUseNativeValidation: false
})

const resolve = deferLastTierCheck(zodResolver(feeComponentFormSchema))

describe('deferLastTierCheck', () => {
  it('đang nhập Đến của bậc cuối thì chưa báo lỗi bậc cuối phải để trống', async () => {
    const result = await resolve(
      component([tier(100_000), tier(200_000)]),
      undefined,
      options(['tiers.1.maxValue'])
    )

    expect(result.errors).toEqual({})
  })

  it('bấm Thêm / Lưu (kiểm cả form) thì báo lỗi ở bậc cuối', async () => {
    const result = await resolve(
      component([tier(100_000), tier(200_000)]),
      undefined,
      options(['componentType', 'tiers.0.maxValue', 'tiers.1.maxValue'])
    )

    expect(result.errors.tiers?.[1]?.maxValue?.message).toBe(
      TIER_LAST_MUST_BE_EMPTY_MESSAGE
    )
    expect(result.errors.tiers?.[0]).toBeUndefined()
  })

  it('vẫn báo ngay các lỗi khác của bậc khi đang nhập', async () => {
    const result = await resolve(
      component([tier(100_000), tier(50_000), tier(null)]),
      undefined,
      options(['tiers.1.maxValue'])
    )

    expect(result.errors.tiers?.[1]?.maxValue?.message).toMatch(
      'Giá trị đến phải lớn hơn giá trị từ'
    )
  })

  it('bỏ lỗi bậc cuối nhưng giữ lỗi khác cùng hàng', async () => {
    const result = await resolve(
      component([tier(100_000, { percentage: 0, minFee: 1_000 })]),
      undefined,
      options(['tiers'])
    )

    expect(result.errors.tiers?.[0]?.maxValue).toBeUndefined()
    expect(result.errors.tiers?.[0]?.minFee?.message).toBe(
      'Bậc miễn phí không được đặt sàn phí'
    )
  })
})
