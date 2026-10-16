import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import FeePolicyList from '../FeePolicyList'

const policies = [
  {
    id: 'policy-one',
    name: 'Chính sách one',
    serviceType: 'EWALLET_DEPOSIT',
    feeDomain: 'EWALLET',
    currency: 'VND',
    validFrom: '2026-09-01',
    validTo: null,
    status: 'INACTIVE',
    priority: 1,
    appliedTargets: [
      {
        type: 'ACCOUNT',
        code: null,
        count: 1,
        subjectCount: 1,
        subjects: [
          {
            subjectType: 'USER',
            subjectId: 'user-one',
            displayName: '0353585904',
            fullName: 'NGUYEN THI YEN NHI'
          }
        ]
      }
    ],
    configuration: {
      assignments: [
        {
          id: 'assignment-user',
          feePolicyId: 'policy-one',
          merchantId: null,
          bankCode: 'VPB',
          paymentMethod: 'ATM',
          cardType: null,
          serviceType: 'EWALLET_DEPOSIT',
          customerGroup: null,
          subjectType: 'USER',
          subjectId: 'user-one',
          status: 'ACTIVE',
          effectiveFromDate: null,
          effectiveToDate: null
        },
        {
          id: 'assignment-segment',
          feePolicyId: 'policy-one',
          merchantId: null,
          bankCode: null,
          paymentMethod: null,
          cardType: null,
          serviceType: 'EWALLET_DEPOSIT',
          customerGroup: 'VIP',
          subjectType: null,
          subjectId: null,
          status: 'ACTIVE',
          effectiveFromDate: null,
          effectiveToDate: null
        }
      ],
      components: [
        {
          id: 'component-transaction',
          feePolicyId: 'policy-one',
          componentType: 'TRANSACTION_FEE',
          baseOn: 'AMOUNT',
          baseComponentType: null,
          calculationMethod: 'FLAT_TIER',
          fixedAmount: 0,
          percentage: 0,
          roundMode: 'HALF_UP',
          minFee: 0,
          maxFee: 0,
          payerType: 'USER',
          payerObjectType: null,
          payerObjectId: null,
          beneficiaryType: 'SYSTEM',
          beneficiaryObjectType: null,
          beneficiaryObjectId: null,
          tiers: [
            {
              id: 'tier-transaction',
              feeComponentId: 'component-transaction',
              minValue: 0,
              maxValue: 100000,
              roundMode: 'HALF_UP',
              minFee: 1000,
              maxFee: 5000,
              fixedAmount: 2000,
              percentage: 1
            }
          ]
        },
        {
          id: 'component-vat',
          feePolicyId: 'policy-one',
          componentType: 'VAT',
          baseOn: 'FEE_COMPONENT',
          baseComponentType: 'TRANSACTION_FEE',
          calculationMethod: 'DIRECT',
          fixedAmount: 0,
          percentage: 10,
          roundMode: 'HALF_UP',
          minFee: 0,
          maxFee: 0,
          payerType: 'UNKNOWN_PAYER',
          payerObjectType: null,
          payerObjectId: null,
          beneficiaryType: 'MERCHANT',
          beneficiaryObjectType: null,
          beneficiaryObjectId: null,
          tiers: []
        }
      ]
    }
  },
  {
    id: 'policy-two',
    name: 'Chính sách two',
    serviceType: 'EWALLET_DEPOSIT',
    feeDomain: 'EWALLET',
    currency: 'VND',
    validFrom: '2026-09-01',
    validTo: null,
    status: 'INACTIVE',
    priority: 2,
    appliedTargets: [{ type: 'ALL', code: null, count: 0 }],
    configuration: { assignments: [], components: [] }
  }
]

const page = {
  content: policies,
  totalElements: policies.length,
  totalPages: 1,
  size: 10,
  number: 0
}

const QueryStateNavigation = ({ search }: { search: string }) => {
  const navigate = useNavigate()

  return (
    <button
      type='button'
      onClick={() => navigate(`/fee?${search}`)}
    >
      Đổi truy vấn
    </button>
  )
}

const renderList = (nextSearch?: string) =>
  renderWithProviders(
    <MessageProvider>
      <FeePolicyList />
      {nextSearch && <QueryStateNavigation search={nextSearch} />}
    </MessageProvider>,
    { route: '/fee' }
  )

