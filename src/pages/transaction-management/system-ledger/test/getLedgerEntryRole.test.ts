import { describe, expect, it } from 'vitest'
import { getLedgerEntryRole, getLedgerFeeSplit } from '../constants/SystemLedger.constant'

const fee = (extra: object) => ({
  transactionType: 'P2P_TRANSFER',
  direction: 'CREDIT',
  account: { ownerType: 'SYSTEM', glCode: 'REV_USER_FEE' },
  ...extra
})

describe('getLedgerEntryRole', () => {
  it('chỉ gán vai trò cho chuyển tiền P2P', () => {
    expect(
      getLedgerEntryRole({ transactionType: 'CASH_IN', direction: 'CREDIT' })
    ).toBeNull()
  })

  it('người gửi bị Nợ, người nhận được Có', () => {
    const base = { transactionType: 'P2P_TRANSFER', account: { glCode: 'USER_WALLET_VND' } }
    expect(getLedgerEntryRole({ ...base, direction: 'DEBIT' })).toBe('Người gửi')
    expect(getLedgerEntryRole({ ...base, direction: 'CREDIT' })).toBe('Người nhận')
  })

  it('dòng phí ghi đúng bên chịu', () => {
    expect(getLedgerEntryRole(fee({ feeBearer: 'SENDER' }))).toBe('Phí (bên gửi)')
    expect(getLedgerEntryRole(fee({ feeBearer: 'RECEIVER' }))).toBe('Phí (bên nhận)')
    expect(getLedgerEntryRole(fee({}))).toBe('Phí')
  })

  it('hai bên cùng chịu: một dòng phí tổng, phần từng bên lấy từ journal', () => {
    const both = { feeBearer: 'BOTH', senderFeeAmount: 1000, receiverFeeAmount: 4000, amount: 5000 }
    expect(getLedgerEntryRole(fee(both))).toBe('Phí (hai bên)')
    expect(getLedgerFeeSplit(fee(both))).toEqual({ sender: 1000, receiver: 4000 })
    expect(getLedgerFeeSplit(fee({ feeBearer: 'SENDER' }))).toBeNull()
  })
})
