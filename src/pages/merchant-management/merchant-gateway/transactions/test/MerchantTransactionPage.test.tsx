import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import MerchantTransactionPage from '../pages/MerchantTransactionPage'

const journalRequests: URL[] = []

const journal = {
  id: 'j-1',
  journalCode: 'JR-1',
  transactionCode: 'FW26100900184',
  status: 'POSTED',
  transactionType: 'MERCHANT_PAYMENT',
  from: { id: 'u-1', username: '0901234567', displayName: null, type: 'USER' },
  to: {
    id: 'm-1',
    username: 'hoanglong',
    displayName: 'Hoàng Long',
    type: 'MERCHANT'
  },
  amount: 12500000,
  grossAmount: 12525000,
  feeAmount: 25000,
  currency: 'VND',
  paymentMethod: 'QR_CODE',
  bankCode: null,
  bankRefId: 'VCB-8841207',
  transactionId: 't-1',
  reversesJournalId: null,
  reversedByJournalId: null,
  description: 'Thanh toán đơn hàng',
  failureReason: null,
  createdAt: '2026-10-09T07:32:05',
  postedAt: '2026-10-09T07:32:09',
  archivedAt: null,
  sourceDomain: 'EWALLET'
}

beforeEach(() => {
  journalRequests.length = 0
  server.use(
    http.get('*/wallet/journal/unified', ({ request }) => {
      journalRequests.push(new URL(request.url))
      return HttpResponse.json({
        data: {
          content: [journal],
          totalElements: 1,
          totalPages: 1,
          size: 10,
          number: 0,
          summary: {
            totalCount: 1,
            successCount: 1,
            processingCount: 0,
            pendingCount: 0,
            failedCount: 0
          }
        }
      })
    })
  )
})

describe('MerchantTransactionPage', () => {
  it('mở màn là tải ngay giao dịch nguồn MERCHANT và hiện dòng dữ liệu', async () => {
    renderWithProviders(<MerchantTransactionPage />)

    expect(await screen.findByText('FW26100900184')).toBeInTheDocument()
    expect(screen.getByText('Hoàng Long')).toBeInTheDocument()
    expect(screen.getByText('12,500,000 VND')).toBeInTheDocument()

    const request = journalRequests[0]
    expect(request.searchParams.get('sourceDomain')).toBe('MERCHANT')
    expect(request.searchParams.get('includeSummary')).toBe('true')
    expect(request.searchParams.has('partyId')).toBe(false)
  })

  it('có bộ lọc đúng mẫu: nút Xóa bộ lọc và Tìm kiếm', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MerchantTransactionPage />)

    expect(await screen.findByText('Bộ lọc tìm kiếm')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Xóa bộ lọc/ })).toBeVisible()
    await user.type(screen.getByLabelText('Từ khóa'), 'FW26')
    expect(screen.getByLabelText('Từ khóa')).toHaveValue('FW26')
  })
})
