import { describe, expect, it } from 'vitest'
import { getLedgerEntryRole } from '../constants/SystemLedger.constant'

const fee = (extra: object) => ({
  direction: 'CREDIT',
  account: { ownerType: 'SYSTEM', glCode: 'REV_USER_FEE' },
  ...extra
})

describe('getLedgerEntryRole', () => {
  it('người gửi bị Nợ, người nhận được Có, mọi loại giao dịch', () => {
    const account = { ownerType: 'USER', glCode: 'USER_WALLET_VND' }
    expect(getLedgerEntryRole({ account, direction: 'DEBIT' })).toBe(
      'Người gửi'
    )
    expect(getLedgerEntryRole({ account, direction: 'CREDIT' })).toBe(
      'Người nhận'
    )
  })

  it('tài khoản hệ thống không phải phí tính là bên nhận', () => {
    expect(
      getLedgerEntryRole({
        direction: 'DEBIT',
        account: { ownerType: 'SYSTEM', glCode: 'SYS_BANK_SETTLEMENT_VND' }
      })
    ).toBe('Người nhận')
  })

  it('hai khoản phí bằng nhau: phân biệt theo thứ tự ghi', () => {
    const tie = {
      feeBearer: 'BOTH',
      senderFeeAmount: 3045,
      receiverFeeAmount: 3045
    }
    expect(getLedgerEntryRole(fee({ ...tie, feeOrder: 0 }))).toBe(
      'Phí (bên gửi)'
    )
    expect(getLedgerEntryRole(fee({ ...tie, feeOrder: 1 }))).toBe(
      'Phí (bên nhận)'
    )
  })

  it('dòng phí ghi đúng bên chịu, thiếu feeBearer là bên gửi', () => {
    expect(getLedgerEntryRole(fee({ feeBearer: 'SENDER' }))).toBe(
      'Phí (bên gửi)'
    )
    expect(getLedgerEntryRole(fee({ feeBearer: 'RECEIVER' }))).toBe(
      'Phí (bên nhận)'
    )
    expect(getLedgerEntryRole(fee({}))).toBe('Phí (bên gửi)')
  })

  it('hai bên cùng chịu: phân biệt theo số tiền từng dòng phí', () => {
    const both = {
      feeBearer: 'BOTH',
      senderFeeAmount: 300,
      receiverFeeAmount: 210
    }
    expect(getLedgerEntryRole(fee({ ...both, amount: 300 }))).toBe(
      'Phí (bên gửi)'
    )
    expect(getLedgerEntryRole(fee({ ...both, amount: 210 }))).toBe(
      'Phí (bên nhận)'
    )
    expect(
      getLedgerEntryRole(fee({ ...both, receiverFeeAmount: 300, amount: 300 }))
    ).toBe('Phí')
  })
})
