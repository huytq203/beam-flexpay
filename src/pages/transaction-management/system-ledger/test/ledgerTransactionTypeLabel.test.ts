import { describe, expect, it } from 'vitest'
import {
  LedgerTransactionType,
  getLedgerTransactionTypeLabel
} from '../constants/SystemLedger.constant'

describe('nhãn loại giao dịch màn sổ cái', () => {
  it('REFUND_BANK_PAYOUT và REVERSAL đều hiển thị "Hoàn tiền"', () => {
    expect(getLedgerTransactionTypeLabel('REFUND_BANK_PAYOUT')).toBe(
      'Hoàn tiền'
    )
    expect(getLedgerTransactionTypeLabel('REVERSAL')).toBe('Hoàn tiền')
  })

  it('loại đã biết giữ nguyên nhãn, loại lạ hiện mã thô, rỗng là --', () => {
    expect(getLedgerTransactionTypeLabel('CASH_IN')).toBe('Nạp tiền')
    expect(getLedgerTransactionTypeLabel('SOMETHING_NEW')).toBe('SOMETHING_NEW')
    expect(getLedgerTransactionTypeLabel(null)).toBe('--')
  })

  it('không thêm lựa chọn lọc mới vào ô Loại giao dịch', () => {
    expect(Object.keys(LedgerTransactionType)).toEqual([
      'CASH_IN',
      'CASH_OUT',
      'P2P_TRANSFER'
    ])
  })
})
