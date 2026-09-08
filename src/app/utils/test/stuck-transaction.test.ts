import { describe, expect, it } from 'vitest'
import { StatusEnum } from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { WithdrawalStatus } from '@type/withdrawalApproval.type'
import {
  canUpdateStuckTransaction,
  isStuckJournalStatus,
  isTerminalJournalStatus
} from '../stuck-transaction'

describe('isStuckJournalStatus', () => {
  it('coi PENDING và AUTHORIZED là giao dịch treo', () => {
    expect(isStuckJournalStatus(StatusEnum.PENDING)).toBe(true)
    expect(isStuckJournalStatus(StatusEnum.AUTHORIZED)).toBe(true)
  })

  it('không coi bút toán đã có kết quả cuối là treo', () => {
    expect(isStuckJournalStatus(StatusEnum.POSTED)).toBe(false)
    expect(isStuckJournalStatus(StatusEnum.FAILED)).toBe(false)
    expect(isStuckJournalStatus(StatusEnum.CANCELLED)).toBe(false)
    expect(isStuckJournalStatus(StatusEnum.SETTLED)).toBe(false)
  })

  it('đóng với trạng thái lạ và giá trị rỗng, không mở mặc định', () => {
    expect(isStuckJournalStatus('TRANG_THAI_MOI')).toBe(false)
    expect(isStuckJournalStatus(null)).toBe(false)
    expect(isStuckJournalStatus(undefined)).toBe(false)
  })
})

describe('isTerminalJournalStatus', () => {
  it('nhận đúng bốn trạng thái đã chốt', () => {
    expect(isTerminalJournalStatus(StatusEnum.POSTED)).toBe(true)
    expect(isTerminalJournalStatus(StatusEnum.SETTLED)).toBe(true)
    expect(isTerminalJournalStatus(StatusEnum.PENDING)).toBe(false)
    expect(isTerminalJournalStatus(null)).toBe(false)
  })
})

describe('canUpdateStuckTransaction', () => {
  it('chặn khi lệnh rút đang chờ duyệt, dù bút toán vẫn đang treo', () => {
    expect(
      canUpdateStuckTransaction(
        StatusEnum.PENDING,
        WithdrawalStatus.PENDING_APPROVAL
      )
    ).toBe(false)
  })

  it('cho phép với giao dịch treo thông thường', () => {
    expect(canUpdateStuckTransaction(StatusEnum.PENDING, null)).toBe(true)
    expect(canUpdateStuckTransaction(StatusEnum.AUTHORIZED, undefined)).toBe(
      true
    )
    expect(
      canUpdateStuckTransaction(StatusEnum.PENDING, WithdrawalStatus.PAYING)
    ).toBe(true)
  })

  it('chặn khi bút toán đã có kết quả cuối', () => {
    expect(canUpdateStuckTransaction(StatusEnum.POSTED, null)).toBe(false)
    expect(canUpdateStuckTransaction(StatusEnum.FAILED, null)).toBe(false)
  })
})
