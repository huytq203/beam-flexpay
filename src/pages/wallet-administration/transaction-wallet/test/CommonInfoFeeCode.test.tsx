import { renderWithProviders } from '@/test/render'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CommonInfo from '../components/CommonInfo'

const transaction = {
  id: 'journal-id',
  journalCode: 'JRN-001',
  status: 'POSTED',
  transactionType: 'CASH_OUT',
  amount: 100_000,
  feeAmount: 5_000,
  currency: 'VND',
  feeCalculationId: 'fee-calculation-id',
  paymentMethod: 'BANK_TRANSFER',
  transactionId: 'gl-id'
} as unknown as UnifiedContentJournal

describe('mã phí trên thông tin chung giao dịch', () => {
  it('hiện mã đối soát phí kèm nút sao chép', () => {
    renderWithProviders(
      <CommonInfo
        data={transaction}
        feeCode='FF26BH44R'
      />
    )

    expect(screen.getByText('Mã phí:')).toBeInTheDocument()
    expect(screen.getByText('FF26BH44R')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Sao chép Mã phí:: FF26BH44R')
    ).toBeInTheDocument()
  })

  it('hiện -- khi giao dịch không có báo giá phí hoặc fee chưa trả mã', () => {
    renderWithProviders(<CommonInfo data={transaction} />)

    expect(screen.getByLabelText('Sao chép Mã phí:: --')).toBeInTheDocument()
  })
})
