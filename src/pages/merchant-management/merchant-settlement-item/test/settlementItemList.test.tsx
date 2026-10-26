import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import {
  PATH,
  VALID_URL,
  VIEW_ONLY,
  page,
  renderPage
} from './settlementItem.setup'

describe('danh sách mục quyết toán', () => {
  it('hiển thị mục với cột #, trạng thái đợt, lệnh rút và dòng tổng', async () => {
    renderPage()
    const row = (await screen.findByText('ORD-a1')).closest('tr')!
    expect(within(row).getByText('1')).toBeInTheDocument()
    expect(within(row).getByText('Sẵn sàng rút')).toBeInTheDocument()
    expect(within(row).getByText('Đang giữ')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
    const paidRow = screen.getByText('ORD-b2').closest('tr')!
    expect(within(paidRow).getByText('Đã chi')).toBeInTheDocument()
    expect(within(paidRow).getByText(/Lệnh rút 3fa85f64/)).toBeInTheDocument()
    const totals = await screen.findByLabelText('Tổng toàn bộ khoảng lọc')
    expect(within(totals).getByText('1.500.000 ₫')).toBeInTheDocument()
  })

  it('gửi đủ subMerchantId, paidFrom, paidTo và không gửi sort', async () => {
    let query = ''
    server.use(
      http.get('*/merchant-settlement-items', ({ request }) => {
        query = new URL(request.url).search
        return page([])
      })
    )
    renderPage()
    expect(
      await screen.findByText(
        'Không có mục quyết toán nào trong khoảng ngày đã chọn'
      )
    ).toBeInTheDocument()
    const params = new URLSearchParams(query)
    expect(params.get('paidFrom')).toBe('2026-10-01')
    expect(params.get('paidTo')).toBe('2026-10-22')
    expect(params.get('subMerchantId')).toBeTruthy()
    expect(params.get('page')).toBe('1')
    expect(params.has('sort')).toBe(false)
  })

  it('thiếu bộ lọc bắt buộc thì không gọi API và báo lỗi khi tìm kiếm', async () => {
    let calls = 0
    server.use(
      http.get('*/merchant-settlement-items', () => {
        calls += 1
        return page([])
      }),
      http.get('*/merchant-settlement-items/totals', () => {
        calls += 1
        return HttpResponse.json({ data: {} })
      })
    )
    renderPage(VIEW_ONLY, PATH)
    expect(
      await screen.findByText(/Chọn Sub-merchant và khoảng ngày thanh toán/)
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    expect(
      await screen.findByText('Vui lòng chọn Sub-merchant.')
    ).toBeInTheDocument()
    expect(calls).toBe(0)
  })

  it('khoảng ngày ngược trên URL bị chặn, không gọi API', async () => {
    let calls = 0
    server.use(
      http.get('*/merchant-settlement-items', () => {
        calls += 1
        return page([])
      })
    )
    renderPage(
      VIEW_ONLY,
      `${VALID_URL.split('?')[0]}?subMerchantId=abc&paidFrom=2026-10-22&paidTo=2026-10-01`
    )
    expect(
      await screen.findByText(/Chọn Sub-merchant và khoảng ngày thanh toán/)
    ).toBeInTheDocument()
    expect(calls).toBe(0)
  })

  it('map lỗi 404 theo message sang câu tiếng Việt và cho thử lại', async () => {
    server.use(
      http.get('*/merchant-settlement-items', () =>
        HttpResponse.json(
          {
            message: 'RESOURCE_NOT_FOUND',
            detail: "SubMerchant không tìm thấy với id : 'x'",
            status: '1003'
          },
          { status: 404 }
        )
      )
    )
    renderPage()
    expect(
      await screen.findByText(
        'Sub-merchant không tồn tại hoặc nằm ngoài phạm vi được gán cho bạn.'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })

  it('có quyền xem thì mở chi tiết, cảnh báo cờ toàn vẹn và dòng hoàn âm', async () => {
    renderPage()
    await userEvent.click(
      await screen.findByLabelText('Xem mục quyết toán ORD-a1')
    )
    expect(
      await screen.findByText(/có dấu hiệu không toàn vẹn/)
    ).toBeInTheDocument()
    expect(screen.getByText('Hoàn doanh thu')).toBeInTheDocument()
    expect(screen.getByText('-20.000 ₫')).toBeInTheDocument()
    expect(screen.getByText('FEE-01')).toBeInTheDocument()
  })

  it('không có quyền xem thì ẩn nút xem chi tiết', async () => {
    renderPage([PERMISSION.ORDER_VIEW])
    await screen.findByText('ORD-a1')
    await waitFor(() =>
      expect(screen.queryByLabelText(/^Xem mục quyết toán/)).toBeNull()
    )
  })
})
