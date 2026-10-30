import { renderWithProviders } from '@/test/render'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CommonInfo from '../components/CommonInfo'

/**
 * Lệnh chi hoàn nạp ra ngân hàng (`REFUND_BANK_PAYOUT`) mang mã FW như lệnh rút; mã hoàn RF-…-Pn và mã
 * giao dịch nạp gốc nằm trong `details` (metadata journal) để người xem tra ngược.
 */
const payout = {
  id: 'journal-id',
  journalCode: 'JRN-002',
  transactionCode: 'FW267WOM8',
  status: 'PENDING',
  transactionType: 'REFUND_BANK_PAYOUT',
  amount: 509_716,
  currency: 'VND',
  details: {
    refundCode: 'RF-20261029-000006',
    payoutReference: 'RF-20261029-000006-P1',
    originalTransactionCode: 'FW26QXRPO'
  }
} as unknown as UnifiedContentJournal

describe('thông tin chung của lệnh chi hoàn tiền', () => {
  it('hiện mã giao dịch FW, mã hoàn theo lần chi và giao dịch gốc', () => {
    renderWithProviders(<CommonInfo data={payout} />)

    expect(screen.getByText('FW267WOM8')).toBeInTheDocument()
    expect(screen.getByText('Mã hoàn tiền:')).toBeInTheDocument()
    expect(screen.getByText('RF-20261029-000006-P1')).toBeInTheDocument()
    expect(screen.getByText('Giao dịch gốc:')).toBeInTheDocument()
    expect(screen.getByText('FW26QXRPO')).toBeInTheDocument()
  })

  it('hoàn chuyển/rút tiền về ví (REFUND_WALLET_CREDIT) cũng hiện mã hoàn và giao dịch gốc', () => {
    renderWithProviders(
      <CommonInfo
        data={
          {
            ...payout,
            transactionCode: 'FW26WCRED',
            transactionType: 'REFUND_WALLET_CREDIT',
            details: {
              refundCode: 'RF-20261030-000001',
              originalTransactionCode: 'FW26P2P01'
            }
          } as unknown as UnifiedContentJournal
        }
      />
    )

    expect(screen.getByText('Mã hoàn tiền:')).toBeInTheDocument()
    expect(screen.getByText('RF-20261030-000001')).toBeInTheDocument()
    expect(screen.getByText('FW26P2P01')).toBeInTheDocument()
  })

  it('không hiện hai dòng này với giao dịch không phải lệnh chi hoàn', () => {
    renderWithProviders(
      <CommonInfo
        data={
          {
            ...payout,
            transactionType: 'CASH_OUT',
            details: { destinationBank: 'VCB' }
          } as unknown as UnifiedContentJournal
        }
      />
    )

    expect(screen.queryByText('Mã hoàn tiền:')).not.toBeInTheDocument()
    expect(screen.queryByText('Giao dịch gốc:')).not.toBeInTheDocument()
  })
})
