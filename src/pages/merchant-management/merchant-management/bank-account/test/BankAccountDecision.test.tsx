import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions, setAccessToken } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import BankAccount from '../pages/BankAccount'

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
  holdMode: false,
  pendingChangeRequest: {
    id: 'change-1',
    bankAccountId: 'bank-3',
    changeType: 'UPDATE_ACCOUNT',
    status: 'PENDING',
    proposedAccountNumber: '32143123212111',
    requestedBy: 'user-1',
    requestReason: 'Thay đổi số tài khoản',
    createdAt: '2026-10-02T03:39:29.837'
  }
}

beforeEach(() =>
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: {
          content: [{ id: 'merchant-1', code: 'M001', name: 'Merchant A' }],
          totalElements: 1
        }
      })
    ),
    http.get('*/merchant-bank-accounts', () =>
      HttpResponse.json({
        data: { content: [account], totalElements: 1, number: 0, size: 20 }
      })
    )
  )
)

/** Token giả chỉ để store có JWT subject của người đang đăng nhập. */
const tokenFor = (sub: string, permissions: string[]) =>
  ['h', btoa(JSON.stringify({ sub, permissions, exp: 4102444800 })), 's'].join(
    '.'
  )

const renderPage = (permissions: string[], userId?: string) => {
  const store = createAppStore()
  if (userId)
    store.dispatch(setAccessToken({ token: tokenFor(userId, permissions) }))
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <BankAccount />
      </MemoryRouter>
    </Provider>
  )
}

const CHECKER = [
  PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW,
  PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE,
  PERMISSION.MERCHANT_BANK_ACCOUNT_APPROVE
]

describe('BankAccount — yêu cầu thay đổi đang chờ duyệt', () => {
  it('chỉ hiện Phê duyệt và Từ chối, ẩn các nút sửa', async () => {
    renderPage(CHECKER)
    expect(
      await screen.findByRole('button', { name: 'Phê duyệt' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeInTheDocument()
    for (const name of ['Sửa', 'Mặc định', 'Tạm giữ', 'Xác minh']) {
      expect(screen.queryByRole('button', { name })).toBeNull()
    }
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
  })

  it('không có quyền duyệt thì không có nút nào', async () => {
    renderPage([
      PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW,
      PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE
    ])
    await screen.findByText('Chờ duyệt')
    expect(screen.queryByRole('button', { name: 'Phê duyệt' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Sửa' })).toBeNull()
  })

  it('phê duyệt gọi đúng yêu cầu và cho đối chiếu giá trị đề xuất', async () => {
    const user = userEvent.setup()
    let approvedId = ''
    let body: unknown
    server.use(
      http.post(
        '*/merchant-bank-accounts/change-requests/:id/approve',
        async ({ params, request }) => {
          approvedId = String(params.id)
          body = await request.json()
          return HttpResponse.json({ data: {} })
        }
      )
    )
    renderPage(CHECKER)
    await user.click(await screen.findByRole('button', { name: 'Phê duyệt' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Phê duyệt thay đổi tài khoản'
    })
    expect(within(dialog).getByText('32143123212111')).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('Lý do'), 'Đã đối chiếu')
    await user.click(within(dialog).getByRole('button', { name: 'Phê duyệt' }))
    await waitFor(() => expect(approvedId).toBe('change-1'))
    expect(body).toMatchObject({ reason: 'Đã đối chiếu' })
  })

  it('từ chối bắt buộc có lý do', async () => {
    const user = userEvent.setup()
    let rejectBody: unknown
    server.use(
      http.post(
        '*/merchant-bank-accounts/change-requests/change-1/reject',
        async ({ request }) => {
          rejectBody = await request.json()
          return HttpResponse.json({ data: {} })
        }
      )
    )
    renderPage(CHECKER)
    await user.click(await screen.findByRole('button', { name: 'Từ chối' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Từ chối thay đổi tài khoản'
    })
    await user.click(within(dialog).getByRole('button', { name: 'Từ chối' }))
    expect(rejectBody).toBeUndefined()
    await user.type(within(dialog).getByLabelText('Lý do'), 'Sai chứng từ')
    await user.click(within(dialog).getByRole('button', { name: 'Từ chối' }))
    await waitFor(() =>
      expect(rejectBody).toMatchObject({ reason: 'Sai chứng từ' })
    )
  })

  it('người gửi yêu cầu không thấy nút duyệt', async () => {
    renderPage(CHECKER, 'user-1')
    expect(await screen.findByText('Chờ người khác duyệt')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Phê duyệt' })).toBeNull()
  })
})
