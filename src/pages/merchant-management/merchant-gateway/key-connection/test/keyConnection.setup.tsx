import { screen, waitFor, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import KeyConnectionPage from '../pages/KeyConnectionPage'

export const MANAGE = [
  PERMISSION.API_CREDENTIAL_VIEW,
  PERMISSION.API_CREDENTIAL_MANAGE
]

export const ACTIVE_KEY = {
  id: 'key-1',
  merchantId: 'merchant-1',
  subMerchantId: null,
  authMode: 'HMAC_SHA256',
  clientId: 'client-public',
  name: 'Key sản xuất',
  status: 'ACTIVE',
  version: 2,
  rowRevision: 7,
  ipWhitelist: ['203.113.1.10']
}

export const CHALLENGE = {
  otpSessionId: 'otp-session-1',
  maskedRecipient: '09******89',
  expiresInSeconds: 300,
  canResendAfterSeconds: 60
}

/** BE trả 5731 khi lệnh không kèm OTP đã qua hết kiểm tra nghiệp vụ. */
export const otpRequired = () =>
  HttpResponse.json(
    {
      success: false,
      message: 'MERCHANT_SENSITIVE_OTP_REQUIRED',
      status: '5731',
      detail: 'Vui lòng xác thực OTP'
    },
    { status: 400 }
  )

export const apiError = (message: string, detail: string, status = 400) =>
  HttpResponse.json(
    { success: false, message, status: '0', detail },
    { status }
  )

/** Body không kèm `sensitiveOtp` là lần gửi thử kiểm tra nghiệp vụ. */
export const hasOtp = (body: unknown): boolean =>
  typeof body === 'object' && body !== null && 'sensitiveOtp' in body

export const installBaseHandlers = () =>
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: {
          content: [{ id: 'merchant-1', code: 'M001', name: 'Merchant A' }],
          totalElements: 1,
          number: 0,
          size: 100
        }
      })
    ),
    http.get('*/merchant-api-credentials', () =>
      HttpResponse.json({
        data: { content: [ACTIVE_KEY], totalElements: 1, number: 0, size: 20 }
      })
    ),
    http.get('*/merchant-api-credentials/:id', () =>
      HttpResponse.json({ data: ACTIVE_KEY })
    )
  )

export const renderPage = (permissions: string[] = MANAGE) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(<KeyConnectionPage />, { store })
}

/**
 * Trong test mọi modal antd dùng chung id tiêu đề nên tên truy cập của dialog
 * thứ hai trùng dialog đầu; tìm dialog qua tiêu đề hiển thị.
 */
export const findDialog = async (title: string): Promise<HTMLElement> => {
  const heading = await screen.findByText(title, {
    selector: '.ant-modal-title'
  })
  const dialog = heading.closest<HTMLElement>('[role="dialog"]')
  if (!dialog) throw new Error(`Không thấy dialog ${title}`)
  return dialog
}

/** Nhập mã vào hộp thoại OTP đang mở và bấm Xác nhận. */
export const submitOtp = async (user: UserEvent, code: string) => {
  const dialog = await findDialog('Xác nhận bằng OTP')
  expect(within(dialog).getByText('09******89')).toBeInTheDocument()
  const input = within(dialog).getByLabelText('Mã OTP')
  await user.clear(input)
  await user.type(input, code)
  // Tên nút có thể còn tiền tố 'loading' do animation antd không kết thúc trong jsdom.
  await user.click(
    await within(dialog).findByRole('button', { name: /Xác nhận$/ })
  )
  return dialog
}

export const openDetail = async (user: UserEvent) => {
  await screen.findByText('client-public')
  await user.click(screen.getByRole('button', { name: 'Xem chi tiết' }))
  await waitFor(() =>
    expect(screen.getAllByText('Chi tiết key kết nối').length).toBeGreaterThan(
      0
    )
  )
}
