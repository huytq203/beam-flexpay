import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import BusinessWallet from '../pages/BusinessWallet'
import BusinessWalletForm from '../pages/BusinessWalletForm'

const PERMISSIONS = [
  'EWALLET:MERCHANT:VIEW',
  'EWALLET:MERCHANT:CREATE',
  'EWALLET:MERCHANT:UPDATE'
]

const renderRoute = (route: string) => {
  const store = createAppStore()
  store.dispatch(savePermissions(PERMISSIONS))
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path='/list'
              element={<BusinessWallet />}
            />
            <Route
              path='/business-wallet-account/create'
              element={<BusinessWalletForm />}
            />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}

describe('Business wallet draft', () => {
  it('saves a draft with only the email, leaving other fields out', async () => {
    const bodies: Record<string, unknown>[] = []
    server.use(
      http.post('*/enterprise-wallets/drafts', async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>)
        return HttpResponse.json({ data: { id: 'w1' }, success: true })
      })
    )
    const user = userEvent.setup()
    renderRoute('/business-wallet-account/create')
    await user.type(
      screen.getByPlaceholderText('abc@domain.com'),
      'draft@example.com'
    )
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }))

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0].registeredEmail).toBe('draft@example.com')
    expect(bodies[0]).not.toHaveProperty('legalName')
    expect(bodies[0]).not.toHaveProperty('taxCode')
  })

  it('refuses a draft without a valid email', async () => {
    let requests = 0
    server.use(
      http.post('*/enterprise-wallets/drafts', () => {
        requests += 1
        return HttpResponse.json({ data: null })
      })
    )
    const user = userEvent.setup()
    renderRoute('/business-wallet-account/create')
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }))
    expect(
      await screen.findByText('Email đăng ký không đúng định dạng')
    ).toBeInTheDocument()
    expect(requests).toBe(0)
  })

  it('confirms before submitting a draft for KYB', async () => {
    const draft = {
      id: 'wallet-1',
      registeredEmail: 'finance@example.com',
      legalName: 'Công ty Sao Việt',
      verificationStatus: 'DRAFT',
      createdAt: '2026-09-01T08:30:00Z'
    }
    let submits = 0
    server.use(
      http.get('*/enterprise-wallets', () =>
        HttpResponse.json({
          data: {
            content: [draft],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10
          },
          success: true
        })
      ),
      http.post('*/enterprise-wallets/wallet-1/submit', () => {
        submits += 1
        return HttpResponse.json({
          data: { ...draft, verificationStatus: 'PENDING_APPROVAL' },
          success: true
        })
      })
    )
    const user = userEvent.setup()
    renderRoute('/list')
    await user.click(
      await screen.findByRole('button', {
        name: 'Gửi duyệt ví Công ty Sao Việt'
      })
    )
    expect(submits).toBe(0)
    await user.click(screen.getByRole('button', { name: /^Gửi duyệt$/ }))
    await waitFor(() => expect(submits).toBe(1))
  })
})
