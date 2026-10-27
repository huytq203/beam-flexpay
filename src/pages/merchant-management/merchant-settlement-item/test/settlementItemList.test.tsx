import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import {
  ITEMS,
  PATH,
  TOTALS,
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

  it('thiếu khoảng ngày thì không gọi API và báo lỗi khi tìm kiếm', async () => {
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
      await screen.findByText(/Chọn khoảng ngày thanh toán/)
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    expect(
      await screen.findByText(/Vui lòng chọn đủ khoảng ngày thanh toán/)
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
      await screen.findByText(/Chọn khoảng ngày thanh toán/)
    ).toBeInTheDocument()
    expect(calls).toBe(0)
  })

  it('khoảng ngày quá 92 ngày trên URL bị chặn, không gọi API', async () => {
    let calls = 0
    server.use(
      http.get('*/merchant-settlement-items', () => {
        calls += 1
        return page([])
      })
    )
    renderPage(VIEW_ONLY, `${PATH}?paidFrom=2026-01-01&paidTo=2026-04-03`)
    expect(
      await screen.findByText(/Chọn khoảng ngày thanh toán/)
    ).toBeInTheDocument()
    expect(calls).toBe(0)
  })

  it('chỉ cần khoảng ngày: gọi API không kèm Sub, gửi merchantId và sortBy từ URL', async () => {
    const queries: string[] = []
    server.use(
      http.get('*/merchant-settlement-items', ({ request }) => {
        queries.push(new URL(request.url).search)
        return page(ITEMS)
      })
    )
    renderPage(
      VIEW_ONLY,
      `${PATH}?merchantId=master-1&paidFrom=2026-10-01&paidTo=2026-10-22&sortBy=fee&sortDirection=ASC`
    )
    expect(await screen.findByText('ORD-a1')).toBeInTheDocument()
    const params = new URLSearchParams(queries[0])
    expect(params.get('merchantId')).toBe('master-1')
    expect(params.has('subMerchantId')).toBe(false)
    expect(params.get('sortBy')).toBe('fee')
    expect(params.get('sortDirection')).toBe('ASC')
    expect(params.get('page')).toBe('1')
  })

  it('bấm tiêu đề cột Phí thì gọi lại list với sortBy=fee và totals không nhận sort', async () => {
    const lists: string[] = []
    const totals: string[] = []
    server.use(
      http.get('*/merchant-settlement-items', ({ request }) => {
        lists.push(new URL(request.url).search)
        return page(ITEMS)
      }),
      http.get('*/merchant-settlement-items/totals', ({ request }) => {
        totals.push(new URL(request.url).search)
        return HttpResponse.json({ data: TOTALS })
      })
    )
    renderPage()
    await screen.findByText('ORD-a1')
    await userEvent.click(screen.getByRole('columnheader', { name: 'Phí' }))
    await waitFor(() =>
      expect(lists.some((q) => q.includes('sortBy=fee'))).toBe(true)
    )
    expect(totals.every((q) => !q.includes('sortBy'))).toBe(true)
  })

  it('hiển thị bảng theo Sub khi totals có bySub', async () => {
    server.use(
      http.get('*/merchant-settlement-items/totals', () =>
        HttpResponse.json({
          data: {
            ...TOTALS,
            bySub: [
              {
                subMerchantId: 'sub-9',
                subMerchantCode: 'SUB009',
                subMerchantName: 'Cửa hàng Chín',
                count: 2,
                grossAmount: 1500000,
                feeAmount: 16500,
                recognisedAmount: 1483500,
                firstTrancheAmount: 1383500,
                heldAmount: 100000
              }
            ]
          }
        })
      )
    )
    renderPage()
    const section = await screen.findByLabelText('Tổng theo Sub-merchant')
    expect(within(section).getByText('Cửa hàng Chín')).toBeInTheDocument()
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
