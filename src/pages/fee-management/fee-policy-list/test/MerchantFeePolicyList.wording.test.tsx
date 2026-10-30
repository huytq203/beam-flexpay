import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import FeePolicyList from '../FeePolicyList'
import MerchantFeePolicyList from '../MerchantFeePolicyList'

const assignment = (overrides: Record<string, unknown>) => ({
  id: 'a-1',
  feePolicyId: 'p',
  merchantId: null,
  bankCode: null,
  paymentMethod: null,
  cardType: null,
  serviceType: 'MERCHANT_VA_BILL_COLLECTION',
  customerGroup: null,
  subjectType: null,
  subjectId: null,
  status: 'ACTIVE',
  effectiveFromDate: null,
  effectiveToDate: null,
  ...overrides
})

const policy = (overrides: Record<string, unknown>) => ({
  currency: 'VND',
  validFrom: '2026-11-01',
  validTo: null,
  status: 'INIT',
  priority: 4,
  ...overrides
})

const merchantPage = {
  content: [
    policy({
      id: 'pm-all',
      name: 'Thu hộ mọi merchant',
      serviceType: 'MERCHANT_VA_BILL_COLLECTION',
      feeDomain: 'MERCHANT',
      appliedTargets: [{ type: 'ALL', code: null, count: 0 }],
      configuration: { assignments: [], components: [] }
    }),
    policy({
      id: 'pm-one',
      name: 'Thu hộ một merchant',
      serviceType: 'MERCHANT_VA_BILL_COLLECTION',
      feeDomain: 'MERCHANT',
      appliedTargets: [
        {
          type: 'ACCOUNT',
          code: null,
          count: 1,
          subjectCount: 1,
          subjects: [
            {
              subjectType: 'MERCHANT',
              subjectId: 'm-1',
              fullName: 'Cửa hàng A',
              displayName: 'merchant-a'
            }
          ]
        }
      ],
      configuration: {
        assignments: [
          assignment({
            id: 'a-one',
            merchantId: 'm-1',
            subjectType: 'MERCHANT',
            subjectId: 'm-1'
          })
        ],
        components: []
      }
    }),
    policy({
      id: 'pm-many',
      name: 'Chi hộ nhiều merchant',
      serviceType: 'MERCHANT_DISBURSEMENT',
      feeDomain: 'MERCHANT',
      appliedTargets: [{ type: 'ACCOUNT', code: null, count: 2 }],
      configuration: { assignments: [], components: [] }
    }),
    policy({
      id: 'pm-group',
      name: 'Chi hộ nhóm merchant',
      serviceType: 'MERCHANT_DISBURSEMENT',
      feeDomain: 'MERCHANT',
      appliedTargets: [{ type: 'CUSTOMER_GROUP', code: 'G1', count: 3 }],
      configuration: {
        assignments: [
          assignment({
            id: 'a-group',
            serviceType: 'MERCHANT_DISBURSEMENT',
            customerGroup: 'G1'
          })
        ],
        components: []
      }
    }),
    policy({
      id: 'pm-legacy',
      name: 'Thu hộ merchant bản gán cũ',
      serviceType: 'MERCHANT_VA_BILL_COLLECTION',
      feeDomain: 'MERCHANT',
      appliedTargets: [{ type: 'ALL', code: null, count: 0 }],
      configuration: {
        assignments: [assignment({ id: 'a-legacy', merchantId: 'm-old' })],
        components: []
      }
    })
  ],
  totalElements: 5,
  totalPages: 1,
  size: 10,
  number: 0
}

