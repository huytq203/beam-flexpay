import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import FeePolicyList from '../FeePolicyList'

const emptyPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0
}

const renderList = (route: string) =>
  renderWithProviders(
    <MessageProvider>
      <FeePolicyList />
    </MessageProvider>,
    { route }
  )

describe('bộ lọc bổ sung của danh sách chính sách phí', () => {
  it('khôi phục filter từ URL, gửi một search aggregate và đưa về trang 1 khi tìm', async () => {
    const requests: URL[] = []
    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: [] })
      ),
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
      http.get('*/fee/policies/search', ({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json({ data: emptyPage })
      })
    )

    const user = userEvent.setup()
    renderList(
      '/fee?page=3&bankCode=VCB&providerCode=NAPAS&paymentMethod=ATM&validFrom=2026-09-01' +
        '&createdAtTo=2026-08-31'
    )

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(screen.getByLabelText('Phương thức giao dịch')).toBeInTheDocument()
    expect(screen.getByLabelText('Ngân hàng')).toBeInTheDocument()
    expect(
      screen.getByText('Thời gian áp dụng từ', { selector: 'label' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Thời gian áp dụng đến', { selector: 'label' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Ngày tạo từ', { selector: 'label' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Ngày tạo đến', { selector: 'label' })
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Ngày cập nhật', { selector: 'label' })
    ).not.toBeInTheDocument()

    const firstRequest = requests.at(-1)
    expect(firstRequest?.searchParams.get('bankCode')).toBe('VCB')
    expect(firstRequest?.searchParams.get('providerCode')).toBe('NAPAS')
    expect(screen.getByLabelText('Nhà cung cấp')).toBeInTheDocument()
    expect(firstRequest?.searchParams.get('paymentMethod')).toBe('ATM')
    expect(firstRequest?.searchParams.get('validFrom')).toBe('2026-09-01')
    expect(firstRequest?.searchParams.has('validTo')).toBe(false)
    expect(firstRequest?.searchParams.has('createdAtFrom')).toBe(false)
    expect(firstRequest?.searchParams.get('createdAtTo')).toBe('2026-08-31')
    expect(firstRequest?.searchParams.get('includeConfiguration')).toBe('true')
    expect(firstRequest?.searchParams.get('page')).toBe('3')

    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('page')).toBe('1')
    )
    expect(requests.at(-1)?.searchParams.get('paymentMethod')).toBe('ATM')
    expect(requests.at(-1)?.searchParams.get('bankCode')).toBe('VCB')
    expect(requests.at(-1)?.searchParams.get('providerCode')).toBe('NAPAS')
    expect(requests.at(-1)?.searchParams.get('validFrom')).toBe('2026-09-01')
    expect(requests.at(-1)?.searchParams.has('validTo')).toBe(false)
    expect(requests.at(-1)?.searchParams.has('createdAtFrom')).toBe(false)
    expect(requests.at(-1)?.searchParams.get('createdAtTo')).toBe('2026-08-31')
  })

  it('xoá đồng thời toàn bộ filter mới khỏi request', async () => {
    const requests: URL[] = []
    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: [] })
      ),
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
      http.get('*/fee/policies/search', ({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json({ data: emptyPage })
      })
    )

    const user = userEvent.setup()
    renderList(
      '/fee?bankCode=VCB&paymentMethod=ATM&validFrom=2026-09-01&validTo=2026-09-30' +
        '&createdAtFrom=2026-08-01&createdAtTo=2026-08-31'
    )
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))

    await user.click(screen.getByRole('button', { name: 'Xoá lọc' }))

    await waitFor(() => {
      const params = requests.at(-1)?.searchParams
      expect(params?.has('bankCode')).toBe(false)
      expect(params?.has('paymentMethod')).toBe(false)
      expect(params?.has('validFrom')).toBe(false)
      expect(params?.has('validTo')).toBe(false)
      expect(params?.has('createdAtFrom')).toBe(false)
      expect(params?.has('createdAtTo')).toBe(false)
    })
  })
})
