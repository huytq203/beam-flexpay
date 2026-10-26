import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import {
  CHALLENGE,
  findDialog,
  hasOtp,
  installBaseHandlers,
  openDetail,
  otpRequired,
  renderPage,
  submitOtp
} from './keyConnection.setup'

vi.mock('@utils/file-download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@utils/file-download')>()),
  saveBlobAsFile: vi.fn().mockResolvedValue(undefined)
}))

afterEach(() => sessionStorage.clear())
beforeEach(() => installBaseHandlers())

const historyRow = (index: number) => ({
  id: `h-${index}`,
  credentialVersion: 2,
  authMode: 'HMAC_SHA256',
  sourceIp: '203.113.1.10',
  requestId: `req-${index}`,
  requestTimestamp: '2026-10-22T14:20:30',
  verificationResult: index === 0 ? 'VERIFIED' : 'STALE_TIMESTAMP',
  verifiedAt: '2026-10-22T14:20:31.123456'
})

describe('Key kết nối — chi tiết, IP Whitelist, lịch sử chữ ký, xuất CSV', () => {
  it('sửa IP Whitelist gửi cả danh sách mới, expectedRevision, lý do và OTP', async () => {
    const user = userEvent.setup()
    const putBodies: unknown[] = []
    let challengeBody: unknown
    server.use(
      http.post(
        '*/merchant-api-credentials/key-1/otp-challenge',
        async ({ request }) => {
          challengeBody = await request.json()
          return HttpResponse.json({ data: CHALLENGE })
        }
      ),
      http.put(
        '*/merchant-api-credentials/key-1/ip-whitelist',
        async ({ request }) => {
          const body = await request.json()
          putBodies.push(body)
          if (!hasOtp(body)) return otpRequired()
          return HttpResponse.json({ data: { id: 'key-1' } })
        }
      )
    )
    renderPage()
    await openDetail(user)
    await user.click(
      await screen.findByRole('button', { name: 'Sửa IP Whitelist' })
    )
    const dialog = await findDialog('Sửa IP Whitelist')
    const list = within(dialog).getByLabelText('Danh sách IP / dải CIDR')
    expect(list).toHaveValue('203.113.1.10')
    await user.clear(list)
    await user.type(list, '10.0.0.1{Enter}10.0.1.0/24')
    await user.type(
      within(dialog).getByLabelText(/Lý do thay đổi/),
      'Đổi máy chủ'
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Lưu IP Whitelist' })
    )
    await submitOtp(user, '654321')
    await waitFor(() => expect(putBodies).toHaveLength(2))
    const expected = {
      ipWhitelist: ['10.0.0.1', '10.0.1.0/24'],
      reason: 'Đổi máy chủ',
      expectedRevision: 7
    }
    expect(challengeBody).toEqual({ action: 'IP_WHITELIST', ...expected })
    expect(putBodies).toEqual([
      expected,
      {
        ...expected,
        sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '654321' }
      }
    ])
  })

  it('lịch sử chữ ký dùng page tính từ 0 và đánh số # theo trang', async () => {
    const user = userEvent.setup()
    const pages: (string | null)[] = []
    server.use(
      http.get(
        '*/merchant-api-credentials/key-1/signature-history',
        ({ request }) => {
          const params = new URL(request.url).searchParams
          pages.push(params.get('page'))
          const page = Number(params.get('page'))
          return HttpResponse.json({
            data: {
              content: [historyRow(page * 10)],
              totalElements: 25,
              number: page,
              size: Number(params.get('size'))
            }
          })
        }
      )
    )
    renderPage()
    await openDetail(user)
    await user.click(
      await screen.findByRole('tab', { name: 'Lịch sử xác thực chữ ký' })
    )
    expect(await screen.findByText('req-0')).toBeInTheDocument()
    expect(screen.getByText('Hợp lệ')).toBeInTheDocument()
    expect(pages).toEqual(['0'])
    await user.click(screen.getByTitle('2'))
    expect(await screen.findByText('req-10')).toBeInTheDocument()
    expect(screen.getByText('Timestamp quá hạn')).toBeInTheDocument()
    expect(pages).toEqual(['0', '1'])
    const row = screen.getByText('req-10').closest('tr')
    expect(within(row!).getByText('11')).toBeInTheDocument()
  })

  it('xuất CSV theo bộ lọc hiện tại, không gửi page/size', async () => {
    const user = userEvent.setup()
    let url: URL | undefined
    server.use(
      http.get('*/merchant-api-credentials/export', ({ request }) => {
        url = new URL(request.url)
        return new HttpResponse('"a"', {
          headers: { 'Content-Type': 'text/csv;charset=UTF-8' }
        })
      })
    )
    renderPage([PERMISSION.API_CREDENTIAL_VIEW])
    await screen.findByText('client-public')
    await user.click(screen.getByRole('button', { name: /Xuất CSV/ }))
    await waitFor(() => expect(url).toBeDefined())
    expect(Object.fromEntries(url?.searchParams ?? [])).toEqual({})
  })

  it('kiểm tra chữ ký với khóa đang lưu và nhắc PASS không miễn kiểm tra IP', async () => {
    const user = userEvent.setup()
    let body: unknown
    server.use(
      http.post(
        '*/merchant-api-credentials/key-1/verify-signature',
        async ({ request }) => {
          body = await request.json()
          return HttpResponse.json({
            data: { verified: true, result: 'VALID', authMode: 'HMAC_SHA256' }
          })
        }
      )
    )
    renderPage()
    await openDetail(user)
    await user.click(
      await screen.findByRole('tab', { name: 'Kiểm tra chữ ký' })
    )
    await user.type(
      screen.getByLabelText('Chuỗi ký (canonical request)'),
      'accessKey=client-public'
    )
    await user.type(screen.getByLabelText('Chữ ký'), 'sig')
    await user.click(screen.getByRole('button', { name: 'Kiểm tra chữ ký' }))
    expect(await screen.findByText('Chữ ký hợp lệ')).toBeInTheDocument()
    expect(body).toEqual({
      authMode: 'HMAC_SHA256',
      canonicalRequest: 'accessKey=client-public',
      signature: 'sig'
    })
    expect(screen.getByText(/chống phát lại/)).toBeInTheDocument()
  })
})