const walletPage = {
  content: [
    policy({
      id: 'pw-user',
      name: 'Nạp ví một cá nhân',
      serviceType: 'EWALLET_DEPOSIT',
      feeDomain: 'EWALLET',
      appliedTargets: [
        {
          type: 'ACCOUNT',
          code: null,
          count: 1,
          subjectCount: 1,
          subjects: [
            {
              subjectType: 'USER',
              subjectId: 'u-1',
              fullName: 'Nguyễn Văn A',
              displayName: '0900000001'
            }
          ]
        }
      ],
      configuration: {
        assignments: [
          assignment({
            id: 'w-user',
            serviceType: 'EWALLET_DEPOSIT',
            subjectType: 'USER',
            subjectId: 'u-1'
          })
        ],
        components: []
      }
    }),
    policy({
      id: 'pw-group',
      name: 'Nạp ví nhóm khách',
      serviceType: 'EWALLET_DEPOSIT',
      feeDomain: 'EWALLET',
      appliedTargets: [{ type: 'CUSTOMER_GROUP', code: 'VIP', count: 2 }],
      configuration: {
        assignments: [
          assignment({
            id: 'w-group',
            serviceType: 'EWALLET_DEPOSIT',
            customerGroup: 'VIP'
          })
        ],
        components: []
      }
    }),
    policy({
      id: 'pw-all',
      name: 'Nạp ví mọi khách',
      serviceType: 'EWALLET_DEPOSIT',
      feeDomain: 'EWALLET',
      appliedTargets: [{ type: 'ALL', code: null, count: 0 }],
      configuration: { assignments: [], components: [] }
    })
  ],
  totalElements: 3,
  totalPages: 1,
  size: 10,
  number: 0
}

const requests: URL[] = []

const useHandlers = (content: unknown) =>
  server.use(
    http.get('*/fee/customer-segments', () => HttpResponse.json({ data: [] })),
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
      return HttpResponse.json({ data: content })
    })
  )

const renderPage = (ui: ReactElement, route: string) => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.FEE_FULL]))
  return renderWithProviders(<MessageProvider>{ui}</MessageProvider>, {
    route,
    store
  })
}

const expandAll = async (firstName: string) => {
  await screen.findByText(firstName)
  await userEvent.click(screen.getByRole('button', { name: 'Mở tất cả' }))
}

const detailOf = (name: string) =>
  within(screen.getByRole('region', { name: `Chi tiết ${name}` }))

const appliedTargetOptions = async () => {
  await userEvent.click(await screen.findByLabelText('Đối tượng áp dụng'))
  return (await screen.findAllByRole('option')).map((option) =>
    option.getAttribute('aria-label')
  )
}

beforeEach(() => {
  requests.length = 0
  sessionStorage.clear()
})

