import { describe, expect, it } from 'vitest'
import { withdrawalLimitSchema } from '../schemas/withdrawalLimit.schema'

const base = {
  targetLevel: 'SUB',
  targetId: 'sub-1',
  activeFrom: '2026-10-14T00:00:00.000Z',
  reason: 'Siết hạn mức theo rủi ro'
}

describe('withdrawalLimitSchema', () => {
  it('maximumDailyWithdrawalCount phải là số nguyên dương hoặc để trống', () => {
    for (const bad of [0, -1, 1.5])
      expect(
        withdrawalLimitSchema.safeParse({
          ...base,
          maximumDailyWithdrawalCount: bad
        }).success
      ).toBe(false)
    expect(
      withdrawalLimitSchema.safeParse({
        ...base,
        dailyWithdrawalLimit: 1,
        maximumDailyWithdrawalCount: undefined
      }).success
    ).toBe(true)
    expect(
      withdrawalLimitSchema.safeParse({
        ...base,
        maximumDailyWithdrawalCount: 3
      }).success
    ).toBe(true)
  })
  it('SUB và MASTER cần targetId, SYSTEM thì không', () => {
    expect(
      withdrawalLimitSchema.safeParse({ ...base, targetId: '' }).success
    ).toBe(false)
    expect(
      withdrawalLimitSchema.safeParse({
        ...base,
        targetLevel: 'MASTER',
        targetId: ''
      }).success
    ).toBe(false)
    expect(
      withdrawalLimitSchema.safeParse({
        ...base,
        targetLevel: 'SYSTEM',
        targetId: '',
        dailyWithdrawalLimit: 1
      }).success
    ).toBe(true)
  })
  it('các ô tiền là số nguyên không âm', () => {
    for (const bad of [-1, 1.5])
      expect(
        withdrawalLimitSchema.safeParse({
          ...base,
          dailyWithdrawalLimit: bad
        }).success
      ).toBe(false)
  })
  it('mức tối thiểu không vượt mức tối đa', () => {
    expect(
      withdrawalLimitSchema.safeParse({
        ...base,
        minimumWithdrawalAmount: 500,
        maximumWithdrawalAmount: 100
      }).success
    ).toBe(false)
    expect(
      withdrawalLimitSchema.safeParse({
        ...base,
        minimumWithdrawalAmount: 100,
        maximumWithdrawalAmount: 500
      }).success
    ).toBe(true)
  })
  it('lý do bắt buộc và tối đa 1000 ký tự', () => {
    expect(
      withdrawalLimitSchema.safeParse({ ...base, reason: '  ' }).success
    ).toBe(false)
    expect(
      withdrawalLimitSchema.safeParse({ ...base, reason: 'a'.repeat(1001) })
        .success
    ).toBe(false)
  })
  it('phải đặt ít nhất một hạn mức', () => {
    expect(withdrawalLimitSchema.safeParse(base).success).toBe(false)
    expect(
      withdrawalLimitSchema.safeParse({ ...base, dailyWithdrawalLimit: 1 })
        .success
    ).toBe(true)
  })
})
