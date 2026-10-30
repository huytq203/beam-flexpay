import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { Route, Routes, useLocation } from 'react-router-dom'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import EscrowListPage from '../pages/EscrowListPage'
import { escrowRow, renderWithStore } from './escrow.setup'
import type { EscrowRow } from '../types/merchantEscrow.types'

const VIEW = PERMISSION.MERCHANT_ESCROW_VIEW

const page = (content: EscrowRow[]) => ({
  data: {
    content,
    totalElements: content.length,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: content.length === 0
  }
})

const Where = () => <div data-testid='where'>{useLocation().pathname}</div>
const WhereWithSearch = () => {
  const location = useLocation()
  return (
    <div data-testid='where-full'>{location.pathname + location.search}</div>
  )
}

describe('EscrowListPage', { timeout: 30000 }, () => {
  it('hiện dòng Master với số dư và phần thiếu định dạng tiền', async () => {
    server.use(
      http.get('*/merchant-escrows', () =>
        HttpResponse.json(page([escrowRow()]))
      )
    )
    renderWithStore(<EscrowListPage />, [VIEW])
    expect(await screen.findByText('MC000001')).toBeInTheDocument()
    // formatCurrency của app: dấu chấm ngăn nghìn + ký hiệu ₫.
    expect(screen.getByText(/50\.000\.000\s*₫/)).toBeInTheDocument()
    expect(screen.getByText(/30\.000\.000\s*₫/)).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('Trung bình')).toBeInTheDocument()
  })

  it('trang đầu gửi page=1 và bấm trang 2 gửi page=2 (BE đánh số trang từ 1)', async () => {
    const urls: URL[] = []
    const rows = Array.from({ length: 20 }, (_, i) =>
      escrowRow({ masterId: `m-${i}`, code: `MC9${String(i).padStart(5, '0')}` })
    )
    server.use(
      http.get('*/merchant-escrows', ({ request }) => {
        urls.push(new URL(request.url))
        return HttpResponse.json({
          data: { ...page(rows).data, totalElements: 25, totalPages: 2, last: false }
        })
      })
    )
    const user = userEvent.setup()
    renderWithStore(<EscrowListPage />, [VIEW])
    await screen.findByText('MC900000')
    expect(urls[0].searchParams.get('page')).toBe('1')
    await user.click(screen.getByTitle('2'))
    await waitFor(() =>
      expect(urls.at(-1)?.searchParams.get('page')).toBe('2')
    )
  })

  it('chọn lọc Đã quá hạn gửi dueIn=OVERDUE', async () => {
    const urls: URL[] = []
    server.use(
      http.get('*/merchant-escrows', ({ request }) => {
        urls.push(new URL(request.url))
        return HttpResponse.json(page([escrowRow()]))
      })
    )
    const user = userEvent.setup()
    renderWithStore(<EscrowListPage />, [VIEW])
    await screen.findByText('MC000001')
    await user.click(screen.getByLabelText('Hạn ký quỹ'))
    await user.click(await screen.findByText('Đã quá hạn'))
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() =>
      expect(urls.some((u) => u.searchParams.get('dueIn') === 'OVERDUE')).toBe(
        true
      )
    )
  })

  it('bấm mã Master điều hướng tới /escrow/<masterId>', async () => {
    server.use(
      http.get('*/merchant-escrows', () =>
        HttpResponse.json(page([escrowRow({ masterId: 'abc-123' })]))
      )
    )
    const user = userEvent.setup()
    renderWithStore(
      <>
        <Routes>
          <Route
            path='*'
            element={<EscrowListPage />}
          />
        </Routes>
        <Where />
      </>,
      [VIEW]
    )
    await user.click(await screen.findByText('MC000001'))
    expect(screen.getByTestId('where')).toHaveTextContent(
      '/secure-panel/merchant/escrow/abc-123'
    )
  })

  it('bấm số lệnh chờ duyệt chuyển sang tab Chờ duyệt lệnh nạp đã lọc theo Master đó (SRS 3.6.26 STT 12)', async () => {
    const orderUrls: URL[] = []
    server.use(
      http.get('*/merchant-escrows', () =>
        HttpResponse.json(page([escrowRow({ masterId: 'abc-123' })]))
      ),
      http.get('*/merchants', () =>
        HttpResponse.json({ data: { content: [], totalElements: 0 } })
      ),
      http.get('*/merchant-escrow-orders', ({ request }) => {
        orderUrls.push(new URL(request.url))
        return HttpResponse.json({
          data: { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 }
        })
      })
    )
    const user = userEvent.setup()
    renderWithStore(
      <>
        <Routes>
          <Route
            path='*'
            element={<EscrowListPage />}
          />
        </Routes>
        <WhereWithSearch />
      </>,
      [VIEW]
    )
    await user.click(
      await screen.findByRole('button', {
        name: 'Xem 2 lệnh chờ duyệt của MC000001'
      })
    )
    // Ở lại trang Danh sách ký quỹ, tab hàng chờ được chọn và gọi API đã lọc sẵn Master.
    expect(
      await screen.findByRole('tab', { name: 'Chờ duyệt lệnh nạp', selected: true })
    ).toBeInTheDocument()
    expect(screen.getByTestId('where-full')).not.toHaveTextContent('abc-123')
    await waitFor(() => expect(orderUrls.length).toBeGreaterThan(0))
    expect(orderUrls[0].searchParams.get('masterId')).toBe('abc-123')
    expect(orderUrls[0].searchParams.get('status')).toBe('PENDING_APPROVAL')
  })
})
