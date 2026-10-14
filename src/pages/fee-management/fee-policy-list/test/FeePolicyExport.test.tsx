import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeePolicyList from '../FeePolicyList'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn()
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportFeePoliciesMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({ exportFile: mocks.exportFile, isExporting: false })
}))

const page = {
  content: [
    {
      id: 'policy-1',
      name: 'Phí nạp tiền',
      serviceType: 'EWALLET_DEPOSIT',
      feeDomain: 'EWALLET',
      currency: 'VND',
      validFrom: '2026-09-01',
      validTo: null,
      status: 'ACTIVE',
      priority: 1,
      appliedTargets: [{ type: 'CUSTOMER_GROUP', code: 'VIP', count: 1 }]
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
}

const renderList = (route: string) => {
  server.use(
    http.get('*/fee/customer-segments', () => HttpResponse.json({ data: [] })),
    http.get('*/fee/banks', () =>
      HttpResponse.json({
        data: {
          content: [{ code: 'VCB', name: 'Vietcombank' }],
          totalElements: 1,
          totalPages: 1,
          size: 100,
          number: 0
        }
      })
    ),
    http.get('*/fee/policies/search', () => HttpResponse.json({ data: page }))
  )

  return renderWithProviders(
    <MessageProvider>
      <FeePolicyList />
    </MessageProvider>,
    { route }
  )
}

describe('danh sách chính sách phí — xuất CSV', () => {
  beforeEach(() => vi.clearAllMocks())

  it('xuất toàn bộ cấu hình theo filter hiện tại, không kèm trạng thái giao diện', async () => {
    const user = userEvent.setup()
    renderList(
      '/fee?feeScope=INPUT_COST&keyword=nap%20tien&subjectKeyword=0912&status=ACTIVE&appliedTarget=CUSTOMER_GROUP&serviceType=EWALLET_DEPOSIT&bankCode=VCB&providerCode=NAPAS&paymentMethod=ATM&validFrom=2026-09-01&validTo=2026-09-30&createdAtFrom=2026-08-01&createdAtTo=2026-08-31&direction=CASH_IN&page=3&size=50'
    )

    await user.click(await screen.findByRole('button', { name: /Xuất CSV/i }))

    await waitFor(() =>
      expect(mocks.exportFile).toHaveBeenCalledWith({
        feeScope: 'INPUT_COST',
        keyword: 'nap tien',
        subjectKeyword: '0912',
        effectiveStatus: 'ACTIVE',
        appliedTarget: 'CUSTOMER_GROUP',
        serviceType: 'EWALLET_DEPOSIT',
        bankCode: 'VCB',
        providerCode: 'NAPAS',
        paymentMethod: 'ATM',
        validFrom: '2026-09-01',
        validTo: '2026-09-30',
        createdAtFrom: '2026-08-01',
        createdAtTo: '2026-08-31'
      })
    )
  })
})
