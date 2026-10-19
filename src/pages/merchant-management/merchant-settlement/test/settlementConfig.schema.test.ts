import { describe, expect, it } from 'vitest'
import { settlementConfigSchema } from '../schemas/settlementConfig.schema'

const base = {
  inherit: false,
  settlementMode: 'AUTOMATIC',
  autoFrequency: 'DAILY',
  holdbackDays: 1,
  holdReason: '',
  active: true,
  reason: 'Merchant đủ điều kiện'
}

describe('settlementConfigSchema', () => {
  it('HOLD bắt buộc có lý do, không giới hạn độ dài tối thiểu', () => {
    const blank = settlementConfigSchema.safeParse({
      ...base,
      settlementMode: 'HOLD',
      holdReason: '   '
    })
    expect(blank.success).toBe(false)
    expect(
      settlementConfigSchema.safeParse({
        ...base,
        settlementMode: 'HOLD',
        holdReason: 'ngắn'
      }).success
    ).toBe(true)
  })
  it('kế thừa thì không đòi lý do tạm dừng', () => {
    expect(
      settlementConfigSchema.safeParse({
        ...base,
        inherit: true,
        settlementMode: 'HOLD',
        holdReason: ''
      }).success
    ).toBe(true)
  })
  it('holdbackDays là số nguyên 0 đến 365', () => {
    for (const bad of [-1, 366, 1.5])
      expect(
        settlementConfigSchema.safeParse({ ...base, holdbackDays: bad }).success
      ).toBe(false)
    expect(
      settlementConfigSchema.safeParse({ ...base, holdbackDays: 365 }).success
    ).toBe(true)
  })
  it('lý do thay đổi là bắt buộc, tối đa 500 ký tự', () => {
    expect(
      settlementConfigSchema.safeParse({ ...base, reason: '   ' }).success
    ).toBe(false)
    expect(
      settlementConfigSchema.safeParse({ ...base, reason: 'a'.repeat(501) })
        .success
    ).toBe(false)
  })
})
