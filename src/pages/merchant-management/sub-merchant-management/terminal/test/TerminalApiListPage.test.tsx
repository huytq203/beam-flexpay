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

const row = { id: 'terminal-1', tid: 'TML000001', name: 'Quầy 1', terminalType: 'POS', status: 'ACTIVE', subMerchantId: 'sub-1', subMerchantName: 'Chi nhánh 1', merchantId: 'merchant-1' }
function CurrentPath() { return <span data-testid='current-path'>{useLocation().pathname}</span> }

describe('Terminal API list', () => {
  it('hiển thị icon action nhỏ và xem chi tiết trong modal, giữ nguyên route', async () => {
    const user = userEvent.setup()
    let detailRequests = 0
    server.use(
      http.get('*/merchants', () => HttpResponse.json({ data: { content: [], totalElements: 0, number: 0, size: 100 } })),
      http.get('*/sub-merchants', () => HttpResponse.json({ data: { content: [], totalElements: 0, number: 0, size: 100 } })),
      http.get('*/terminals', () => HttpResponse.json({ data: { content: [row], totalElements: 1, number: 0, size: 20 } })),
      http.get('*/terminals/:id', () => { detailRequests += 1; return HttpResponse.json({ data: { ...row, address: '12 Lê Lợi', contactPerson: 'Nguyễn Văn A' } }) })
    )
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.TERMINAL_VIEW, PERMISSION.TERMINAL_UPDATE]))
    render(<Provider store={store}><MemoryRouter initialEntries={['/terminal']}><CurrentPath /><Routes><Route path='/terminal' element={<TerminalListPage />} /></Routes></MemoryRouter></Provider>)
    const view = await screen.findByRole('button', { name: 'Xem Terminal Quầy 1' })
    expect(view).toHaveClass('ant-btn-sm')
    expect(view).not.toHaveTextContent('Xem')
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
    await user.click(view)
    const dialog = await screen.findByRole('dialog', { name: 'Chi tiết Terminal' })
    expect(dialog).toHaveTextContent('12 Lê Lợi')
    expect(dialog).toHaveTextContent('Nguyễn Văn A')
    expect(screen.getByTestId('current-path')).toHaveTextContent('/terminal')
    await waitFor(() => expect(detailRequests).toBe(1))
  })
})
