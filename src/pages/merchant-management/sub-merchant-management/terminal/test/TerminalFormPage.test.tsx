import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { PERMISSION } from '@/app/permissions'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import TerminalFormPage from '../pages/TerminalFormPage'

const terminal = {
  id: 'terminal-1',
  tid: 'T-001',
  name: 'Quầy 1',
  terminalType: 'POS',
  address: '12 Lê Lợi',
  contactPerson: 'Nguyễn Văn A',
  note: 'Cổng chính',
  status: 'ACTIVE',
  subMerchantId: 'sub-1',
  subMerchantName: 'Chi nhánh 1',
  merchantId: 'merchant-1',
  contactPhone: { value: '0912345678', inherited: true },
  parentEditable: false
}
beforeEach(() => {
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: {
          content: [
            {
              id: 'merchant-1',
              code: 'MC001',
              name: 'Merchant A',
              status: 'ACTIVE'
            }
          ],
          totalElements: 1,
          number: 0,
          size: 100
        }
      })
    )
  )
  server.use(
    http.get('*/sub-merchants', () =>
      HttpResponse.json({
        data: {
          content: [
            {
              id: 'sub-1',
              code: 'SUB-1',
              name: 'Chi nhánh 1',
              status: 'ACTIVE',
              merchantId: 'merchant-1',
              merchantCode: 'MC001',
              merchantName: 'Merchant A'
            }
          ],
          totalElements: 1,
          number: 0,
          size: 100
        }
      })
    )
  )
})
const renderPage = (path: string) => {
  const store = createAppStore()
  store.dispatch(
    savePermissions([
      PERMISSION.TERMINAL_VIEW,
      PERMISSION.TERMINAL_CREATE,
      PERMISSION.TERMINAL_UPDATE
    ])
  )
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path='/terminal/create'
            element={<TerminalFormPage />}
          />
          <Route
            path='/terminal/edit/:id'
            element={<TerminalFormPage />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('Terminal form API', () => {
  it('tạo POS với Master, Sub-merchant và địa chỉ đúng payload BE', async () => {
    const user = userEvent.setup()
    let createdBody: unknown
    server.use(
      http.post('*/terminals', async ({ request }) => {
        createdBody = await request.json()
        return HttpResponse.json({
          data: { id: 'terminal-new', tid: 'TML000001' }
        })
      })
    )
    renderPage('/terminal/create')
    expect(screen.getByText('Hệ thống tự sinh khi tạo')).toBeInTheDocument()
    await user.click(screen.getByLabelText(/^Sub-merchant/))
    await user.click(
      await screen.findByLabelText('Chọn Sub-merchant Chi nhánh 1')
    )
    await waitFor(() =>
      expect(screen.getByLabelText(/^Sub-merchant/)).toHaveValue(
        'SUB-1 — Chi nhánh 1'
      )
    )
    expect(screen.getByLabelText(/^Master Merchant/)).toHaveValue(
      'MC001 — Merchant A'
    )
    await user.type(screen.getByLabelText(/Tên Terminal/), 'Quầy thu ngân 1')
    fireEvent.mouseDown(
      screen
        .getAllByLabelText(/Loại Terminal/)[0]
        .closest('.ant-select')!
        .querySelector('.ant-select-selector')!
    )
    await user.click(
      await screen.findByText('POS', {
        selector: '.ant-select-item-option-content'
      })
    )
    await user.click(
      document.querySelector('button[form="terminal-api-form"]')!
    )
    expect(
      await screen.findByText('Terminal POS cần địa chỉ')
    ).toBeInTheDocument()
    expect(createdBody).toBeUndefined()
    await user.type(screen.getByLabelText(/Địa chỉ điểm bán/), '12 Lê Lợi')
    await user.click(
      document.querySelector('button[form="terminal-api-form"]')!
    )
    await waitFor(() =>
      expect(createdBody).toMatchObject({
        subMerchantId: 'sub-1',
        name: 'Quầy thu ngân 1',
        terminalType: 'POS',
        address: '12 Lê Lợi',
        inheritContactPhone: true
      })
    )
    expect(createdBody).not.toHaveProperty('merchantId')
  })

  it('prefills edit form from the direct detail endpoint', async () => {
    server.use(
      http.get('*/terminals/:id', () =>
        HttpResponse.json({ data: terminal, success: true })
      )
    )
    renderPage('/terminal/edit/terminal-1')
    expect(await screen.findByDisplayValue('Quầy 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12 Lê Lợi')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getByText('Lưu thay đổi')).toBeInTheDocument()
  })

  it('shows a retry action when direct edit cannot load', async () => {
    server.use(
      http.get('*/terminals/:id', () =>
        HttpResponse.json({ message: 'error' }, { status: 500 })
      )
    )
    renderPage('/terminal/edit/terminal-1')
    expect(
      await screen.findByText('Không tải được Terminal.')
    ).toBeInTheDocument()
    expect(screen.queryByText('Lưu thay đổi')).not.toBeInTheDocument()
  })
})
