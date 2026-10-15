import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { feedback } from '@components/index'
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
const reason = 'Tạo nhầm điểm bán, chưa có giao dịch'

const mockList = (terminal = row) =>
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
        data: { content: [terminal], totalElements: 1, number: 0, size: 20 }
      })
    )
  )

const renderList = (codes: string[], terminal = row) => {
  mockList(terminal)
  const store = createAppStore()
  store.dispatch(savePermissions(codes))
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
}

const openDeleteDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    await screen.findByRole('button', { name: 'Xóa Terminal Quầy 1' })
  )
  await user.type(screen.getByLabelText('Lý do'), reason)
  await user.click(screen.getByRole('button', { name: 'Xóa' }))
}

describe('Xóa Terminal', () => {
  it('gửi DELETE kèm lý do', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    let body: unknown
    server.use(
      http.delete('*/terminals/terminal-1', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ success: true, data: null })
      })
    )
    renderList([PERMISSION.TERMINAL_VIEW, PERMISSION.TERMINAL_DELETE])
    await openDeleteDialog(user)
    await waitFor(() => expect(body).toEqual({ reason }))
    await waitFor(() => expect(success).toHaveBeenCalledWith('Đã xóa Terminal'))
    success.mockRestore()
  })

  it('không có quyền xóa thì không render nút', async () => {
    renderList([PERMISSION.TERMINAL_VIEW])
    await screen.findByText('Quầy 1')
    expect(
      screen.queryByRole('button', { name: 'Xóa Terminal Quầy 1' })
    ).toBeNull()
  })

  it('lỗi 5607 hiện câu tiếng Việt của BE, giữ dialog mở và không báo thành công', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    const detail = 'Terminal đã phát sinh giao dịch nên không xóa được'
    server.use(
      http.delete('*/terminals/terminal-1', () =>
        HttpResponse.json(
          {
            success: false,
            status: '5607',
            message: 'MERCHANT_TERMINAL_HAS_ACTIVITY',
            detail
          },
          { status: 409 }
        )
      )
    )
    renderList([PERMISSION.TERMINAL_VIEW, PERMISSION.TERMINAL_DELETE])
    await openDeleteDialog(user)
    await waitFor(() => expect(error).toHaveBeenCalledWith(detail))
    expect(success).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    error.mockRestore()
    success.mockRestore()
  })
})

describe('Sửa Terminal', () => {
  it('Terminal đang khóa không có nút Sửa vì BE chặn 6008', async () => {
    renderList([PERMISSION.TERMINAL_VIEW, PERMISSION.TERMINAL_UPDATE], {
      ...row,
      status: 'INACTIVE'
    })
    await screen.findByText('Quầy 1')
    expect(
      screen.queryByRole('button', { name: 'Sửa Terminal Quầy 1' })
    ).toBeNull()
  })
})
