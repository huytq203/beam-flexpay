import { describe, expect, it } from 'vitest'
import { getLedgerEntryRole } from '../constants/SystemLedger.constant'

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

  it('hai bên cùng chịu thì ghép theo số tiền từng bên', () => {
    const both = { feeBearer: 'BOTH', senderFeeAmount: 3000, receiverFeeAmount: 2000 }
    expect(getLedgerEntryRole(fee({ ...both, amount: 3000 }))).toBe('Phí (bên gửi)')
    expect(getLedgerEntryRole(fee({ ...both, amount: 2000 }))).toBe('Phí (bên nhận)')
  })

  it('hai bên chịu bằng nhau thì không ghép được từng dòng', () => {
    const even = { feeBearer: 'BOTH', senderFeeAmount: 2500, receiverFeeAmount: 2500, amount: 2500 }
    expect(getLedgerEntryRole(fee(even))).toBe('Phí (hai bên)')
  })
})