describe('danh sách ĐVCNTT: nhãn đối tượng áp dụng theo merchant', () => {
  beforeEach(() => useHandlers(merchantPage))

  it('cột đối tượng nói merchant: tất cả, một merchant, nhiều merchant, nhóm', async () => {
    renderPage(<MerchantFeePolicyList />, '/merchant/fee-config')
    await screen.findByText('Thu hộ mọi merchant')

    expect(screen.getAllByText('Tất cả merchant').length).toBeGreaterThan(0)
    expect(screen.getByText('Cửa hàng A')).toBeInTheDocument()
    expect(screen.getByText('2 merchant cụ thể')).toBeInTheDocument()
    expect(screen.queryByText('Tất cả khách hàng')).not.toBeInTheDocument()
    expect(screen.queryByText(/ví riêng/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Thành viên ví/)).not.toBeInTheDocument()
  })

  it('dòng mở rộng: cặp chủ thể MERCHANT là "Merchant cụ thể" kèm tên merchant', async () => {
    renderPage(<MerchantFeePolicyList />, '/merchant/fee-config')
    await expandAll('Thu hộ mọi merchant')

    const detail = detailOf('Thu hộ một merchant')
    expect(detail.getByText('Merchant cụ thể')).toBeInTheDocument()
    expect(detail.getByText('Cửa hàng A')).toBeInTheDocument()
    expect(detail.queryByText('Cá nhân')).not.toBeInTheDocument()
  })

  it('dòng mở rộng: nhóm là "Nhóm merchant", bản gán cũ chỉ có merchantId là "Merchant cụ thể"', async () => {
    renderPage(<MerchantFeePolicyList />, '/merchant/fee-config')
    await expandAll('Thu hộ mọi merchant')

    const group = detailOf('Chi hộ nhóm merchant')
    expect(group.getByText('Nhóm merchant')).toBeInTheDocument()
    expect(group.queryByText('Nhóm khách hàng')).not.toBeInTheDocument()

    const legacy = detailOf('Thu hộ merchant bản gán cũ')
    expect(legacy.getByText('Merchant cụ thể')).toBeInTheDocument()
    expect(legacy.getByText('m-old')).toBeInTheDocument()
  })

  it('bộ lọc Đối tượng áp dụng dùng nhãn merchant, giữ nguyên giá trị gửi đi', async () => {
    renderPage(<MerchantFeePolicyList />, '/merchant/fee-config')
    await screen.findByText('Thu hộ mọi merchant')

    // List ảo của antd trong jsdom chỉ dựng hai dòng đầu; dòng thứ ba kiểm qua giá trị đang chọn bên dưới.
    expect(await appliedTargetOptions()).toEqual([
      'Tất cả',
      'Theo nhóm merchant'
    ])

    await userEvent.click(
      await screen.findByText('Theo nhóm merchant', {
        selector: '.ant-select-item-option-content'
      })
    )
    await userEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('appliedTarget')).toBe(
        'CUSTOMER_GROUP'
      )
    )
  })

  it('giá trị ACCOUNT trên URL hiện là "Merchant cụ thể"', async () => {
    renderPage(
      <MerchantFeePolicyList />,
      '/merchant/fee-config?appliedTarget=ACCOUNT'
    )
    await screen.findByText('Thu hộ mọi merchant')

    expect(
      screen.getByLabelText('Đối tượng áp dụng').closest('.ant-select')
    ).toHaveTextContent('Merchant cụ thể')
    expect(requests.at(-1)?.searchParams.get('appliedTarget')).toBe('ACCOUNT')
  })
})

describe('danh sách ĐVCNTT: ẩn bộ lọc Bên chịu phí', () => {
  beforeEach(() => useHandlers(merchantPage))

  it('không có ô Bên chịu phí và không gửi feeBearer dù URL có', async () => {
    renderPage(<MerchantFeePolicyList />, '/merchant/fee-config?feeBearer=BOTH')
    await screen.findByText('Thu hộ mọi merchant')

    expect(screen.queryByLabelText('Bên chịu phí')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Người chịu phí')).toBeInTheDocument()
    expect(requests.length).toBeGreaterThan(0)
    for (const request of requests) {
      expect(request.searchParams.get('feeBearer')).toBeNull()
    }
  })
})

describe('danh sách phí chung giữ nhãn ví', () => {
  beforeEach(() => useHandlers(walletPage))

  it('cột đối tượng giữ "Tất cả khách hàng" và "ví riêng"', async () => {
    renderPage(<FeePolicyList />, '/fee')
    await screen.findByText('Nạp ví mọi khách')

    expect(screen.getByText('Tất cả khách hàng')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.queryByText('Tất cả merchant')).not.toBeInTheDocument()
  })

  it('dòng mở rộng giữ "Cá nhân" và "Nhóm khách hàng"', async () => {
    renderPage(<FeePolicyList />, '/fee')
    await expandAll('Nạp ví một cá nhân')

    expect(
      detailOf('Nạp ví một cá nhân').getByText('Cá nhân')
    ).toBeInTheDocument()
    expect(
      detailOf('Nạp ví nhóm khách').getByText('Nhóm khách hàng')
    ).toBeInTheDocument()
  })

  it('bộ lọc giữ nhãn ví và còn ô Bên chịu phí', async () => {
    renderPage(<FeePolicyList />, '/fee?appliedTarget=ACCOUNT')
    await screen.findByText('Nạp ví mọi khách')

    expect(screen.getByLabelText('Bên chịu phí')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Đối tượng áp dụng').closest('.ant-select')
    ).toHaveTextContent('Riêng ví')
    expect(await appliedTargetOptions()).toContain('Theo nhóm khách hàng')
  })
})
