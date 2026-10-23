import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import {
  CHALLENGE,
  submitOtp
} from '../../key-connection/test/keyConnection.setup'
import { WebhookEditDialog } from '../components/WebhookEditDialog'
import { validateWebhookUrl } from '../utils/webhook.utils'

const SUB_SCOPE = { merchantId: 'merchant-1', subMerchantId: 'sub-1' }

const inheritedWebhook = {
  merchantId: 'merchant-1',
  subMerchantId: 'sub-1',
  inherited: true,
  rowRevision: 0,
  url: 'https://master.test/ipn',
  enabled: true,
  updatedAt: '2026-10-22T03:00:00Z'
}

describe('validateWebhookUrl', () => {
  it.each([
    ['', 'Vui lòng nhập URL nhận IPN'],
    ['http://a.test/ipn', 'URL phải dùng https'],
    ['https://a.test:8443/ipn', 'Chỉ dùng cổng 443'],
    [
      'https://u:p@a.test/ipn',
      'URL không được chứa tên đăng nhập hoặc mật khẩu'
    ],
    ['https://a.test/ipn#x', 'URL không được chứa dấu #']
  ])('từ chối %s', (value, message) => {
    expect(validateWebhookUrl(value)).toBe(message)
  })

  it('chấp nhận https cổng 443 hoặc bỏ trống cổng', () => {
    expect(validateWebhookUrl('https://a.test/ipn')).toBe('')
    expect(validateWebhookUrl('https://a.test:443/ipn')).toBe('')
  })
})

describe('WebhookEditDialog', () => {
  it('Sub kế thừa: xin OTP với subMerchantId và expectedRevision 0 rồi PUT kèm sensitiveOtp', async () => {
    const user = userEvent.setup()
    const challenge: { query: string | null; body: unknown }[] = []
    const puts: { query: string | null; body: unknown }[] = []
    server.use(
      http.post(
        '*/merchants/merchant-1/webhook/otp-challenge',
        async ({ request }) => {
          challenge.push({
            query: new URL(request.url).searchParams.get('subMerchantId'),
            body: await request.json()
          })
          return HttpResponse.json({ data: CHALLENGE })
        }
      ),
      http.put('*/merchants/merchant-1/webhook', async ({ request }) => {
        puts.push({
          query: new URL(request.url).searchParams.get('subMerchantId'),
          body: await request.json()
        })
        return HttpResponse.json({
          data: {
            webhook: { ...inheritedWebhook, inherited: false, rowRevision: 1 }
          }
        })
      })
    )
    renderWithProviders(
      <WebhookEditDialog
        scope={SUB_SCOPE}
        scopeLabel='Sub-merchant A'
        webhook={inheritedWebhook}
        onClose={() => undefined}
      />
    )

    await user.type(
      screen.getByLabelText(/Lý do thay đổi/),
      '  Đổi URL cho Sub  '
    )
    await user.click(screen.getByRole('button', { name: /Lưu cấu hình/ }))
    await submitOtp(user, '123456')

    await waitFor(() => expect(puts).toHaveLength(1))
    const expectedBody = {
      url: 'https://master.test/ipn',
      enabled: true,
      reason: 'Đổi URL cho Sub',
      expectedRevision: 0
    }
    expect(challenge).toEqual([{ query: 'sub-1', body: expectedBody }])
    expect(puts).toEqual([
      {
        query: 'sub-1',
        body: {
          ...expectedBody,
          sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '123456' }
        }
      }
    ])
  })

  it('URL sai hình thức bị chặn ở FE, không xin OTP', async () => {
    const user = userEvent.setup()
    let challenged = false
    server.use(
      http.post('*/merchants/merchant-1/webhook/otp-challenge', () => {
        challenged = true
        return HttpResponse.json({ data: CHALLENGE })
      })
    )
    renderWithProviders(
      <WebhookEditDialog
        scope={{ merchantId: 'merchant-1' }}
        scopeLabel='Master A'
        webhook={{
          ...inheritedWebhook,
          subMerchantId: null,
          inherited: false,
          rowRevision: 2
        }}
        onClose={() => undefined}
      />
    )
    const urlInput = screen.getByLabelText(/URL nhận IPN/)
    await user.clear(urlInput)
    await user.type(urlInput, 'http://a.test/ipn')
    await user.type(screen.getByLabelText(/Lý do thay đổi/), 'Đổi URL')
    await user.click(screen.getByRole('button', { name: /Lưu cấu hình/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'URL phải dùng https'
    )
    expect(challenged).toBe(false)
  })
})
