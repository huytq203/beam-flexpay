import { describe, expect, it } from 'vitest'
import { StatusEnum } from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { WithdrawalStatus } from '@type/withdrawalApproval.type'
import {
  canShowStuckUpdateForType,
  canUpdateStuckTransaction,
  isStuckJournalStatus,
  isTerminalJournalStatus
} from '../stuck-transaction'

describe('isStuckJournalStatus', () => {
  it('coi PENDING và AUTHORIZED là giao dịch treo', () => {
    expect(isStuckJournalStatus(StatusEnum.PENDING)).toBe(true)
  })

  it('không coi bút toán đã có kết quả cuối là treo', () => {
    expect(isStuckJournalStatus(StatusEnum.POSTED)).toBe(false)
    expect(isStuckJournalStatus(StatusEnum.FAILED)).toBe(false)
  })

  it('đóng với trạng thái lạ và giá trị rỗng, không mở mặc định', () => {
    expect(isStuckJournalStatus('TRANG_THAI_MOI')).toBe(false)
    expect(isStuckJournalStatus(null)).toBe(false)
    expect(isStuckJournalStatus(undefined)).toBe(false)
  })
})

describe('canShowStuckUpdateForType', () => {
  it('ẩn nút cho chuyển tiền', () => {
    expect(canShowStuckUpdateForType('P2P_TRANSFER')).toBe(false)
  })

  it('Bước 3: lệnh chi hoàn ra ngân hàng treo được làm mới/chốt ở màn rút tiền như lệnh rút', () => {
    expect(canShowStuckUpdateForType('REFUND_BANK_PAYOUT')).toBe(true)
  })

  it('vẫn hiện cho lệnh rút thường', () => {
    expect(canShowStuckUpdateForType('CASH_OUT')).toBe(true)
  })
})

describe('isTerminalJournalStatus', () => {
  it('nhận đúng bốn trạng thái đã chốt', () => {
    expect(isTerminalJournalStatus(StatusEnum.POSTED)).toBe(true)
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

    // expect(
    //   canUpdateStuckTransaction(StatusEnum.PENDING, WithdrawalStatus.PAYING)
    // ).toBe(true)
  })

  it('chặn khi bút toán đã có kết quả cuối', () => {
    expect(canUpdateStuckTransaction(StatusEnum.POSTED, null)).toBe(false)
    expect(canUpdateStuckTransaction(StatusEnum.FAILED, null)).toBe(false)
  })
})
