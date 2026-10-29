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
})
