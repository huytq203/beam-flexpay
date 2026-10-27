import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ComponentType } from 'react'
import { useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import FeePolicyList from '../FeePolicyList'
import InputCostPolicyList from '../InputCostPolicyList'

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
  <div data-testid='path'>{useLocation().pathname}</div>
)

describe('hai màn danh sách: Cấu hình phí và Cấu hình phí đầu vào', () => {
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

  const renderList = (Page: ComponentType, route = '/fee') =>
    renderWithProviders(
      <MessageProvider>
        <Page />
        <LocationProbe />
      </MessageProvider>,
      { route }
    )

  const filterForm = () => within(document.getElementById('feePolicyFilter')!)

  it('Cấu hình phí luôn gửi policyKind=CUSTOMER_FEE, không có tab luồng phí, không gửi miền phí', async () => {
    renderList(FeePolicyList)

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(
      screen.queryByRole('tablist', { name: 'Luồng phí' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: /Phí đầu vào/ })
    ).not.toBeInTheDocument()
    expect(requests[0].searchParams.get('policyKind')).toBe('CUSTOMER_FEE')
    expect(requests[0].searchParams.get('feeScope')).toBeNull()
    expect(requests[0].searchParams.get('feeDomain')).toBeNull()
    // Thu hộ / chi hộ chỉ có ở màn Cấu hình phí ĐVCNTT, không có tab ở màn chung.
    const serviceTypeTabs = within(
      screen.getByRole('group', { name: 'Loại giao dịch' })
    )
    expect(serviceTypeTabs.queryByText('Thu hộ VA')).not.toBeInTheDocument()
    expect(
      serviceTypeTabs.queryByText('Chi hộ chuyển khoản ngân hàng')
    ).not.toBeInTheDocument()
  })

  it('Cấu hình phí chỉ hiện thành phần thu của khách và vẫn có bộ lọc đối tượng khách', async () => {
    renderList(FeePolicyList)
    await screen.findByText('Chính sách A – Nạp ví VCB')

    const row = screen.getByText('Chính sách A – Nạp ví VCB').closest('tr')!
    expect(within(row).getByText('Phí giao dịch cơ bản')).toBeInTheDocument()
    expect(within(row).getByText(/Người chuyển → Hệ thống/)).toBeInTheDocument()
    expect(
      within(row).queryByText('Phí nhà cung cấp đối tác/bank')
    ).not.toBeInTheDocument()
    expect(within(row).getByText(/NH: VCB/)).toBeInTheDocument()
    expect(filterForm().getByText('Đối tượng áp dụng')).toBeInTheDocument()
    expect(filterForm().getByText('Người chịu phí')).toBeInTheDocument()
  })

  it('Cấu hình phí đầu vào luôn gửi policyKind=INPUT_COST và chỉ hiện khoản chi', async () => {
    renderList(InputCostPolicyList, '/fee-input-cost')

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(requests[requests.length - 1].searchParams.get('policyKind')).toBe(
      'INPUT_COST'
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

  it('Cấu hình phí đầu vào ẩn bộ lọc và cột đối tượng khách, bỏ qua bộ lọc đó trên URL', async () => {
    renderList(
      InputCostPolicyList,
      '/fee-input-cost?appliedTarget=ACCOUNT&payerType=USER&feeBearer=BOTH'
    )

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const last = requests[requests.length - 1]
    expect(last.searchParams.get('policyKind')).toBe('INPUT_COST')
    expect(last.searchParams.get('appliedTarget')).toBeNull()
    expect(last.searchParams.get('payerType')).toBeNull()
    expect(last.searchParams.get('feeBearer')).toBeNull()
    expect(
      filterForm().queryByText('Đối tượng áp dụng')
    ).not.toBeInTheDocument()
    expect(filterForm().queryByText('Người chịu phí')).not.toBeInTheDocument()
    expect(filterForm().queryByText('Bên chịu phí')).not.toBeInTheDocument()
    expect(filterForm().getByText('Người hưởng phí')).toBeInTheDocument()
    expect(filterForm().getByText('Nhà cung cấp')).toBeInTheDocument()
    expect(filterForm().getByText('Phương thức giao dịch')).toBeInTheDocument()
    await screen.findByText('Chính sách A – Nạp ví VCB')
    expect(
      screen.queryByRole('columnheader', { name: 'Đối tượng áp dụng' })
    ).not.toBeInTheDocument()
  })

  it('dòng mở rộng chỉ đọc các thành phần của luồng đang xem', async () => {
    const user = userEvent.setup()
    renderList(InputCostPolicyList, '/fee-input-cost')
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
})
