import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { FULL_ACCESS, VIEW_ONLY, page, renderPage } from './merchantOrder.setup'

vi.mock('@utils/file-download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@utils/file-download')>()),
  saveBlobAsFile: vi.fn().mockResolvedValue(undefined)
}))

const anomaly = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  orderId: `order-${id}`,
  orderCode: `ORD-${id}`,
  merchantName: 'Công ty Cà phê Mộc',
  subMerchantName: 'Quán số 1',
  bankCode: 'VPB',
  paymentRef: 'REF-1',
  billNumber: null,
  amount: 500000,
  expectedAmount: 400000,
  orderStatus: 'EXPIRED',
  reason: 'AMOUNT_MISMATCH',
  status: 'OPEN',
  createdAt: '2026-10-22T10:15:30',
  ...overrides
})

const ANOMALIES = [
  anomaly('o1'),
  anomaly('r2', {
    status: 'RESOLVED',
    resolvedBy: 'ketoan',
    resolvedAt: '2026-10-23T09:00:00',
    resolutionReason: 'Đã hoàn tiền cho khách'
  })
]

describe('tiền về bất thường: xử lý', () => {
  it('hiện cột mới và nút xử lý chỉ ở khoản chưa xử lý khi có quyền cập nhật đơn', async () => {
    server.use(
      http.get('*/merchant-orders/payment-anomalies', () => page(ANOMALIES))
    )
    renderPage(FULL_ACCESS, '?tab=anomalies')
    const open = (await screen.findByText('ORD-o1')).closest('tr')!
    expect(within(open).getByText('Quán số 1')).toBeInTheDocument()
    expect(within(open).getByLabelText('Đánh dấu đã xử lý')).toBeInTheDocument()
    const done = screen.getByText('ORD-r2').closest('tr')!
    expect(within(done).getByText('Đã hoàn tiền cho khách')).toBeInTheDocument()
    expect(within(done).queryByLabelText('Đánh dấu đã xử lý')).toBeNull()
  })

  it('chỉ có quyền xem thì ẩn nút xử lý', async () => {
    server.use(
      http.get('*/merchant-orders/payment-anomalies', () => page(ANOMALIES))
    )
    renderPage(VIEW_ONLY, '?tab=anomalies')
    await screen.findByText('ORD-o1')
    expect(screen.queryByLabelText('Đánh dấu đã xử lý')).toBeNull()
  })

  it('bắt buộc nhập lý do rồi gửi đúng đường dẫn và body', async () => {
    let body: unknown
    let path = ''
    server.use(
      http.get('*/merchant-orders/payment-anomalies', () => page(ANOMALIES)),
      http.post(
        '*/merchant-orders/payment-anomalies/:id/resolve',
        async ({ request, params }) => {
          path = String(params.id)
          body = await request.json()
          return HttpResponse.json({
            data: { ...ANOMALIES[0], status: 'RESOLVED' }
          })
        }
      )
    )
    renderPage(FULL_ACCESS, '?tab=anomalies')
    await userEvent.click(await screen.findByLabelText('Đánh dấu đã xử lý'))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Đánh dấu đã xử lý' })
    )
    expect(
      await within(dialog).findByText('Vui lòng nhập lý do xử lý')
    ).toBeInTheDocument()
    expect(body).toBeUndefined()
    await userEvent.type(
      within(dialog).getByLabelText(/Lý do xử lý/),
      ' Đã hoàn tiền '
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Đánh dấu đã xử lý' })
    )
    await waitFor(() => expect(body).toEqual({ reason: 'Đã hoàn tiền' }))
    expect(path).toBe('o1')
  })

  it('409 khi đã xử lý thì giữ hộp thoại và hiện thông báo của BE', async () => {
    server.use(
      http.get('*/merchant-orders/payment-anomalies', () => page(ANOMALIES)),
      http.post('*/merchant-orders/payment-anomalies/:id/resolve', () =>
        HttpResponse.json(
          {
            message: 'PAYMENT_ANOMALY_ALREADY_RESOLVED',
            detail: 'Khoản tiền về bất thường này đã được xử lý',
            status: '4329'
          },
          { status: 409 }
        )
      )
    )
    renderPage(FULL_ACCESS, '?tab=anomalies')
    await userEvent.click(await screen.findByLabelText('Đánh dấu đã xử lý'))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText(/Lý do xử lý/), 'x')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Đánh dấu đã xử lý' })
    )
    expect(
      await within(dialog).findByText(
        'Khoản tiền về bất thường này đã được xử lý'
      )
    ).toBeInTheDocument()
  })
})

describe('xuất CSV đơn hàng', () => {
  it('gửi đúng bộ lọc đang áp, không phân trang', async () => {
    let query = ''
    server.use(
      http.get('*/merchant-orders/export', ({ request }) => {
        query = new URL(request.url).search
        return new HttpResponse('a,b', {
          headers: { 'Content-Type': 'text/csv' }
        })
      })
    )
    renderPage(VIEW_ONLY, '?orderCode=ORD&status=SUCCESS')
    await screen.findByText('ORD-a1')
    await userEvent.click(screen.getByRole('button', { name: /Xuất CSV/ }))
    await waitFor(() => expect(query).not.toBe(''))
    const params = new URLSearchParams(query)
    expect(params.get('orderCode')).toBe('ORD')
    expect(params.get('status')).toBe('SUCCESS')
    expect(params.has('page')).toBe(false)
    expect(params.has('size')).toBe(false)
  })

  it('không có quyền xem đơn thì không có nút xuất', async () => {
    renderPage([PERMISSION.ORDER_CREATE])
    await screen.findByText('Danh sách đơn hàng')
    expect(screen.queryByRole('button', { name: /Xuất CSV/ })).toBeNull()
  })
})
