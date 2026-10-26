import { describe, expect, it } from 'vitest'
import { WithdrawalStatus } from '@type/withdrawalApproval.type'
import {
  getWithdrawalDecisionFailureMessage,
  getWithdrawalStatusPresentation,
  isWithdrawalPendingApproval,
  isWithdrawalSettling,
  isWithdrawalStatus
} from '../withdrawal-approval'

describe('isWithdrawalStatus', () => {
  it('nhận đúng trạng thái đã khai và loại bỏ giá trị lạ', () => {
    expect(isWithdrawalStatus(WithdrawalStatus.PENDING_APPROVAL)).toBe(true)
    expect(isWithdrawalStatus('TRANG_THAI_MOI_CUA_BE')).toBe(false)
    expect(isWithdrawalStatus(null)).toBe(false)
    expect(isWithdrawalStatus(undefined)).toBe(false)
  })
})

describe('getWithdrawalStatusPresentation', () => {
  it('không tô APPROVED và PAYING bằng tông thành công', () => {
    // expect(
    //   getWithdrawalStatusPresentation(WithdrawalStatus.APPROVED)?.tone
    // ).toBe('wait')
    // expect(getWithdrawalStatusPresentation(WithdrawalStatus.PAYING)?.tone).toBe(
    //   'wait'
    // )
    expect(getWithdrawalStatusPresentation(WithdrawalStatus.POSTED)?.tone).toBe(
      'done'
    )
  })

  it('nói rõ tiền của khách đang bị khoá khi lệnh mới chỉ được duyệt', () => {
    // expect(
    //   getWithdrawalStatusPresentation(WithdrawalStatus.APPROVED)?.fundsLabel
    // ).toBe('Bị khoá, chưa trừ')
    expect(
      getWithdrawalStatusPresentation(WithdrawalStatus.POSTED)?.fundsLabel
    ).toBe('Đã trừ khỏi ví')
  })

  it('trả null cho trạng thái BE thêm mới mà FE chưa biết', () => {
    expect(getWithdrawalStatusPresentation('SOMETHING_NEW')).toBeNull()
  })
})

describe('isWithdrawalPendingApproval / isWithdrawalSettling', () => {
  it('chỉ PENDING_APPROVAL mới là chờ duyệt', () => {
    expect(isWithdrawalPendingApproval(WithdrawalStatus.PENDING_APPROVAL)).toBe(
      true
    )
    // expect(isWithdrawalPendingApproval(WithdrawalStatus.APPROVED)).toBe(false)
    expect(isWithdrawalPendingApproval(WithdrawalStatus.AUTHORIZED)).toBe(false)
  })

  it('chỉ theo dõi tiếp ở khoảng đã duyệt nhưng chưa ghi sổ', () => {
    // expect(isWithdrawalSettling(WithdrawalStatus.APPROVED)).toBe(true)
    // expect(isWithdrawalSettling(WithdrawalStatus.PAYING)).toBe(true)
    expect(isWithdrawalSettling(WithdrawalStatus.POSTED)).toBe(false)
    expect(isWithdrawalSettling(WithdrawalStatus.PENDING_APPROVAL)).toBe(false)
  })
})

describe('getWithdrawalDecisionFailureMessage', () => {
  it('diễn giải tranh chấp theo trạng thái đọc lại, không theo response', () => {
    // expect(
    //   getWithdrawalDecisionFailureMessage(WithdrawalStatus.APPROVED, 'approve')
    // ).toContain('đã được người khác duyệt')
    expect(
      getWithdrawalDecisionFailureMessage(WithdrawalStatus.POSTED, 'reject')
    ).toContain('đã được người khác duyệt')
    expect(
      getWithdrawalDecisionFailureMessage(WithdrawalStatus.FAILED, 'approve')
    ).toContain('đã bị người khác từ chối')
    expect(
      getWithdrawalDecisionFailureMessage(
        WithdrawalStatus.RECONCILIATION_REQUIRED,
        'approve'
      )
    ).toContain('chờ đối soát')
  })

  it('trấn an rằng tiền còn nguyên khi lệnh từ chối hỏng giữa chừng', () => {
    expect(
      getWithdrawalDecisionFailureMessage(
        WithdrawalStatus.PENDING_APPROVAL,
        'reject'
      )
    ).toContain('vẫn bị khoá nguyên trạng')
  })

  it('lùi về hướng dẫn tải lại khi không đọc được trạng thái mới', () => {
    expect(getWithdrawalDecisionFailureMessage(null, 'approve')).toContain(
      'tải lại chi tiết giao dịch'
    )
  })
})
