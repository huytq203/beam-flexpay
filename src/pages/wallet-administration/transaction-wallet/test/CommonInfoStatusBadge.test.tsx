import { renderWithProviders } from '@/test/render'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CommonInfo from '../components/CommonInfo'

const transactionWith = (
  status: string,
  displayStatus?: string
): UnifiedContentJournal =>
  ({
    id: 'journal-id',
    journalCode: 'JRN-001',
    status,
    displayStatus,
    transactionType: 'CASH_OUT',
    amount: 100_000,
    currency: 'VND'
  }) as unknown as UnifiedContentJournal

describe('badge trạng thái ở thông tin chung giao dịch', () => {
  it.each([
    ['POSTED', 'Đã thành công', 'text-success-strong'],
    ['FAILED', 'Thất bại', 'text-danger-strong'],
    ['PENDING', 'Chờ xử lý', 'text-warning-strong'],
    ['AUTHORIZED', 'Đã cấp phép', 'text-warning-strong'],
    ['RECONCILIATION_REQUIRED', 'Cần đối soát', 'text-warning-strong'],
    ['CREDIT_FAILED', 'Ghi có thất bại', 'text-danger-strong']
  ])('%s hiện “%s” đúng tông màu', (status, label, toneClass) => {
    renderWithProviders(<CommonInfo data={transactionWith(status)} />)

    expect(screen.getByText(label)).toHaveClass(toneClass)
  })

  it('nhãn theo displayStatus: Thất bại hoàn tiền', () => {
    renderWithProviders(
      <CommonInfo data={transactionWith('FAILED', 'FAILED_REFUND')} />
    )

    expect(screen.getByText('Thất bại hoàn tiền')).toHaveClass(
      'text-danger-strong'
    )
  })

  it.each([
    ['APPROVED', 'Đã duyệt — đang chi'],
    ['PAYING', 'Đang chi']
  ])('nhãn theo displayStatus %s khi sổ cái còn PENDING', (display, label) => {
    renderWithProviders(
      <CommonInfo data={transactionWith('PENDING', display)} />
    )

    expect(screen.getByText(label)).toHaveClass('text-warning-strong')
  })
})
