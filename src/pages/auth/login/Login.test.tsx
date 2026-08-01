import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { MessageProvider } from '@/app/hooks/useMessage'
import Login from './Login'

const LOGIN_ROUTE = '/secure-panel/auth/login'

const renderLogin = () =>
  renderWithProviders(
    <MessageProvider>
      <Login />
    </MessageProvider>,
    { route: LOGIN_ROUTE }
  )

const submitCredentials = async (): Promise<void> => {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('Tên đăng nhập'), 'admin')
  await user.type(screen.getByPlaceholderText('Mật khẩu'), 'Beam@2026')
  await user.click(screen.getByRole('button', { name: 'Đăng nhập' }))
}

describe('Login OTP compatibility', () => {
  beforeEach(() => {
    window.grecaptcha = {
      ready: (callback) => callback(),
      execute: () => Promise.resolve('captcha-token')
    }
  })

  it('BE mới chuyển sang bước OTP mà chưa điều hướng', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({
          data: {
            otpRequired: true,
            requestId: 'login-request-1',
            maskedRecipient: 'a***@flexpay.vn',
            expiresIn: 180,
            canResendAfter: 60,
            resendRemaining: 3
          }
        })
      )
    )
    renderLogin()

    await submitCredentials()

    expect(
      await screen.findByRole('heading', { name: 'Nhập mã xác thực' })
    ).toBeInTheDocument()
    expect(screen.getByText('a***@flexpay.vn')).toBeInTheDocument()
  })

  it('BE cũ có accessToken không mở bước OTP', async () => {
    let wasCalled = false
    const payload = window.btoa(
      JSON.stringify({ permissions: [], roles: [], email: '', name: '' })
    )
    server.use(
      http.post('*/auth/login', () => {
        wasCalled = true
        return HttpResponse.json({
          data: {
            accessToken: `header.${payload}.signature`,
            expiresIn: 300,
            refreshToken: 'refresh-token',
            refreshExpiresIn: 1800
          }
        })
      })
    )
    renderLogin()

    await submitCredentials()

    await waitFor(() => expect(wasCalled).toBe(true))
    expect(
      screen.queryByRole('heading', { name: 'Nhập mã xác thực' })
    ).not.toBeInTheDocument()
  })
})
