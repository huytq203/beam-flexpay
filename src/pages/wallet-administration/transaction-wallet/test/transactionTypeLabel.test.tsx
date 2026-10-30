import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { infoColumns } from '../columns/transactionInfo.columns'
import {
  getTransactionTypeLabel,
  toTransactionTypeKey
} from '../constants/Transaction.constant'

/** Cột "Loại/Mô tả" của bảng giao dịch ví. */
const renderTypeCell = (transactionType: string) => {
  const column = infoColumns.find((item) => item.title === 'Loại/Mô tả')
  const record = {
    transactionType,
    description: null
  } as unknown as UnifiedContentJournal
  const cell = column?.render?.(transactionType, record, 0) as ReactNode
  return render(<>{cell}</>)
}

describe('nhãn loại giao dịch màn giao dịch ví', () => {
  it('REFUND_BANK_PAYOUT thuộc nhóm REVERSAL và hiển thị "Hoàn tiền"', () => {
    expect(toTransactionTypeKey('REFUND_BANK_PAYOUT')).toBe('REVERSAL')
    expect(getTransactionTypeLabel('REFUND_BANK_PAYOUT')).toBe('Hoàn tiền')
    renderTypeCell('REFUND_BANK_PAYOUT')
    expect(screen.getByText('Hoàn tiền')).toBeInTheDocument()
  })

  it('REFUND_WALLET_CREDIT (hoàn chuyển/rút tiền về ví) cũng là "Hoàn tiền"', () => {
    expect(toTransactionTypeKey('REFUND_WALLET_CREDIT')).toBe('REVERSAL')
    expect(getTransactionTypeLabel('REFUND_WALLET_CREDIT')).toBe('Hoàn tiền')
    renderTypeCell('REFUND_WALLET_CREDIT')
    expect(screen.getByText('Hoàn tiền')).toBeInTheDocument()
  })

  it('loại đã biết giữ nguyên nhãn', () => {
    expect(getTransactionTypeLabel('CASH_OUT')).toBe('Rút tiền')
    expect(getTransactionTypeLabel('REVERSAL')).toBe('Hoàn tiền')
  })

  it('loại lạ vẫn hiện mã thô', () => {
    expect(toTransactionTypeKey('SOMETHING_NEW')).toBeNull()
    expect(getTransactionTypeLabel('SOMETHING_NEW')).toBe('SOMETHING_NEW')
    renderTypeCell('SOMETHING_NEW')
    expect(screen.getByText('SOMETHING_NEW')).toBeInTheDocument()
  })
})
