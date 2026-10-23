import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import {
  masterAccount,
  mockBankAccountList,
  renderBankAccountPage
} from './bankAccount.setup'

const MANAGER = [
  PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW,
  PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE
]

beforeEach(() => mockBankAccountList())
afterEach(() => sessionStorage.clear())

const openDelete = async (user: ReturnType<typeof userEvent.setup>) => {
  renderBankAccountPage(MANAGER)
  await user.click(await screen.findByRole('button', { name: 'Xóa' }))
  return screen.findByRole('dialog', { name: 'Xóa tài khoản ngân hàng' })
}

describe('BankAccount — xóa tài khoản', () => {
  it('gửi DELETE kèm lý do và báo thành công dù response không có data', async () => {
    const user = userEvent.setup()
    let body: unknown
    server.use(
      http.delete('*/merchant-bank-accounts/bank-2', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({
          success: true,
          message: 'success',
          status: '1000',
          detail: 'ok'
        })
      })
    )
    const dialog = await openDelete(user)
    await user.type(within(dialog).getByLabelText('Lý do'), 'Nhập nhầm')
    await user.click(within(dialog).getByRole('button', { name: 'Xóa' }))
    await waitFor(() => expect(body).toEqual({ reason: 'Nhập nhầm' }))
    expect(
      await screen.findByText('Đã xóa tài khoản ngân hàng')
    ).toBeInTheDocument()
  })

  it.each([
    ['MERCHANT_BANK_ACCOUNT_WITHDRAWAL_IN_PROGRESS', /lệnh rút tiền chưa/],
    ['MERCHANT_BANK_ACCOUNT_HAS_TRANSACTIONS', /phát sinh giao dịch/],
    ['MERCHANT_BANK_ACCOUNT_SETTLEMENT_UNATTRIBUTED', /quyết toán/],
    ['MERCHANT_BANK_ACCOUNT_HAS_CHANGE_HISTORY', /lịch sử thay đổi/]
  ])('lỗi %s hướng dẫn dùng Ngừng thay vì xóa', async (code, text) => {
    const user = userEvent.setup()
    server.use(
      http.delete('*/merchant-bank-accounts/bank-2', () =>
        HttpResponse.json(
          { success: false, message: code, status: '5722', detail: 'x' },
          { status: 409 }
        )
      )
    )
    const dialog = await openDelete(user)
    await user.click(within(dialog).getByRole('button', { name: 'Xóa' }))
    const alert = await within(dialog).findByRole('alert')
    expect(alert).toHaveTextContent(text)
    expect(alert).toHaveTextContent('“Ngừng”')
  })

  it('không có nút Xóa trên dòng đang chờ duyệt', async () => {
    mockBankAccountList([
      {
        ...masterAccount,
        pendingChangeRequest: {
          id: 'change-1',
          bankAccountId: 'bank-2',
          changeType: 'SET_DEFAULT',
          status: 'PENDING',
          requestedBy: 'user-9',
          createdAt: '2026-10-02T03:39:29'
        }
      }
    ])
    renderBankAccountPage([
      ...MANAGER,
      PERMISSION.MERCHANT_BANK_ACCOUNT_APPROVE
    ])
    await screen.findByRole('button', { name: 'Phê duyệt' })
    expect(screen.queryByRole('button', { name: 'Xóa' })).toBeNull()
  })
})

describe('BankAccount — chi tiết tài khoản', () => {
  it('tải GET /merchant-bank-accounts/{id} và hiện đủ thông tin', async () => {
    const user = userEvent.setup()
    let requested = ''
    server.use(
      http.get('*/merchant-bank-accounts/:id', ({ params }) => {
        requested = String(params.id)
        return HttpResponse.json({
          data: {
            ...masterAccount,
            linkStatus: 'LINK_FAILED',
            linkFailureReason: 'Tên chủ tài khoản không khớp',
            holdMode: true,
            holdModeReason: 'Nghi ngờ gian lận',
            payable: false,
            pendingChangeRequest: {
              id: 'change-2',
              bankAccountId: 'bank-2',
              changeType: 'UPDATE_ACCOUNT',
              status: 'PENDING',
              proposedAccountNumber: '9988776655',
              requestedBy: 'user-9',
              createdAt: '2026-10-02T03:39:29'
            }
          }
        })
      })
    )
    renderBankAccountPage([PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW])
    await user.click(await screen.findByRole('button', { name: 'Chi tiết' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Chi tiết tài khoản ngân hàng'
    })
    expect(
      await within(dialog).findByText('Tên chủ tài khoản không khớp')
    ).toBeInTheDocument()
    expect(requested).toBe('bank-2')
    expect(dialog).toHaveTextContent('Nghi ngờ gian lận')
    expect(dialog).toHaveTextContent('Không thể chi trả')
    expect(dialog).toHaveTextContent('Lỗi liên kết')
    expect(within(dialog).getByText('9988776655')).toBeInTheDocument()
  })

  it('báo lỗi và cho thử lại khi không tải được chi tiết', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('*/merchant-bank-accounts/:id', () =>
        HttpResponse.json(
          {
            message: 'RESOURCE_NOT_FOUND',
            detail: 'Không tìm thấy tài khoản'
          },
          { status: 404 }
        )
      )
    )
    renderBankAccountPage([PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW])
    await user.click(await screen.findByRole('button', { name: 'Chi tiết' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Chi tiết tài khoản ngân hàng'
    })
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Không tìm thấy tài khoản'
    )
    expect(
      within(dialog).getByRole('button', { name: 'Thử lại' })
    ).toBeInTheDocument()
  })
})
