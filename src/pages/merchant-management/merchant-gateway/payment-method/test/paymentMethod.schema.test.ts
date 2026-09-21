import { describe, expect, it } from 'vitest'

import { paymentMethodSchema } from '../schemas/paymentMethod.schema'

describe('paymentMethodSchema', () => {
  it('chấp nhận hình thức thanh toán có hạn mức hợp lệ', () => {
    const valid = paymentMethodSchema.safeParse({
      scope: 'MASTER',
      merchantCode: 'MC000142',
      method: 'VI_DIEN_TU',
      channel: 'WEB',
      minAmount: 10000,
      maxAmount: 50000000,
      feeLabel: '0,8% / giao dịch',
      status: 'ACTIVE'
    })

    expect(valid.success).toBe(true)
  })

  it('từ chối hạn mức đảo ngược và biểu phí trống', () => {
    const invalid = paymentMethodSchema.safeParse({
      scope: 'MASTER',
      merchantCode: 'MC000142',
      method: 'VI_DIEN_TU',
      channel: 'WEB',
      minAmount: 50000000,
      maxAmount: 10000,
      feeLabel: '',
      status: 'ACTIVE'
    })

    expect(invalid.success).toBe(false)
  })
})
