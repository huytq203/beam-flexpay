import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import BusinessWallet from '../pages/BusinessWallet'

const wallet = {
  id: 'wallet-1', registeredEmail: 'finance@example.com', legalName: 'Công ty Sao Việt',
  taxCode: '0301234567', businessType: 'ENTERPRISE', verificationStatus: 'VERIFIED',
  bankLinkStatus: 'BANK_LINKED', createdAt: '2026-09-01T08:30:00Z'
}
const respond = () => HttpResponse.json({ data: { content: [wallet], totalElements: 1, totalPages: 1, number: 0, size: 10 }, success: true })
const renderPage = (permissions: string[] = ['EWALLET:MERCHANT:VIEW']) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(<Provider store={store}><MemoryRouter><BusinessWallet /></MemoryRouter></Provider>)
}

describe('BusinessWallet Merchant API', () => {
  it('loads enterprise wallets with zero based API pagination and real columns', async () => {
    let requested = ''
    server.use(http.get('*/enterprise-wallets', ({ request }) => { requested = request.url; return respond() }))
    renderPage()
    expect(await screen.findByText('Công ty Sao Việt')).toBeInTheDocument()
    expect(screen.getByText('finance@example.com')).toBeInTheDocument()
    expect(screen.getByText('Đã xác minh')).toBeInTheDocument()
    expect(screen.getByText('Đã liên kết')).toBeInTheDocument()
    expect(new URL(requested).searchParams.get('page')).toBe('0')
    expect(new URL(requested).searchParams.get('size')).toBe('10')
  })

  it('applies tax code through the Merchant API', async () => {
    const requests: string[] = []
    server.use(http.get('*/enterprise-wallets', ({ request }) => { requests.push(request.url); return respond() }))
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Công ty Sao Việt')
    await user.type(screen.getByLabelText('Mã số thuế'), '0301234567')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() => expect(requests.some((url) => new URL(url).searchParams.get('taxCode') === '0301234567')).toBe(true))
  })

  it('keeps the wrapped table refresh control', async () => {
    server.use(http.get('*/enterprise-wallets', respond))
    renderPage()
    await screen.findByText('Công ty Sao Việt')
    expect(screen.getByRole('button', { name: 'Làm mới dữ liệu' })).toBeInTheDocument()
  })

  it('confirms KYB approval before calling the approval API', async () => {
    const pendingWallet = { ...wallet, verificationStatus: 'PENDING_APPROVAL' }
    let approvalCount = 0
    server.use(
      http.get('*/enterprise-wallets', () => HttpResponse.json({ data: { content: [pendingWallet], totalElements: 1, totalPages: 1, number: 0, size: 10 }, success: true })),
      http.post('*/enterprise-wallets/wallet-1/approve', () => {
        approvalCount += 1
        return HttpResponse.json({ data: { ...pendingWallet, verificationStatus: 'VERIFIED' }, success: true })
      })
    )
    const user = userEvent.setup()
    renderPage(['EWALLET:MERCHANT:VIEW', 'EWALLET:ENTERPRISE_WALLET:KYB_APPROVE'])

    await user.click(await screen.findByRole('button', { name: 'Phê duyệt ví Công ty Sao Việt' }))
    expect(approvalCount).toBe(0)
    await user.click(screen.getByRole('button', { name: /^Phê duyệt$/ }))
    await waitFor(() => expect(approvalCount).toBe(1))
  })
})
