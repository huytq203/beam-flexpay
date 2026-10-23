import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import {
  CHANGE_ALREADY_PENDING_MESSAGE,
  PENDING_APPROVAL_MESSAGE
} from '../utils/bankAccountErrors'
import {
  masterAccount,
  mockBankAccountList,
  renderBankAccountPage
} from './bankAccount.setup'

vi.mock('@utils/file-download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@utils/file-download')>()),
  saveBlobAsFile: vi.fn().mockResolvedValue(undefined)
}))

const MANAGER = [
  PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW,
  PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE
]
const subAccount = { ...masterAccount, level: 'SUB', subMerchantId: 'sub-1' }

beforeEach(() => mockBankAccountList([subAccount]))
afterEach(() => sessionStorage.clear())

const openEditor = async (user: ReturnType<typeof userEvent.setup>) => {
  renderBankAccountPage(MANAGER)
  await user.click(await screen.findByRole('button', { name: 'Sửa' }))
  return screen.findByRole('dialog', { name: 'Cập nhật tài khoản ngân hàng' })
}

describe('BankAccount — sửa tài khoản Sub cần duyệt', () => {
  it('applied=false thì báo đang chờ quản trị viên khác phê duyệt', async () => {
    const user = userEvent.setup()
    let body: unknown
    server.use(
      http.post('*/sensitive-operations/otp-challenge', () =>
        HttpResponse.json({
          data: {
            otpSessionId: 'session-1',
            maskedRecipient: '******5678',
            expiresInSeconds: 180,
            canResendAfterSeconds: 30
          }
        })
      ),
      http.put('*/merchant-bank-accounts/bank-2', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({
          data: {
            account: subAccount,
            applied: false,
            inFlightWithdrawalCount: null,
            pendingChangeRequest: {
              id: 'change-7',
              bankAccountId: 'bank-2',
              changeType: 'UPDATE_ACCOUNT',
              status: 'PENDING',
              proposedAccountName: 'CONG TY B',
              requestedBy: 'user-1',
              createdAt: '2026-10-23T09:00:00'
            }
          }
        })
      })
    )
    const dialog = await openEditor(user)
    const name = within(dialog).getByLabelText(/^Tên chủ tài khoản/)
    await user.clear(name)
    await user.type(name, 'CONG TY B')
    await user.click(
      within(dialog).getByRole('button', { name: 'Lưu thay đổi' })
    )
    await user.type(await screen.findByLabelText('Mã OTP'), '123456')
    const otpDialog = screen
      .getByText(/Mã OTP đã gửi tới/)
      .closest('[role="dialog"]')
    if (!(otpDialog instanceof HTMLElement)) throw new Error('Không thấy OTP')
    await user.click(
      within(otpDialog).getByRole('button', { name: 'Xác nhận' })
    )
    await waitFor(() =>
      expect(body).toMatchObject({
        accountName: 'CONG TY B',
        otp: { otpSessionId: 'session-1', otp: '123456' }
      })
    )
    expect(await screen.findByText(PENDING_APPROVAL_MESSAGE)).toBeVisible()
  })

  it('BE báo đã có yêu cầu chờ duyệt thì nhắc duyệt/từ chối trước', async () => {
    const user = userEvent.setup()
    server.use(
      http.put('*/merchant-bank-accounts/bank-2', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'MERCHANT_BANK_ACCOUNT_CHANGE_ALREADY_PENDING',
            status: '5726',
            detail: 'pending'
          },
          { status: 409 }
        )
      )
    )
    const dialog = await openEditor(user)
    await user.type(within(dialog).getByLabelText('Chi nhánh'), 'Hà Nội')
    await user.click(
      within(dialog).getByRole('button', { name: 'Lưu thay đổi' })
    )
    expect(
      await screen.findByText(CHANGE_ALREADY_PENDING_MESSAGE)
    ).toBeVisible()
  })
})

describe('BankAccount — xuất CSV', () => {
  it('gửi đúng bộ lọc hiện tại, không kèm page/size', async () => {
    const user = userEvent.setup()
    let url: URL | undefined
    server.use(
      http.get('*/merchant-bank-accounts/export', ({ request }) => {
        url = new URL(request.url)
        return new HttpResponse('"a"', {
          headers: { 'Content-Type': 'text/csv;charset=UTF-8' }
        })
      })
    )
    renderBankAccountPage(
      [PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW],
      '/bank-account?merchantId=merchant-1&merchantName=Merchant%20A&level=SUB&status=ACTIVE&page=2&size=50'
    )
    await screen.findByText('CONG TY A')
    await user.click(screen.getByRole('button', { name: /Xuất CSV/ }))
    await waitFor(() => expect(url).toBeDefined())
    expect(Object.fromEntries(url?.searchParams ?? [])).toEqual({
      merchantId: 'merchant-1',
      level: 'SUB',
      status: 'ACTIVE'
    })
  })
})
