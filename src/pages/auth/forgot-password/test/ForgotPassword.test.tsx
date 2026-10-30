import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { errorHandlers } from '@/test/mocks/handlers'
import ForgotPassword from '../ForgotPassword'

const ROUTE = '/secure-panel/auth/forgot-password'

const renderScreen = () =>
  renderWithProviders(<ForgotPassword />, { route: ROUTE })

describe('ForgotPassword', () => {
  beforeEach(() => {
    window.grecaptcha = {
      ready: (callback) => callback(),
      execute: () => Promise.resolve('captcha-token')
    }
  })

  it('chuẩn hoá email, gửi kèm captcha và luôn hiện trạng thái trung tính', async () => {
    let requestBody: unknown
    let captchaAction: string | undefined
    window.grecaptcha = {
      ready: (callback) => callback(),
      execute: (_siteKey, { action }) => {
        captchaAction = action
        return Promise.resolve('captcha-token')
      }
    }
    server.use(
      http.post('*/auth/forgot-password', async ({ request }) => {
        requestBody = await request.json()
        return HttpResponse.json({ data: null })
      })
    )
    const user = userEvent.setup()
    renderScreen()

    await user.type(
      screen.getByRole('textbox', { name: 'Email tài khoản' }),
      '  ADMIN@FlexPay.VN  '
    )
    await user.click(
      screen.getByRole('button', { name: 'Gửi liên kết đặt lại' })
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Kiểm tra hộp thư của bạn'
      })
    ).toBeInTheDocument()
    expect(requestBody).toEqual({
      email: 'admin@flexpay.vn',
      captchaToken: 'captcha-token'
    })
    expect(captchaAction).toBe('forgot_password')
    expect(
      screen.getByText(/nếu email khớp với tài khoản đã đăng ký/i)
    ).toBeInTheDocument()
  })

  it('không gọi API khi email sai định dạng', async () => {
    let requestCount = 0
    server.use(
      http.post('*/auth/forgot-password', () => {
        requestCount += 1
        return HttpResponse.json({ data: null })
      })
    )
    const user = userEvent.setup()
    renderScreen()

    await user.type(
      screen.getByRole('textbox', { name: 'Email tài khoản' }),
      'email-khong-hop-le'
    )
    await user.click(
      screen.getByRole('button', { name: 'Gửi liên kết đặt lại' })
    )

    expect(
      await screen.findByText('Vui lòng nhập đúng định dạng email')
    ).toBeInTheDocument()
    expect(requestCount).toBe(0)
  })

  it('hiện thông báo riêng khi yêu cầu quá nhiều lần', async () => {
    server.use(errorHandlers.forgotPasswordRateLimited)
    const user = userEvent.setup()
    renderScreen()

    await user.type(
      screen.getByRole('textbox', { name: 'Email tài khoản' }),
      'admin@flexpay.vn'
    )
    await user.click(
      screen.getByRole('button', { name: 'Gửi liên kết đặt lại' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.'
    )
  })

  it('hiện lỗi kết nối dễ hiểu và giữ nguyên form để thử lại', async () => {
    server.use(errorHandlers.forgotPasswordOffline)
    const user = userEvent.setup()
    renderScreen()

    await user.type(
      screen.getByRole('textbox', { name: 'Email tài khoản' }),
      'admin@flexpay.vn'
    )
    await user.click(
      screen.getByRole('button', { name: 'Gửi liên kết đặt lại' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi thử lại.'
    )
    expect(
      screen.getByRole('textbox', { name: 'Email tài khoản' })
    ).toHaveValue('admin@flexpay.vn')
  })

  it('không gọi API khi không lấy được captcha', async () => {
    let requestCount = 0
    server.use(
      http.post('*/auth/forgot-password', () => {
        requestCount += 1
        return HttpResponse.json({ data: null })
      })
    )
    window.grecaptcha = {
      ready: (callback) => callback(),
      execute: () => Promise.reject(new Error('blocked'))
    }
    const user = userEvent.setup()
    renderScreen()

    await user.type(
      screen.getByRole('textbox', { name: 'Email tài khoản' }),
      'admin@flexpay.vn'
    )
    await user.click(
      screen.getByRole('button', { name: 'Gửi liên kết đặt lại' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không xác thực được Captcha. Vui lòng tải lại trang rồi thử lại.'
    )
    expect(requestCount).toBe(0)
  })

  it('hiện thông báo captcha khi BE từ chối token', async () => {
    server.use(errorHandlers.forgotPasswordCaptchaInvalid)
    const user = userEvent.setup()
    renderScreen()

    await user.type(
      screen.getByRole('textbox', { name: 'Email tài khoản' }),
      'admin@flexpay.vn'
    )
    await user.click(
      screen.getByRole('button', { name: 'Gửi liên kết đặt lại' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không xác thực được Captcha. Vui lòng tải lại trang rồi thử lại.'
    )
  })
})
