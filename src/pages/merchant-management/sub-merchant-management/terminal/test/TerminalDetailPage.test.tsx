import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { PERMISSION } from '@/app/permissions'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import TerminalDetailPage from '../pages/TerminalDetailPage'

const terminal = { id: 'terminal-1', tid: 'T-001', name: 'Quầy 1', terminalType: 'POS', address: '12 Lê Lợi', status: 'ACTIVE', subMerchantId: 'sub-1', subMerchantName: 'Chi nhánh 1', merchantId: 'merchant-1', contactPhone: { value: '0912345678', inherited: true }, createdAt: '2026-09-24T04:00:00' }
const renderPage = () => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.TERMINAL_VIEW]))
  return render(<Provider store={store}><MemoryRouter initialEntries={['/terminal/detail/terminal-1']}><Routes><Route path='/terminal/detail/:id' element={<TerminalDetailPage />} /></Routes></MemoryRouter></Provider>)
}

describe('Terminal detail API', () => {
  it('loads a direct URL from GET /terminals/{id}', async () => {
    let requested = ''
    server.use(http.get('*/terminals/:id', ({ request }) => { requested = request.url; return HttpResponse.json({ data: terminal, success: true }) }))
    renderPage()
    expect((await screen.findAllByText('Quầy 1')).length).toBeGreaterThan(0)
    expect(screen.getByText('12 Lê Lợi')).toBeInTheDocument()
    expect(requested).toContain('/terminals/terminal-1')
  })

  it('shows retry when detail API fails', async () => {
    server.use(http.get('*/terminals/:id', () => HttpResponse.json({ message: 'error' }, { status: 500 })))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Không tải được chi tiết Terminal')
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })
})
