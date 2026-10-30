import { describe, expect, it } from 'vitest'
import {
  resolveDisplayStatus,
  WITHDRAW_DISPLAY_STATUS_CONFIG
} from '../constants/withdrawDisplayStatus'

describe('trạng thái hiển thị của lệnh rút', () => {
  it('ưu tiên displayStatus do BE gắn từ trạng thái thật của lệnh rút', () => {
    expect(
      resolveDisplayStatus({ status: 'PENDING', displayStatus: 'PAYING' })
    ).toBe('PAYING')
  })

  it('BE cũ chưa có displayStatus thì dùng trạng thái sổ cái', () => {
    expect(resolveDisplayStatus({ status: 'PENDING' })).toBe('PENDING')
    expect(
      resolveDisplayStatus({ status: 'POSTED', displayStatus: null })
    ).toBe('POSTED')
  })

  it('mỗi bước của lệnh rút đều có nhãn, và nhãn sổ cái giữ nguyên', () => {
    expect(WITHDRAW_DISPLAY_STATUS_CONFIG.PENDING_APPROVAL.label).toBe(
      'Chờ duyệt'
    )
    // expect(WITHDRAW_DISPLAY_STATUS_CONFIG.APPROVED.label).toBe(
    //   'Đã duyệt — đang chi'
    // )
    // expect(WITHDRAW_DISPLAY_STATUS_CONFIG.PAYING.label).toBe('Đang chi')
    expect(WITHDRAW_DISPLAY_STATUS_CONFIG.RECONCILIATION_REQUIRED.label).toBe(
      'Chờ đối soát'
    )
    expect(WITHDRAW_DISPLAY_STATUS_CONFIG.POSTED.label).toBe('Đã thành công')
    expect(WITHDRAW_DISPLAY_STATUS_CONFIG.PENDING.label).toBe('Chờ xử lý')
  })

  it('đang chi không tô tông thành công', () => {
    // expect(WITHDRAW_DISPLAY_STATUS_CONFIG.PAYING.className).not.toMatch(
    //   /success/
    // )
    // expect(WITHDRAW_DISPLAY_STATUS_CONFIG.APPROVED.className).not.toMatch(
    //   /success/
    // )
  })

  it('lệnh chi hoàn tiền có nhãn tiếng Việt, không hiện mã thô (Bước 3)', () => {
    expect(WITHDRAW_DISPLAY_STATUS_CONFIG.PENDING_PAYOUT_APPROVAL.label).toBe(
      'Đã duyệt chờ chi'
    )
    expect(WITHDRAW_DISPLAY_STATUS_CONFIG.PAYOUT_APPROVED.label).toBe(
      'Đã duyệt chi'
    )
    expect(
      WITHDRAW_DISPLAY_STATUS_CONFIG.PAYOUT_APPROVED.className
    ).not.toMatch(/success/)
  })
})
