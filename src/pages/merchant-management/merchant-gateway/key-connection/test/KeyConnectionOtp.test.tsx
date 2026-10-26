import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import {
  CHALLENGE,
  apiError,
  hasOtp,
  installBaseHandlers,
  otpRequired,
  renderPage,
  submitOtp
} from './keyConnection.setup'

afterEach(() => sessionStorage.clear())
beforeEach(() => installBaseHandlers())

const openCreateAndPickMerchant = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await screen.findByText('client-public')
  await user.click(screen.getByRole('button', { name: 'Tạo key' }))
  const dialog = screen.getByRole('dialog', { name: 'Tạo key kết nối' })
  await user.click(within(dialog).getByLabelText(/Chọn Master Merchant/))
  await user.click(await screen.findByLabelText('Chọn Merchant Merchant A'))
  await waitFor(() =>
    expect(within(dialog).getByLabelText(/Chọn Master Merchant/)).toHaveValue(
      'M001 — Merchant A'
    )
  )
  return dialog
}

describe('Key kết nối — OTP riêng của bộ khóa', () => {
  it('tạo key: kiểm tra trước, xin OTP ở endpoint của credential rồi gửi sensitiveOtp', async () => {
    const user = userEvent.setup()
    const createBodies: unknown[] = []
    const challengeBodies: unknown[] = []
    let genericChallengeCalled = false
    server.use(
      http.post('*/merchant-api-credentials', async ({ request }) => {
        const body = await request.json()
        createBodies.push(body)
        if (!hasOtp(body)) return otpRequired()
        return HttpResponse.json(
          {
            data: {
              credential: {
                id: 'key-2',
                merchantId: 'merchant-1',
                clientId: 'new-client',
                status: 'ACTIVE',
                ipWhitelist: []
              },
              secretKey: 'secret-once'
            }
          },
          { status: 201 }
        )
      }),
      http.post(
        '*/merchant-api-credentials/otp-challenge',
        async ({ request }) => {
          challengeBodies.push(await request.json())
          return HttpResponse.json({ data: CHALLENGE })
        }
      ),
      http.post('*/sensitive-operations/otp-challenge', () => {
        genericChallengeCalled = true
        return HttpResponse.json({ data: CHALLENGE })
      })
    )
    renderPage()
    const dialog = await openCreateAndPickMerchant(user)
    expect(screen.getByText('Sub-merchant · kế thừa')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Tạo key' }))
    await submitOtp(user, '123456')

    expect(await screen.findByText('secret-once')).toBeInTheDocument()
    expect(screen.getByText('new-client')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sao chép Secret Key' })
    ).toHaveClass('ant-typography-copy')
    expect(challengeBodies).toEqual([
      { merchantId: 'merchant-1', authMode: 'HMAC_SHA256' }
    ])
    expect(genericChallengeCalled).toBe(false)
    expect(createBodies).toEqual([
      { merchantId: 'merchant-1', authMode: 'HMAC_SHA256', ipWhitelist: [] },
      {
        merchantId: 'merchant-1',
        authMode: 'HMAC_SHA256',
        ipWhitelist: [],
        sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '123456' }
      }
    ])
  })

  it('lỗi nghiệp vụ trả về trước bước OTP thì không xin OTP', async () => {
    const user = userEvent.setup()
    let challenged = false
    server.use(
      http.post('*/merchant-api-credentials', () =>
        apiError(
          'MERCHANT_CREDENTIAL_SCOPE_ACTIVE',
          'Phạm vi này đã có key đang hoạt động',
          409
        )
      ),
      http.post('*/merchant-api-credentials/otp-challenge', () => {
        challenged = true
        return HttpResponse.json({ data: CHALLENGE })
      })
    )
    renderPage()
    const dialog = await openCreateAndPickMerchant(user)
    await user.click(within(dialog).getByRole('button', { name: 'Tạo key' }))
    expect(
      await within(dialog).findByText('Phạm vi này đã có key đang hoạt động')
    ).toBeInTheDocument()
    expect(challenged).toBe(false)
    expect(
      screen.queryByText('Xác nhận bằng OTP', { selector: '.ant-modal-title' })
    ).toBeNull()
  })

  it('thu hồi key: OTP sai thì cho nhập lại mã, body khớp với lúc xin OTP', async () => {
    const user = userEvent.setup()
    const revokeBodies: unknown[] = []
    let challengeBody: unknown
    server.use(
      http.post(
        '*/merchant-api-credentials/key-1/otp-challenge',
        async ({ request }) => {
          challengeBody = await request.json()
          return HttpResponse.json({ data: CHALLENGE })
        }
      ),
      http.post(
        '*/merchant-api-credentials/key-1/revoke',
        async ({ request }) => {
          const body = await request.json()
          revokeBodies.push(body)
          if (!hasOtp(body)) return otpRequired()
          if (revokeBodies.length === 2)
            return apiError(
              'MERCHANT_SENSITIVE_OTP_INVALID',
              'Mã OTP không chính xác'
            )
          return HttpResponse.json({ data: { id: 'key-1', status: 'REVOKED' } })
        }
      )
    )
    renderPage()
    await screen.findByText('client-public')
    await user.click(screen.getByRole('button', { name: 'Thu hồi' }))
    const dialog = screen.getByRole('dialog', { name: 'Thu hồi key' })
    const reason = within(dialog).getByRole('textbox', {
      name: 'Lý do thu hồi'
    })
    await user.type(reason, 'Ngắn')
    await user.click(
      within(dialog).getByRole('button', { name: 'Xác nhận thu hồi' })
    )
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'tối thiểu 10 ký tự'
    )
    expect(revokeBodies).toHaveLength(0)
    await user.type(reason, ' do key bị lộ')
    await user.click(
      within(dialog).getByRole('button', { name: 'Xác nhận thu hồi' })
    )
    const otpDialog = await submitOtp(user, '111111')
    expect(
      await within(otpDialog).findByText('Mã OTP không chính xác')
    ).toBeInTheDocument()
    await submitOtp(user, '222222')
    await waitFor(() => expect(revokeBodies).toHaveLength(3))
    const expected = { reason: 'Ngắn do key bị lộ', expectedRevision: 7 }
    expect(challengeBody).toEqual({ action: 'REVOKE', ...expected })
    expect(revokeBodies[0]).toEqual(expected)
    expect(revokeBodies[2]).toEqual({
      ...expected,
      sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '222222' }
    })
    await waitFor(() =>
      expect(
        screen.queryByText('Xác nhận bằng OTP', {
          selector: '.ant-modal-title'
        })
      ).toBeNull()
    )
  })
})
