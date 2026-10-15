import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import BankAccount from '../pages/BankAccount'

const account = {
  id: 'bank-2',
  merchantId: 'merchant-1',
  level: 'MASTER',
  bankCode: 'TCB',
  accountNumber: '1903456789012',
  accountName: 'CONG TY A',
  isDefault: false,
  status: 'ACTIVE',
  linkStatus: 'LINKED',
  holdMode: false
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

const renderPage = () => {
  const store = createAppStore()
  store.dispatch(
    savePermissions([
      PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW,
      PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE
    ])
  )
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <BankAccount />
      </MemoryRouter>
    </Provider>
  )
}

describe('BankAccount — thao tác trên dòng', () => {
  it('có cột # và tạm giữ tài khoản chỉ cần lý do, không hỏi OTP', async () => {
    const user = userEvent.setup()
    let holdBody: unknown
    let otpRequested = false
    server.use(
      http.post('*/sensitive-operations/otp-challenge', () => {
        otpRequested = true
        return HttpResponse.json({ data: {} })
      }),
      http.all('*/merchant-bank-accounts/bank-2/hold*', async ({ request }) => {
        holdBody = await request.json()
        return HttpResponse.json({ data: account })
      })
    )
    renderPage()
    expect(
      await screen.findByRole('columnheader', { name: '#' })
    ).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Tạm giữ' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Tạm giữ tài khoản'
    })
    await user.type(within(dialog).getByLabelText('Lý do'), 'Nghi ngờ gian lận')
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận' }))
    await waitFor(() =>
      expect(holdBody).toMatchObject({ reason: 'Nghi ngờ gian lận' })
    )
    expect(otpRequested).toBe(false)
  })

  it('đặt mặc định yêu cầu OTP trước khi gọi API', async () => {
    const user = userEvent.setup()
    let defaultBody: unknown
    server.use(
      http.post('*/sensitive-operations/otp-challenge', () =>
        HttpResponse.json({
          data: {
            otpSessionId: 'session-9',
            maskedRecipient: '******5678',
            expiresInSeconds: 180,
            canResendAfterSeconds: 30
          }
        })
      ),
      http.all(
        '*/merchant-bank-accounts/bank-2/default*',
        async ({ request }) => {
          defaultBody = await request.json()
          return HttpResponse.json({ data: account })
        }
      )
    )
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Mặc định' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Đặt tài khoản mặc định'
    })
    await user.type(
      within(dialog).getByLabelText('Lý do'),
      'Đổi tài khoản nhận'
    )
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận' }))
    expect(await screen.findByText(/Mã OTP đã gửi tới/)).toBeInTheDocument()
    expect(defaultBody).toBeUndefined()
    await user.type(screen.getByLabelText('Mã OTP'), '654321')
    const otpDialog = screen
      .getByText(/Mã OTP đã gửi tới/)
      .closest('[role="dialog"]')
    if (!(otpDialog instanceof HTMLElement)) throw new Error('Không thấy OTP')
    await user.click(
      within(otpDialog).getByRole('button', { name: 'Xác nhận' })
    )
    await waitFor(() =>
      expect(defaultBody).toMatchObject({
        reason: 'Đổi tài khoản nhận',
        otp: { otpSessionId: 'session-9', otp: '654321' }
      })
    )
  })

  it('TK chờ xác minh có nút Xác minh và gọi link-verification?linked=true', async () => {
    const user = userEvent.setup()
    let url: URL | undefined
    server.use(
      http.get('*/merchant-bank-accounts', () =>
        HttpResponse.json({
          data: {
            content: [{ ...account, linkStatus: 'PENDING_VERIFICATION' }],
            totalElements: 1,
            number: 0,
            size: 20
          }
        })
      ),
      http.post(
        '*/merchant-bank-accounts/bank-2/link-verification',
        ({ request }) => {
          url = new URL(request.url)
          return HttpResponse.json({ data: account })
        }
      )
    )
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Xác minh' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Xác minh liên kết'
    })
    await user.type(
      within(dialog).getByLabelText('Lý do'),
      'Đã đối chiếu sao kê'
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Xác minh thành công' })
    )
    await waitFor(() => expect(url?.searchParams.get('linked')).toBe('true'))
    expect(url?.searchParams.get('reason')).toBe('Đã đối chiếu sao kê')
  })

  it('TK đã liên kết không có nút Xác minh', async () => {
    renderPage()
    await screen.findByRole('button', { name: 'Tạm giữ' })
    expect(screen.queryByRole('button', { name: 'Xác minh' })).toBeNull()
  })
})
