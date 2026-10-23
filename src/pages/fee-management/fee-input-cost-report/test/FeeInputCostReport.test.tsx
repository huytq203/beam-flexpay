import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeeInputCostReport from '../FeeInputCostReport'
import { defaultReportFilters } from '../utils/reportFilters'

const mocks = vi.hoisted(() => ({ exportFile: vi.fn() }))

vi.mock('@services/apiExportCsv', () => ({
  useExportInputCostReportMutation: () => [vi.fn(), { reset: vi.fn() }]
}))
vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({ exportFile: mocks.exportFile, isExporting: false })
}))

const row = (over: Record<string, unknown> = {}) => ({
  feeCalculationId: 'c1',
  feeCode: 'FF001',
  operationId: 'op1',
  issuedAt: '2026-10-05T10:00:00',
  serviceType: 'EWALLET_DEPOSIT',
  providerCode: 'NAPAS',
  bankCode: 'VCB',
  paymentMethod: 'ATM',
  transactionAmount: 1000000,
  customerFee: 5000,
  inputCost: 7000,
  margin: -2000,
  inputCostPolicyId: 'p1',
  inputCostPolicyName: 'Phí NAPAS ATM',
  components: [
    { componentType: 'SYSTEM_FEE', calculatedFee: 7000, beneficiaryType: 'PARTNER' }
  ],
  ...over
})

const summary = {
  groups: [
    {
      providerCode: 'NAPAS',
      bankCode: 'VCB',
      serviceType: 'EWALLET_DEPOSIT',
      transactionCount: 3,
      totalAmount: 3000000,
      totalCustomerFee: 20000,
      totalInputCost: 15000,
      margin: 5000
    },
    {
      providerCode: 'NAPAS',
      bankCode: 'TCB',
      serviceType: 'EWALLET_WITHDRAWAL',
      transactionCount: 1,
      totalAmount: 500000,
      totalCustomerFee: 1000,
      totalInputCost: 4000,
      margin: -3000
    }
  ],
  totals: {
    transactionCount: 4,
    totalAmount: 3500000,
    totalCustomerFee: 21000,
    totalInputCost: 19000,
    margin: 2000
  }
}

const seen: { summary: URLSearchParams[]; tx: URLSearchParams[] } = {
  summary: [],
  tx: []
}

const setup = () => {
  server.use(
    http.get('*/fee/payment-partners', () =>
      HttpResponse.json({
        data: [{ code: 'NAPAS', name: 'NAPAS', provider: true, issuer: false, status: 'ACTIVE' }]
      })
    ),
    http.get('*/fee/banks', () =>
      HttpResponse.json({
        data: { content: [{ code: 'VCB', name: 'Vietcombank' }], totalElements: 1, totalPages: 1, size: 100, number: 0 }
      })
    ),
    http.get('*/fee/input-cost-report/summary', ({ request }) => {
      seen.summary.push(new URL(request.url).searchParams)
      return HttpResponse.json({ data: summary })
    }),
    http.get('*/fee/input-cost-report/transactions', ({ request }) => {
      seen.tx.push(new URL(request.url).searchParams)
      return HttpResponse.json({
        data: { content: [row()], totalElements: 45, totalPages: 3, size: 20, number: 0 }
      })
    })
  )
  return renderWithProviders(
    <MessageProvider>
      <FeeInputCostReport />
    </MessageProvider>,
    { route: '/' }
  )
}

describe('Báo cáo phí đầu vào', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    seen.summary = []
    seen.tx = []
  })

  it('gửi from/to mặc định, bỏ các bộ lọc trống, page bắt đầu từ 1', async () => {
    setup()
    await waitFor(() => expect(seen.tx.length).toBeGreaterThan(0))
    const { from, to } = defaultReportFilters()
    const q = seen.tx[0]
    expect(q.get('from')).toBe(from)
    expect(q.get('to')).toBe(to)
    expect(q.get('page')).toBe('1')
    expect(q.get('size')).toBe('20')
    for (const k of ['providerCode', 'bankCode', 'serviceType', 'paymentMethod']) {
      expect(q.has(k)).toBe(false)
    }
    await waitFor(() => expect(seen.summary.length).toBeGreaterThan(0))
    expect(seen.summary[0].has('page')).toBe(false)
  })

  it('hiển thị tổng hợp, dòng tổng cộng và tô đỏ chênh lệch âm', async () => {
    setup()
    expect(await screen.findByText('Tổng cộng')).toBeInTheDocument()
    const totals = screen.getByTestId('summary-totals')
    expect(within(totals).getByText(/3\.500\.000/)).toBeInTheDocument()
    const negatives = document.querySelectorAll('[data-negative="true"]')
    expect(negatives.length).toBeGreaterThanOrEqual(2)
    expect(negatives[0].className).toContain('text-red-600')
    expect(await screen.findByText('Phí NAPAS ATM')).toBeInTheDocument()
  })

  it('chuyển trang chi tiết gửi page=2', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('Phí NAPAS ATM')
    await user.click(await screen.findByTitle('2'))
    await waitFor(() => expect(seen.tx.some((q) => q.get('page') === '2')).toBe(true))
  })

  it('xuất CSV với bộ lọc hiện tại', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('Phí NAPAS ATM')
    await user.click(screen.getByRole('button', { name: /Xuất CSV/i }))
    const { from, to } = defaultReportFilters()
    await waitFor(() =>
      expect(mocks.exportFile).toHaveBeenCalledWith({ from, to })
    )
  })

  it('Từ ngày sau Đến ngày: báo lỗi và không gọi lại API', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('Phí NAPAS ATM')
    const before = seen.tx.length
    const inputs = screen.getAllByPlaceholderText(/Chọn ngày/)
    await user.click(inputs[0])
    await user.clear(inputs[0])
    await user.type(inputs[0], '31/12/2099{enter}')
    await user.click(screen.getByRole('button', { name: /Xem báo cáo/ }))
    expect(
      await screen.findByText(/Từ ngày phải nhỏ hơn hoặc bằng Đến ngày/)
    ).toBeInTheDocument()
    expect(seen.tx.length).toBe(before)
  })
})
