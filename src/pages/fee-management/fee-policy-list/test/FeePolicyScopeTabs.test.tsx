import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import FeePolicyList from '../FeePolicyList'

const component = (overrides: Record<string, unknown>) => ({
  id: 'component',
  feePolicyId: 'policy-both',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: 'DIRECT',
  fixedAmount: 0,
  percentage: 0,
  roundMode: 'UP',
  minFee: 0,
  maxFee: 0,
  payerObjectType: null,
  payerObjectId: null,
  beneficiaryObjectType: null,
  beneficiaryObjectId: null,
  tiers: [],
  ...overrides
})

const policy = {
  id: 'policy-both',
  name: 'Chính sách A – Nạp ví VCB',
  serviceType: 'EWALLET_DEPOSIT',
  feeDomain: 'EWALLET',
  currency: 'VND',
  validFrom: '2026-11-01',
  validTo: null,
  status: 'ACTIVE',
  priority: 4,
  appliedTargets: [{ type: 'ALL', code: null, count: 0 }],
  configuration: {
    assignments: [
      {
        id: 'assignment-vcb',
        feePolicyId: 'policy-both',
        merchantId: null,
        bankCode: 'VCB',
        paymentMethod: null,
        cardType: null,
        serviceType: 'EWALLET_DEPOSIT',
        customerGroup: null,
        subjectType: null,
        subjectId: null,
        status: 'ACTIVE',
        effectiveFromDate: null,
        effectiveToDate: null
      }
    ],
    components: [
      component({
        id: 'c-output',
        feeScope: 'OUTPUT_FEE',
        componentType: 'TRANSACTION_FEE',
        percentage: 0.1,
        payerType: 'USER',
        beneficiaryType: 'SYSTEM'
      }),
      component({
        id: 'c-input',
        feeScope: 'INPUT_COST',
        componentType: 'BANK_FEE',
        fixedAmount: 500,
        payerType: 'SYSTEM',
        beneficiaryType: 'BANK'
      })
    ]
  }
}

const page = {
  content: [policy],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
}

const LocationProbe = () => (
  <div data-testid='search'>{useLocation().search}</div>
)

describe('danh sách chính sách phí tách theo luồng phí', () => {
  const requests: URL[] = []

  beforeEach(() => {
    requests.length = 0
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

  const renderList = (route = '/fee') =>
    renderWithProviders(
      <MessageProvider>
        <FeePolicyList />
        <LocationProbe />
      </MessageProvider>,
      { route }
    )

  it('mặc định xem phí đầu ra và gửi policyKind=CUSTOMER_FEE xuống API, không gửi miền phí', async () => {
    renderList()

    expect(
      await screen.findByRole('tab', { name: /Phí đầu ra/ })
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.queryByRole('tablist', { name: 'Miền phí' })
    ).not.toBeInTheDocument()
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(requests[0].searchParams.get('policyKind')).toBe('CUSTOMER_FEE')
    expect(requests[0].searchParams.get('feeScope')).toBeNull()
    expect(requests[0].searchParams.get('feeDomain')).toBeNull()
  })

  it('tab phí đầu ra chỉ hiện thành phần thu của khách', async () => {
    renderList()
    await screen.findByText('Chính sách A – Nạp ví VCB')

    const row = screen.getByText('Chính sách A – Nạp ví VCB').closest('tr')!
    expect(within(row).getByText('Phí giao dịch cơ bản')).toBeInTheDocument()
    expect(within(row).getByText(/Người chuyển → Hệ thống/)).toBeInTheDocument()
    expect(
      within(row).queryByText('Phí nhà cung cấp đối tác/bank')
    ).not.toBeInTheDocument()
    expect(within(row).getByText(/NH: VCB/)).toBeInTheDocument()
  })

  it('đổi sang phí đầu vào thì gọi lại với policyKind=INPUT_COST, ghi lên URL và chỉ hiện khoản chi', async () => {
    const user = userEvent.setup()
    renderList()
    await screen.findByText('Chính sách A – Nạp ví VCB')

    await user.click(screen.getByRole('tab', { name: /Phí đầu vào/ }))

    await waitFor(() =>
      expect(
        requests.some(
          (url) => url.searchParams.get('policyKind') === 'INPUT_COST'
        )
      ).toBe(true)
    )
    const row = (await screen.findByText('Chính sách A – Nạp ví VCB')).closest(
      'tr'
    )!
    expect(
      within(row).getByText('Phí nhà cung cấp đối tác/bank')
    ).toBeInTheDocument()
    expect(within(row).getByText(/Hệ thống → Ngân hàng/)).toBeInTheDocument()
    expect(
      within(row).queryByText('Phí giao dịch cơ bản')
    ).not.toBeInTheDocument()
  })

  it('dòng mở rộng chỉ đọc các thành phần của luồng đang xem', async () => {
    const user = userEvent.setup()
    renderList('/fee?feeScope=INPUT_COST')
    await screen.findByText('Chính sách A – Nạp ví VCB')

    await user.click(
      (await screen.findAllByRole('button', { name: 'Expand row' }))[0]
    )
    const detail = await screen.findByRole('region', {
      name: 'Chi tiết Chính sách A – Nạp ví VCB'
    })

    expect(within(detail).getByText('Phí đầu vào')).toBeInTheDocument()
    expect(
      within(detail).getByText('1. Phí nhà cung cấp đối tác/bank')
    ).toBeInTheDocument()
    expect(
      within(detail).queryByText('1. Phí giao dịch cơ bản')
    ).not.toBeInTheDocument()
  })

  it('tab phí đầu vào đồng bộ lên URL và đọc lại từ URL', async () => {
    const user = userEvent.setup()
    renderList()
    await screen.findByText('Chính sách A – Nạp ví VCB')

    await user.click(screen.getByRole('tab', { name: /Phí đầu vào/ }))

    await waitFor(() =>
      expect(screen.getByTestId('search')).toHaveTextContent(
        'feeScope=INPUT_COST'
      )
    )
  })

  it('mở thẳng URL phí đầu vào thì gửi policyKind=INPUT_COST và ẩn bộ lọc đối tượng khách', async () => {
    renderList('/fee?feeScope=INPUT_COST&appliedTarget=ACCOUNT&payerType=USER')

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const last = requests[requests.length - 1]
    expect(last.searchParams.get('policyKind')).toBe('INPUT_COST')
    expect(last.searchParams.get('appliedTarget')).toBeNull()
    expect(last.searchParams.get('payerType')).toBeNull()
    const filters = within(document.getElementById('feePolicyFilter')!)
    expect(filters.queryByText('Đối tượng áp dụng')).not.toBeInTheDocument()
    expect(filters.queryByText('Người chịu phí')).not.toBeInTheDocument()
    expect(filters.getByText('Người hưởng phí')).toBeInTheDocument()
  })

  it('tab phí đầu ra vẫn hiện bộ lọc đối tượng khách', async () => {
    renderList()
    await screen.findByText('Chính sách A – Nạp ví VCB')
    expect(
      within(document.getElementById('feePolicyFilter')!).getByText(
        'Đối tượng áp dụng'
      )
    ).toBeInTheDocument()
  })
})
