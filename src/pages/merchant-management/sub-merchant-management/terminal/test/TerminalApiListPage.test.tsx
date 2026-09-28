import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createAppStore } from '@/app/store'
import { PERMISSION } from '@/app/permissions'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import TerminalListPage from '../pages/TerminalListPage'

const row = {
  id: 'terminal-1',
  tid: 'TML000001',
  name: 'Quầy 1',
  terminalType: 'POS',
  status: 'ACTIVE',
  subMerchantId: 'sub-1',
  subMerchantName: 'Chi nhánh 1',
  merchantId: 'merchant-1'
}
function CurrentPath() {
  return <span data-testid='current-path'>{useLocation().pathname}</span>
}

describe('Terminal API list', () => {
  it('hiển thị icon action nhỏ và xem chi tiết trong modal, giữ nguyên route', async () => {
    const user = userEvent.setup()
    let detailRequests = 0
    server.use(
      http.get('*/merchants', () =>
        HttpResponse.json({
          data: { content: [], totalElements: 0, number: 0, size: 100 }
        })
      ),
      http.get('*/sub-merchants', () =>
        HttpResponse.json({
          data: { content: [], totalElements: 0, number: 0, size: 100 }
        })
      ),
      http.get('*/terminals', () =>
        HttpResponse.json({
          data: { content: [row], totalElements: 1, number: 0, size: 20 }
        })
      ),
      http.get('*/terminals/:id', () => {
        detailRequests += 1
        return HttpResponse.json({
          data: { ...row, address: '12 Lê Lợi', contactPerson: 'Nguyễn Văn A' }
        })
      })
    )
    const store = createAppStore()
    store.dispatch(
      savePermissions([PERMISSION.TERMINAL_VIEW, PERMISSION.TERMINAL_UPDATE])
    )
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/terminal']}>
          <CurrentPath />
          <Routes>
            <Route
              path='/terminal'
              element={<TerminalListPage />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
    const view = await screen.findByRole('button', {
      name: 'Xem Terminal Quầy 1'
    })
    expect(view).toHaveClass('ant-btn-sm')
    expect(view).not.toHaveTextContent('Xem')
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
    await user.click(view)
    const dialog = await screen.findByRole('dialog', {
      name: 'Chi tiết Terminal'
    })
    expect(dialog).toHaveTextContent('12 Lê Lợi')
    expect(dialog).toHaveTextContent('Nguyễn Văn A')
    expect(screen.getByTestId('current-path')).toHaveTextContent('/terminal')
    await waitFor(() => expect(detailRequests).toBe(1))
  })

  it('lọc Sub-merchant qua dialog phân trang, tìm cả Sub đã khóa và gửi id lên danh sách Terminal', async () => {
    const user = userEvent.setup()
    const subRequests: URL[] = []
    const terminalRequests: URL[] = []
    const lockedSub = {
      id: 'sub-150',
      code: 'SUB-150',
      name: 'Chi nhánh 150',
      status: 'INACTIVE',
      merchantId: 'merchant-1',
      merchantName: 'Merchant A'
    }
    server.use(
      http.get('*/sub-merchants', ({ request }) => {
        subRequests.push(new URL(request.url))
        return HttpResponse.json({
          data: {
            content: [lockedSub],
            totalElements: 150,
            number: 0,
            size: 10
          }
        })
      }),
      http.get('*/terminals', ({ request }) => {
        terminalRequests.push(new URL(request.url))
        return HttpResponse.json({
          data: { content: [row], totalElements: 1, number: 0, size: 20 }
        })
      })
    )
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.TERMINAL_VIEW]))
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/terminal']}>
          <Routes>
            <Route
              path='/terminal'
              element={<TerminalListPage />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
    expect(subRequests).toHaveLength(0)
    await user.click(screen.getByLabelText('Sub-merchant'))
    await user.click(
      await screen.findByLabelText('Chọn Sub-merchant Chi nhánh 150')
    )
    expect(subRequests[0]?.searchParams.get('status')).toBeNull()
    expect(subRequests[0]?.searchParams.get('size')).toBe('10')
    await waitFor(() =>
      expect(screen.getByLabelText('Sub-merchant')).toHaveValue(
        'SUB-150 — Chi nhánh 150'
      )
    )
    await waitFor(() =>
      expect(terminalRequests.at(-1)?.searchParams.get('subMerchantId')).toBe(
        'sub-150'
      )
    )
    await user.click(screen.getByLabelText('Bỏ chọn Sub-merchant'))
    await waitFor(() =>
      expect(
        terminalRequests.at(-1)?.searchParams.get('subMerchantId')
      ).toBeNull()
    )
  })
})
