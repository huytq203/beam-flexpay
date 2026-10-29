import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeePolicyList from '../FeePolicyList'
import MerchantFeePolicyList from '../MerchantFeePolicyList'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn(),
  exportCsvArgs: [] as Array<{ filenamePrefix: string }>
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportFeePoliciesMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: (args: { filenamePrefix: string }) => {
    mocks.exportCsvArgs.push(args)
    return { exportFile: mocks.exportFile, isExporting: false }
  }
}))

const page = {
  content: [
    {
      id: 'policy-merchant-1',
      name: 'Phí thu hộ VA merchant',
      serviceType: 'MERCHANT_VA_BILL_COLLECTION',
      feeDomain: 'MERCHANT',
      currency: 'VND',
      validFrom: '2026-11-01',
      validTo: null,
      status: 'INIT',
      priority: 4,
      appliedTargets: [{ type: 'ALL', code: null, count: 0 }]
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
}

const LocationProbe = () => (
  <div data-testid='path'>{useLocation().pathname}</div>
)

describe('màn Cấu hình phí ĐVCNTT: danh sách theo miền MERCHANT', () => {
  const requests: URL[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    requests.length = 0
    mocks.exportCsvArgs.length = 0
    sessionStorage.clear()
    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: [] })
      ),
      http.get('*/fee/banks', () =>
        HttpResponse.json({
          data: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 100,
            number: 0
          }
        })
      ),
      http.get('*/fee/policies/search', ({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json({ data: page })
      })
    )
  })

  const renderMerchant = (route: string) => {
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.FEE_FULL]))
    return renderWithProviders(
      <MessageProvider>
        <MerchantFeePolicyList />
        <LocationProbe />
      </MessageProvider>,
      { route, store }
    )
  }

  const tabNames = () =>
    within(screen.getByRole('group', { name: 'Loại giao dịch' }))
      .getAllByRole('button')
      .map((tab) => tab.textContent)

  it('luôn gửi feeDomain=MERCHANT và policyKind=CUSTOMER_FEE, bỏ qua serviceType ví trên URL', async () => {
    renderMerchant('/merchant/fee-config?serviceType=EWALLET_DEPOSIT')

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    for (const request of requests) {
      expect(request.searchParams.get('feeDomain')).toBe('MERCHANT')
      expect(request.searchParams.get('policyKind')).toBe('CUSTOMER_FEE')
      expect(request.searchParams.get('serviceType')).toBeNull()
    }
    await screen.findByText('Phí thu hộ VA merchant')
  })

  it('tab lọc chỉ có Thu hộ VA, Chi hộ chuyển khoản ngân hàng và Rút tiền, cộng tab Tất cả', async () => {
    renderMerchant('/merchant/fee-config?serviceType=EWALLET_DEPOSIT')
    await screen.findByText('Phí thu hộ VA merchant')

    expect(tabNames()).toEqual([
      'Tất cả',
      'Thu hộ VA',
      'Chi hộ chuyển khoản ngân hàng',
      'Rút tiền'
    ])
  })

  const payerFilterOptions = async () => {
    await userEvent.click(await screen.findByLabelText('Người chịu phí'))
    return (await screen.findAllByRole('option')).map((option) =>
      option.getAttribute('aria-label')
    )
  }

  it('bộ lọc người chịu phí chỉ có Merchant và người nộp / nhận tiền', async () => {
    renderMerchant('/merchant/fee-config')
    await screen.findByText('Phí thu hộ VA merchant')

    expect(await payerFilterOptions()).toEqual([
      'Merchant',
      'Người nộp / nhận tiền'
    ])
  })

  it('tab Chi hộ gửi serviceType=MERCHANT_DISBURSEMENT và gọi bên đối diện là Người nhận tiền', async () => {
    renderMerchant('/merchant/fee-config?serviceType=MERCHANT_DISBURSEMENT')
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(requests[0].searchParams.get('serviceType')).toBe(
      'MERCHANT_DISBURSEMENT'
    )

    expect(await payerFilterOptions()).toEqual(['Merchant', 'Người nhận tiền'])
  })

  it('nút thêm chính sách chuyển tới màn tạo của ĐVCNTT', async () => {
    const user = userEvent.setup()
    renderMerchant('/merchant/fee-config')

    await user.click(
      await screen.findByRole('button', { name: /Thêm chính sách phí/ })
    )

    expect(screen.getByTestId('path')).toHaveTextContent(
      '/secure-panel/merchant/fee-config/create'
    )
  })

  it('nút sửa của chính sách chờ duyệt chuyển tới màn sửa của ĐVCNTT', async () => {
    const user = userEvent.setup()
    renderMerchant('/merchant/fee-config')
    await screen.findByText('Phí thu hộ VA merchant')

    await user.click(
      await screen.findByRole('button', { name: 'Sửa cấu hình' })
    )

    expect(screen.getByTestId('path')).toHaveTextContent(
      '/secure-panel/merchant/fee-config/edit/policy-merchant-1'
    )
  })

  it('xuất CSV gửi feeDomain=MERCHANT và dùng tiền tố cau-hinh-phi-dvcntt', async () => {
    const user = userEvent.setup()
    renderMerchant('/merchant/fee-config?serviceType=EWALLET_DEPOSIT')

    await user.click(await screen.findByRole('button', { name: /Xuất CSV/i }))

    await waitFor(() =>
      expect(mocks.exportFile).toHaveBeenCalledWith(
        expect.objectContaining({
          feeDomain: 'MERCHANT',
          policyKind: 'CUSTOMER_FEE',
          serviceType: undefined
        })
      )
    )
    expect(mocks.exportCsvArgs[0].filenamePrefix).toBe('cau-hinh-phi-dvcntt')
  })

  it('màn Cấu hình phí chung không gửi feeDomain và không có tab thu hộ / chi hộ', async () => {
    renderWithProviders(
      <MessageProvider>
        <FeePolicyList />
      </MessageProvider>,
      { route: '/fee' }
    )

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(requests[0].searchParams.get('feeDomain')).toBeNull()
    expect(tabNames()).not.toContain('Thu hộ VA')
    expect(tabNames()).not.toContain('Chi hộ chuyển khoản ngân hàng')
  })

  it('màn Cấu hình phí chung giữ nguyên bộ lọc người chịu phí', async () => {
    renderWithProviders(
      <MessageProvider>
        <FeePolicyList />
      </MessageProvider>,
      { route: '/fee' }
    )

    // List ảo của antd trong jsdom chỉ dựng hai dòng đầu: đủ để thấy nhãn ví không đổi.
    expect(await payerFilterOptions()).toEqual(['Người chuyển', 'Người nhận'])
  })
})
