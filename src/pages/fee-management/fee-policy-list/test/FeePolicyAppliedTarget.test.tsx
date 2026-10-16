import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import FeePolicyList from '../FeePolicyList'

const segments = [
  {
    code: 'VIP',
    name: 'Khách hàng VIP',
    description: null,
    status: 'ACTIVE'
  }
]

const policies = [
  {
    id: 'policy-all',
    name: 'Chính sách mọi đối tượng',
    serviceType: 'EWALLET_DEPOSIT',
    feeDomain: 'EWALLET',
    currency: 'VND',
    validFrom: '2026-09-01',
    validTo: null,
    status: 'INACTIVE',
    priority: 1,
    appliedTargets: [{ type: 'ALL', code: null, count: 0 }]
  },
  {
    id: 'policy-segment',
    name: 'Chính sách phân khúc',
    serviceType: 'EWALLET_DEPOSIT',
    feeDomain: 'EWALLET',
    currency: 'VND',
    validFrom: '2026-09-01',
    validTo: null,
    status: 'INACTIVE',
    priority: 2,
    appliedTargets: [
      {
        type: 'CUSTOMER_GROUP',
        code: 'VIP',
        count: 5,
        subjectCount: 7,
        subjects: [
          {
            subjectType: 'USER',
            subjectId: 'u-1',
            fullName: 'Nguyễn Văn A',
            displayName: '0900000001'
          },
          {
            subjectType: 'USER',
            subjectId: 'u-2',
            fullName: null,
            displayName: '0900000002'
          },
          {
            subjectType: 'USER',
            subjectId: 'u-3',
            fullName: null,
            displayName: '0900000003'
          },
          {
            subjectType: 'USER',
            subjectId: 'u-4',
            fullName: null,
            displayName: '0900000004'
          },
          {
            subjectType: 'USER',
            subjectId: 'u-5',
            fullName: null,
            displayName: '0900000005'
          }
        ]
      }
    ]
  },
  {
    id: 'policy-account',
    name: 'Chính sách ví riêng',
    serviceType: 'EWALLET_DEPOSIT',
    feeDomain: 'EWALLET',
    currency: 'VND',
    validFrom: '2026-09-01',
    validTo: null,
    status: 'INACTIVE',
    priority: 3,
    appliedTargets: [{ type: 'ACCOUNT', code: null, count: 2 }]
  },
  {
    id: 'policy-unassigned',
    name: 'Chính sách chưa gán',
    serviceType: 'EWALLET_DEPOSIT',
    feeDomain: 'EWALLET',
    currency: 'VND',
    validFrom: '2026-09-01',
    validTo: null,
    status: 'INACTIVE',
    priority: 4
  },
  {
    id: 'policy-single-account',
    name: 'Chính sách một ví riêng',
    serviceType: 'EWALLET_DEPOSIT',
    feeDomain: 'EWALLET',
    currency: 'VND',
    validFrom: '2026-09-01',
    validTo: null,
    status: 'INACTIVE',
    priority: 4,
    appliedTargets: [
      {
        type: 'ACCOUNT',
        code: null,
        count: 1,
        subjectCount: 1,
        subjects: [
          {
            subjectType: 'USER',
            subjectId: 'u-single',
            fullName: 'Nguyễn Văn A',
            displayName: '0912345678'
          }
        ]
      }
    ]
  }
]

const page = {
  content: policies,
  totalElements: policies.length,
  totalPages: 1,
  size: 10,
  number: 0
}

const renderList = (route = '/fee') =>
  renderWithProviders(
    <MessageProvider>
      <FeePolicyList />
    </MessageProvider>,
    { route }
  )

const useListHandlers = (requests: URL[]) => {
  server.use(
    http.get('*/fee/customer-segments', () =>
      HttpResponse.json({ data: segments })
    ),
    http.get('*/fee/policies/search', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({ data: page })
    })
  )
}

const selectAppliedTarget = async (
  user: ReturnType<typeof userEvent.setup>,
  label: string
) => {
  await screen.findByText('Khách hàng VIP')
  await user.click(screen.getByLabelText('Đối tượng áp dụng'))
  await user.click(
    await screen.findByText(label, {
      selector: '.ant-select-item-option-content'
    })
  )
  await user.click(screen.getByRole('button', { name: 'Tìm' }))
}

describe('đối tượng áp dụng của danh sách chính sách phí', () => {
  it('hiển thị mọi loại đối tượng và trạng thái chưa gán', async () => {
    useListHandlers([])

    renderList()

    expect(
      await screen.findByText('Chính sách mọi đối tượng')
    ).toBeInTheDocument()
    expect(screen.getByText('Khách hàng VIP')).toBeInTheDocument()
    expect(screen.getByText('2 ví riêng')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getByText(/0912345678/)).toBeInTheDocument()
    expect(screen.getByText('Chưa gán')).toBeInTheDocument()
    expect(screen.getAllByText('Tất cả').length).toBeGreaterThan(0)
    expect(
      screen.queryByRole('tab', { name: 'Phí ĐVCNTT' })
    ).not.toBeInTheDocument()
  })

  it('hiện danh sách chủ thể và số chủ thể còn lại khi hover phân khúc', async () => {
    useListHandlers([])
    const user = userEvent.setup()

    renderList()

    await user.hover(await screen.findByText('Khách hàng VIP'))

    expect(await screen.findByText('0900000001')).toBeInTheDocument()
    expect(screen.getByText('Còn 2 chủ thể khác')).toBeInTheDocument()
  })

  it.each([
    ['Theo nhóm khách hàng', 'CUSTOMER_GROUP'],
    ['Riêng ví', 'ACCOUNT'],
    ['Tất cả', 'ALL']
  ])('gửi đúng appliedTarget khi chọn %s', async (label, value) => {
    const requests: URL[] = []
    useListHandlers(requests)
    const user = userEvent.setup()
    renderList()

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    await selectAppliedTarget(user, label)

    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('appliedTarget')).toBe(value)
    )
  })

  it('không gửi appliedTarget sau khi xoá lựa chọn', async () => {
    const requests: URL[] = []
    useListHandlers(requests)
    const user = userEvent.setup()
    renderList('/fee?appliedTarget=CUSTOMER_GROUP')

    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('appliedTarget')).toBe(
        'CUSTOMER_GROUP'
      )
    )

    const select = screen.getByLabelText('Đối tượng áp dụng')
    const selectRoot = select.closest('.ant-select')
    await user.hover(selectRoot as Element)
    const clearButton = selectRoot?.querySelector('.ant-select-clear')
    expect(clearButton).not.toBeNull()
    await user.click(clearButton as Element)
    await user.click(screen.getByRole('button', { name: 'Tìm' }))

    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.has('appliedTarget')).toBe(false)
    )
  })

  it('không còn lọc theo SĐT người dùng, kể cả khi URL cũ còn subjectKeyword', async () => {
    const requests: URL[] = []
    useListHandlers(requests)
    renderList('/fee?subjectKeyword=0912')

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(screen.queryByText('SĐT người dùng')).toBeNull()
    expect(requests.at(-1)?.searchParams.has('subjectKeyword')).toBe(false)
  })
})