describe('chi tiết mở rộng của danh sách chính sách phí', () => {
  beforeEach(() => {
    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: [] })
      ),
      http.get('*/fee/policies/search', () => HttpResponse.json({ data: page }))
    )
  })

  it('giữ nhiều dòng mở độc lập', async () => {
    const user = userEvent.setup()
    renderList()
    const expandButtons = await screen.findAllByRole('button', {
      name: 'Expand row'
    })
    await user.click(expandButtons[0])
    await user.click(expandButtons[1])
    expect(screen.getAllByRole('region', { name: /Chi tiết/ })).toHaveLength(2)
  })

  it('mở và thu gọn toàn bộ dòng của trang hiện tại', async () => {
    const user = userEvent.setup()
    renderList()
    await screen.findByText('Chính sách one')
    const expandAllButton = screen.getByRole('button', { name: 'Mở tất cả' })
    expect(expandAllButton.closest('th')).not.toBeNull()
    expect(expandAllButton).toHaveClass(
      'ant-table-row-expand-icon',
      'ant-table-row-expand-icon-collapsed',
      'float-none!'
    )
    expect(expandAllButton).not.toHaveClass('ant-btn')
    expect(expandAllButton.parentElement).toHaveClass(
      'flex',
      'w-full',
      'items-center',
      'justify-center'
    )
    await user.click(expandAllButton)
    expect(screen.getAllByRole('region', { name: /Chi tiết/ })).toHaveLength(2)
    const collapseAllButton = screen.getByRole('button', {
      name: 'Thu gọn tất cả'
    })
    expect(collapseAllButton.closest('th')).not.toBeNull()
    expect(collapseAllButton).toHaveClass(
      'ant-table-row-expand-icon',
      'ant-table-row-expand-icon-expanded'
    )
    await user.click(collapseAllButton)
    expect(screen.queryAllByRole('region', { name: /Chi tiết/ })).toHaveLength(
      0
    )
  })

  it.each([
    ['bộ lọc', 'status=ACTIVE'],
    ['trang', 'page=2'],
    ['số dòng mỗi trang', 'size=20'],
    ['luồng phí', 'feeScope=INPUT_COST']
  ])('thu gọn các dòng khi đổi %s hiệu lực', async (_label, nextSearch) => {
    const user = userEvent.setup()
    renderList(nextSearch)
    await user.click(
      (await screen.findAllByRole('button', { name: 'Expand row' }))[0]
    )
    expect(
      screen.getByRole('region', { name: 'Chi tiết Chính sách one' })
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Đổi truy vấn' }))
    await waitFor(() =>
      expect(
        screen.queryAllByRole('region', { name: /Chi tiết/ })
      ).toHaveLength(0)
    )
  })

  it('hiện toàn bộ bản gán và thành phần từ dữ liệu dòng mà không gọi API chi tiết', async () => {
    const detailRequests: string[] = []
    const user = userEvent.setup()

    server.use(
      http.get(
        '*/fee/policy-assignments/by-policy/:policyId',
        ({ request }) => {
          detailRequests.push(request.url)
          return HttpResponse.json({ data: [] })
        }
      ),
      http.get('*/fee/policy-components/by-policy/:policyId', ({ request }) => {
        detailRequests.push(request.url)
        return HttpResponse.json({ data: [] })
      }),
      http.get(
        '*/fee/component-tiers/by-component/:componentId',
        ({ request }) => {
          detailRequests.push(request.url)
          return HttpResponse.json({ data: [] })
        }
      )
    )

    renderList()
    await screen.findByText('Chính sách one')
    await user.click(
      (await screen.findAllByRole('button', { name: 'Expand row' }))[0]
    )

    const detail = await screen.findByRole('region', {
      name: 'Chi tiết Chính sách one'
    })
    expect(within(detail).getAllByText('Đối tượng áp dụng')).toHaveLength(2)
    expect(within(detail).getByText('NGUYEN THI YEN NHI')).toBeInTheDocument()
    expect(within(detail).getByText('VIP')).toBeInTheDocument()
    expect(within(detail).getByText('Người dùng')).toBeInTheDocument()
    expect(within(detail).getByText('Hệ thống')).toBeInTheDocument()
    expect(within(detail).getByText('UNKNOWN_PAYER')).toBeInTheDocument()
    expect(
      within(detail).getByText('1. Phí giao dịch cơ bản')
    ).toBeInTheDocument()
    expect(within(detail).getByText('2. VAT')).toBeInTheDocument()
    expect(
      detailRequests.some((url) =>
        [
          'policy-assignments/by-policy',
          'policy-components/by-policy',
          'component-tiers/by-component'
        ].some((path) => url.includes(path))
      )
    ).toBe(false)
  })

  it('hiện trạng thái rỗng từ cấu hình của dòng', async () => {
    const user = userEvent.setup()

    renderList()
    await screen.findByText('Chính sách two')
    await user.click(
      (await screen.findAllByRole('button', { name: 'Expand row' }))[1]
    )

    const detail = await screen.findByRole('region', {
      name: 'Chi tiết Chính sách two'
    })
    expect(
      within(detail).getByText('Chính sách chưa được gán cho đối tượng nào.')
    ).toBeInTheDocument()
    expect(
      within(detail).getByText('Chính sách không có phí đầu ra.')
    ).toBeInTheDocument()
  })
})
