import { describe, expect, it } from 'vitest'
import {
  buildScopeBody,
  diffSnapshot,
  getScopeErrorMessage,
  toHistoryRow
} from '../utils/settlementScope.utils'
import { masterView, systemView } from './scopeConfig.setup'

const base = {
  settlementMode: 'MANUAL_ONLY' as const,
  autoFrequency: 'DAILY' as const,
  holdbackDays: 2,
  holdReason: '',
  active: true,
  reason: '  Điều chỉnh theo phụ lục  '
}

describe('buildScopeBody', () => {
  it('Master: chỉ gửi trường Master tự đặt hoặc vừa đổi, không gửi hạn mức', () => {
    const body = buildScopeBody(base, masterView(), false)
    expect(body).toEqual({
      settlementMode: 'MANUAL_ONLY',
      holdbackDays: 2,
      reason: 'Điều chỉnh theo phụ lục'
    })
  })

  it('Master chỉ đổi T+N khi các trường khác đang kế thừa Hệ thống', () => {
    const view = masterView({
      settlementMode: { value: 'MANUAL_ONLY', source: 'SYSTEM' }
    })
    const body = buildScopeBody({ ...base, holdbackDays: 5 }, view, false)
    expect(body).toEqual({ holdbackDays: 5, reason: 'Điều chỉnh theo phụ lục' })
  })

  it('Master HOLD gửi holdReason đã trim và autoFrequency chỉ khi AUTOMATIC', () => {
    const hold = buildScopeBody(
      { ...base, settlementMode: 'HOLD', holdReason: ' Rà soát gian lận ' },
      masterView(),
      false
    )
    expect(hold.holdReason).toBe('Rà soát gian lận')
    expect(hold).not.toHaveProperty('autoFrequency')
    const auto = buildScopeBody(
      { ...base, settlementMode: 'AUTOMATIC', autoFrequency: 'WEEKLY' },
      masterView(),
      false
    )
    expect(auto.autoFrequency).toBe('WEEKLY')
  })

  it('Hệ thống: luôn gửi đủ ba trường canonical, không có active/holdReason', () => {
    const body = buildScopeBody(
      { ...base, settlementMode: 'AUTOMATIC', holdbackDays: 4 },
      systemView(),
      true
    )
    expect(body).toEqual({
      settlementMode: 'AUTOMATIC',
      autoFrequency: 'DAILY',
      holdbackDays: 4,
      reason: 'Điều chỉnh theo phụ lục'
    })
  })
})

describe('toHistoryRow', () => {
  it('nhận dòng camelCase, snapshot là object, giữ tên đối tượng và người thực hiện', () => {
    const row = toHistoryRow({
      id: 'h1',
      level: 'MASTER',
      targetId: 'm-1',
      targetCode: 'M1',
      targetName: 'Master 1',
      changedAt: '2026-10-22T03:15:30.123Z',
      changedBy: 'u-1',
      changedByName: 'admin95',
      reason: null,
      snapshot: { settlementMode: 'AUTOMATIC', holdbackDays: 3, active: true }
    })
    expect(row).toMatchObject({
      targetId: 'm-1',
      targetName: 'Master 1',
      changedAt: '2026-10-22T03:15:30.123Z',
      changedBy: 'u-1',
      changedByName: 'admin95',
      corrupted: false
    })
    expect(row.snapshot?.holdbackDays).toBe(3)
  })

  it('snapshot null là "kế thừa", chuỗi hỏng chỉ đánh dấu corrupted', () => {
    const raw = {
      id: 'h',
      level: 'SUB' as const,
      targetId: 's',
      changedAt: null,
      changedBy: null,
      reason: null
    }
    expect(toHistoryRow({ ...raw, snapshot: null })).toMatchObject({
      snapshot: null,
      corrupted: false
    })
    expect(toHistoryRow({ ...raw, snapshot: '{oops' })).toMatchObject({
      snapshot: null,
      corrupted: true
    })
  })
})

describe('diffSnapshot / getScopeErrorMessage', () => {
  it('diff liệt kê trường đổi, bỏ trường giống nhau', () => {
    const changes = diffSnapshot(
      { settlementMode: 'MANUAL_ONLY', holdbackDays: 2 },
      { settlementMode: 'AUTOMATIC', holdbackDays: 2 }
    )
    expect(changes).toEqual([
      { key: 'settlementMode', before: 'MANUAL_ONLY', after: 'AUTOMATIC' }
    ])
  })

  it('map lỗi theo message, VALIDATION_ERROR lấy câu của trường', () => {
    expect(
      getScopeErrorMessage(
        { data: { message: 'MERCHANT_SETTLEMENT_LOOSENING_NEEDS_APPROVER' } },
        'x'
      )
    ).toContain('cần quyền phê duyệt')
    expect(
      getScopeErrorMessage(
        {
          data: {
            message: 'VALIDATION_ERROR',
            data: { reason: 'Lý do thay đổi là bắt buộc' }
          }
        },
        'x'
      )
    ).toBe('Lý do thay đổi là bắt buộc')
    expect(
      getScopeErrorMessage(
        { data: { message: 'BUSINESS_ERROR', detail: 'Câu từ BE' } },
        'x'
      )
    ).toBe('Câu từ BE')
    expect(getScopeErrorMessage(undefined, 'dự phòng')).toBe('dự phòng')
  })
})
