import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FeeSetting } from '../FeeSetting'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn()
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportApplicableFeeRulesMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({
    exportFile: mocks.exportFile,
    isExporting: false
  })
}))

const WALLET_ID = '6b1f3c2a-8f4e-4a1b-9c33-7d9a1e5b0f21'

const rule = {
  assignmentId: '7b1f3c2a-8f4e-4a1b-9c33-7d9a1e5b0f22',
  feePolicyId: '1c9d4e77-2b60-4f0a-b1d8-5a2c9e3f4a10',
  feePolicyName: 'Phí nạp tiền ATM',
  appliedObjectType: 'ACCOUNT',
  customerGroup: null,
  serviceType: 'EWALLET_DEPOSIT',
  paymentMethod: 'WALLET_BALANCE',
  cardType: null,
  bankCode: null,
  componentType: 'TRANSACTION_FEE',
  tierFrom: 0,
  tierTo: null,
  formula: '1% + 5,000',
  minFee: 0,
  maxFee: 50000,
  createdAt: '2026-03-11T09:24:05',
  validFrom: '2026-04-01T00:00:00',
  validTo: null,
  effectiveStatus: 'ACTIVE'
}

const createPage = (content: typeof rule[]) => ({
  content,
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false,
    sort: { empty: true, sorted: false, unsorted: true }
  },
  totalElements: content.length,
  totalPages: content.length > 0 ? 1 : 0,
  size: 10,
  number: 0,
  numberOfElements: content.length,
  first: true,
  last: true,
  empty: content.length === 0,
  sort: { empty: true, sorted: false, unsorted: true }
})

describe('FeeSetting', () => {
  beforeEach(() => vi.clearAllMocks())

  it('gửi đúng bộ lọc ví và hiển thị dòng quy tắc đã nở', async () => {
    server.use(
      http.get('*/fee/applicable-rules', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('merchantId')).toBe(WALLET_ID)
        expect(url.searchParams.get('feeDomain')).toBe('EWALLET')
        expect(url.searchParams.get('page')).toBe('1')
        expect(url.searchParams.get('size')).toBe('10')

        return HttpResponse.json({ data: createPage([rule]) })
      })
    )

    renderWithProviders(
      <FeeSetting walletId={WALLET_ID} walletLabel='flexpay-user' />
    )

    expect(await screen.findByText('Phí nạp tiền ATM')).toBeInTheDocument()
    expect(screen.getByText('flexpay-user')).toBeInTheDocument()
    expect(screen.getByText('Tài khoản ví')).toBeInTheDocument()
    expect(screen.getByText('1% + 5,000')).toBeInTheDocument()
    expect(screen.getByText('0 trở lên')).toBeInTheDocument()
    expect(screen.getByText('11/03/2026 16:24:05')).toBeInTheDocument()
    expect(screen.getByText('01/04/2026 07:00:00')).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: /Xuất CSV/ })
    )
    expect(mocks.exportFile).toHaveBeenCalledWith({
      merchantId: WALLET_ID,
      feeDomain: 'EWALLET'
    })
  })

  it('hiển thị empty state khi không có quy tắc phù hợp', async () => {
    server.use(
      http.get('*/fee/applicable-rules', () =>
        HttpResponse.json({ data: createPage([]) })
      )
    )

    renderWithProviders(
      <FeeSetting walletId={WALLET_ID} walletLabel='flexpay-user' />
    )

    await waitFor(() =>
      expect(
        screen.getByText('Chưa có quy tắc phí đang áp dụng')
      ).toBeInTheDocument()
    )
    expect(
      screen.getByRole('button', { name: /Xuất CSV/ })
    ).toBeDisabled()
  })

  it('không gọi API khi mã ví không phải UUID', () => {
    renderWithProviders(
      <FeeSetting walletId='wallet-invalid' walletLabel='flexpay-user' />
    )

    expect(
      screen.getByText('Không thể tải quy tắc phí vì mã ví không hợp lệ.')
    ).toBeInTheDocument()
  })
})
