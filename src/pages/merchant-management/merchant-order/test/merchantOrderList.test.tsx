import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import {
  FULL_ACCESS,
  ORDERS,
  VIEW_ONLY,
  page,
  renderPage
} from './merchantOrder.setup'

describe('danh sách đơn hàng merchant', () => {
  it('hiển thị đơn với cột # và trạng thái tiếng Việt', async () => {
    renderPage()
    const row = (await screen.findByText('ORD-a1')).closest('tr')!
    expect(within(row).getByText('1')).toBeInTheDocument()
    expect(within(row).getByText('Chờ thanh toán')).toBeInTheDocument()
    expect(screen.getByText('Cần đối soát ghi có')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
  })

  it('gửi bộ lọc đúng tham số và không gửi chuỗi rỗng', async () => {
    let query = ''
    server.use(
      http.get('*/merchant-orders', ({ request }) => {
        query = new URL(request.url).search
        return page([])
      })
    )
    renderPage()
    expect(await screen.findByText('Không có đơn hàng nào')).toBeInTheDocument()
    expect(query).toBe('?page=1&size=20')
  })

  it('báo lỗi bằng detail của BE và cho thử lại', async () => {
    server.use(
      http.get('*/merchant-orders', () =>
        HttpResponse.json(
          {
            message: 'FORBIDDEN',
            detail: 'Bạn không có quyền xem đơn hàng',
            status: '2002'
          },
          { status: 403 }
        )
      )
    )
    renderPage()
    expect(
      await screen.findByText('Bạn không có quyền xem đơn hàng')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })

  it('chỉ có quyền xem thì ẩn tạo đơn và mọi thao tác ghi', async () => {
    renderPage(VIEW_ONLY)
    await screen.findByText('ORD-a1')
    expect(screen.getByLabelText('Xem đơn ORD-a1')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tạo đơn hàng' })).toBeNull()
    expect(screen.queryByLabelText(/^Hủy đơn/)).toBeNull()
    expect(screen.queryByLabelText(/^Xác nhận thanh toán/)).toBeNull()
    expect(screen.queryByLabelText(/^Ghi có lại/)).toBeNull()
  })

  it('đủ quyền thì hiện thao tác đúng với từng trạng thái đơn', async () => {
    renderPage(FULL_ACCESS)
    await screen.findByText('ORD-a1')
    expect(screen.getByRole('button', { name: 'Tạo đơn hàng' })).toBeVisible()
    expect(screen.getByLabelText('Hủy đơn ORD-a1')).toBeInTheDocument()
    expect(screen.getByLabelText('Làm mới QR đơn ORD-a1')).toBeInTheDocument()
    expect(screen.getByLabelText('Ghi có lại đơn ORD-b2')).toBeInTheDocument()
    expect(screen.queryByLabelText('Hủy đơn ORD-b2')).toBeNull()
    expect(screen.queryByLabelText('Hủy đơn ORD-c3')).toBeNull()
    expect(ORDERS).toHaveLength(3)
  })
})
