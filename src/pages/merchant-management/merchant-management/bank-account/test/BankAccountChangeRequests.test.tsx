import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import BankAccount from '../pages/BankAccount'

const request = {
  id: 'change-1',
  changeRequestId: 'change-1',
  bankAccountId: 'bank-3',
  merchantId: 'merchant-1',
  merchantName: 'Merchant A',
  subMerchantId: 'sub-1',
  subMerchantName: 'Quán số 1',
  changeType: 'UPDATE_ACCOUNT',
  status: 'PENDING',
  currentBankCode: 'VCB',
  currentAccountNumber: '••••4567',
  currentAccountName: 'CONG TY B',
  proposedBankCode: 'TCB',
  proposedAccountNumber: '32143123212111',
  proposedAccountName: 'CONG TY B',
  requestedBy: 'user-1',
  requestedByName: 'sales01',
  requestReason: 'Đổi tài khoản nhận',
  createdAt: '2026-10-02T03:39:29.837'
}

const account = {
  id: 'bank-3',
  merchantId: 'merchant-1',
  subMerchantId: 'sub-1',
  level: 'SUB',
  bankCode: 'VCB',
  accountNumber: '0011001234567',
  accountName: 'CONG TY B',
  isDefault: false,
  status: 'ACTIVE',
  linkStatus: 'LINKED',
  pendingChangeRequest: request
}

const page = (content: unknown[]) =>
  HttpResponse.json({
    data: { content, totalElements: content.length, number: 0, size: 20 }
  })

beforeEach(() =>
  server.use(
    http.get('*/merchants', () => page([])),
    http.get('*/merchant-bank-accounts/change-requests', () => page([request])),
    http.get('*/merchant-bank-accounts/:id', () =>
      HttpResponse.json({ data: account })
    )
  )
)
afterEach(() => sessionStorage.clear())

const CHECKER = [
  PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW,
  PERMISSION.MERCHANT_BANK_ACCOUNT_APPROVE
]

const renderRequests = (permissions: string[] = CHECKER) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/?tab=requests']}>
        <BankAccount />
      </MemoryRouter>
    </Provider>
  )
}

describe('BankAccount: tab yêu cầu chờ duyệt', () => {
  it('mặc định gửi status=PENDING, page=1 và hiện Merchant, Sub, giá trị hiện tại và đề xuất', async () => {
    let query = ''
    server.use(
      http.get('*/merchant-bank-accounts/change-requests', ({ request: r }) => {
        query = new URL(r.url).search
        return page([request])
      })
    )
    renderRequests()
    const row = (await screen.findByText('Quán số 1')).closest('tr')!
    const params = new URLSearchParams(query)
    expect(params.get('status')).toBe('PENDING')
    expect(params.get('page')).toBe('1')
    expect(within(row).getByText('Merchant A')).toBeInTheDocument()
    expect(within(row).getByText('VCB · ••••4567')).toBeInTheDocument()
    expect(within(row).getByText('TCB · ••••2111')).toBeInTheDocument()
    expect(within(row).getByText('sales01')).toBeInTheDocument()
  })

  it('duyệt từ hàng đợi tải tài khoản rồi mở hộp thoại đối chiếu hiện có', async () => {
    const user = userEvent.setup()
    let approvedId = ''
    server.use(
      http.post(
        '*/merchant-bank-accounts/change-requests/:id/approve',
        ({ params }) => {
          approvedId = String(params.id)
          return HttpResponse.json({ data: {} })
        }
      )
    )
    renderRequests()
    await user.click(await screen.findByRole('button', { name: 'Phê duyệt' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Phê duyệt thay đổi tài khoản'
    })
    expect(within(dialog).getByText('32143123212111')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Phê duyệt' }))
    await waitFor(() => expect(approvedId).toBe('change-1'))
  })

  it('yêu cầu không còn chờ duyệt của tài khoản thì không cho quyết định', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('*/merchant-bank-accounts/bank-3', () =>
        HttpResponse.json({
          data: { ...account, pendingChangeRequest: null }
        })
      )
    )
    renderRequests()
    await user.click(await screen.findByRole('button', { name: 'Phê duyệt' }))
    expect(await screen.findByText(/không còn chờ duyệt/)).toBeInTheDocument()
  })

  it('người gửi không thấy nút duyệt, không có quyền duyệt thì không có nút', async () => {
    renderRequests([PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW])
    await screen.findByText('Quán số 1')
    expect(screen.queryByRole('button', { name: 'Phê duyệt' })).toBeNull()
  })

  it('đổi trạng thái sang Đã từ chối thì gửi status=REJECTED và không có nút duyệt', async () => {
    const user = userEvent.setup()
    const statuses: string[] = []
    server.use(
      http.get('*/merchant-bank-accounts/change-requests', ({ request: r }) => {
        const status = new URL(r.url).searchParams.get('status') ?? ''
        statuses.push(status)
        return page([
          {
            ...request,
            status,
            decidedAt: '2026-10-03T01:00:00',
            decisionReason: 'Sai chứng từ'
          }
        ])
      })
    )
    renderRequests()
    await screen.findByText('Quán số 1')
    await user.click(screen.getByLabelText('Trạng thái yêu cầu'))
    await user.click(await screen.findByText('Đã từ chối'))
    expect(await screen.findByText(/Sai chứng từ/)).toBeInTheDocument()
    expect(statuses).toContain('REJECTED')
    expect(screen.queryByRole('button', { name: 'Phê duyệt' })).toBeNull()
  })
})
