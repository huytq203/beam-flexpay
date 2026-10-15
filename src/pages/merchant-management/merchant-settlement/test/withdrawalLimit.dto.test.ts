import { describe, expect, it } from 'vitest'
import {
  limitOutcomeMessage,
  normalizeLimitForm,
  toLimitRequest
} from '../dto/withdrawalLimit.dto'
import type { WithdrawalLimitForm } from '../schemas/withdrawalLimit.schema'

const base: WithdrawalLimitForm = {
  targetLevel: 'SUB',
  targetId: 'sub-1',
  activeFrom: '2026-10-14T00:00:00.000Z',
  reason: ' Siết hạn mức theo rủi ro '
}

describe('toLimitRequest', () => {
  it('gửi policyDomain WITHDRAWAL và chỉ các khóa có giá trị', () => {
    expect(
      toLimitRequest({
        ...base,
        dailyWithdrawalLimit: 50_000_000,
        maximumDailyWithdrawalCount: 3
      })
    ).toEqual({
      policyDomain: 'WITHDRAWAL',
      targetLevel: 'SUB',
      targetId: 'sub-1',
      config: {
        dailyWithdrawalLimit: 50_000_000,
        maximumDailyWithdrawalCount: 3
      },
      activeFrom: '2026-10-14T00:00:00.000Z',
      reason: 'Siết hạn mức theo rủi ro'
    })
  })
  it('SYSTEM không gửi targetId', () => {
    const body = toLimitRequest({
      ...base,
      targetLevel: 'SYSTEM',
      targetId: 'bo-qua',
      dailyWithdrawalLimit: 1
    })
    expect(body).not.toHaveProperty('targetId')
  })
  it('không gửi khóa để trống', () => {
    const body = toLimitRequest({ ...base, dailyWithdrawalLimit: 10 })
    expect(Object.keys(body.config)).toEqual(['dailyWithdrawalLimit'])
  })
})

describe('limitOutcomeMessage', () => {
  it('phân biệt siết áp ngay và nới chờ duyệt', () => {
    expect(limitOutcomeMessage('APPROVED')).toContain('áp dụng ngay')
    expect(limitOutcomeMessage('PENDING_APPROVAL')).toContain('chờ phê duyệt')
    expect(limitOutcomeMessage('PENDING_APPROVAL')).not.toContain(
      'áp dụng ngay'
    )
  })
})

describe('normalizeLimitForm', () => {
  it('ô số trống (null, rỗng, NaN) thành không đặt', () => {
    const dirty = {
      ...base,
      dailyWithdrawalLimit: null,
      autoApprovalThreshold: '',
      minimumWithdrawalAmount: Number.NaN,
      maximumWithdrawalAmount: 0
    } as unknown as WithdrawalLimitForm
    const result = normalizeLimitForm(dirty)
    expect(result).not.toHaveProperty('dailyWithdrawalLimit')
    expect(result).not.toHaveProperty('autoApprovalThreshold')
    expect(result).not.toHaveProperty('minimumWithdrawalAmount')
    expect(result.maximumWithdrawalAmount).toBe(0)
  })
})
