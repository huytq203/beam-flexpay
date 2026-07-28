import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { errorHandlers } from '@/test/mocks/handlers'
import ResetPassword from '../ResetPassword'

const ROUTE = '/secure-panel/auth/reset-password?token=abc123'

const renderScreen = () =>
  renderWithProviders(<ResetPassword />, { route: ROUTE })

const findPasswordInputs = async (): Promise<HTMLInputElement[]> =>
  (await screen.findAllByPlaceholderText(
    /mật khẩu mới/i
  )) as HTMLInputElement[]

describe('ResetPassword — form nhập mật khẩu', () => {
  beforeEach(() => {
    // Tầng fetch chung đọc `window.location.pathname` để biết đang ở khu vực auth
    // mà không chèn modal "hết phiên" — test phải đứng đúng đường dẫn thật.
    window.history.replaceState({}, '', ROUTE)
  })

  it('chỉ mở form sau khi token đã được xác thực', async () => {
    renderScreen()

    expect(
      screen.getByRole('heading', { name: 'Đang kiểm tra liên kết' })
    ).toBeInTheDocument()

    expect(await findPasswordInputs()).toHaveLength(2)
    expect(
      screen.getByRole('heading', { name: 'Đặt lại mật khẩu' })
    ).toBeInTheDocument()
  })

  it('tick dần từng điều kiện theo mật khẩu người dùng gõ', async () => {
    const user = userEvent.setup()
    renderScreen()
    const [password] = await findPasswordInputs()

    await user.type(password, 'beam')
    expect(screen.getByText('(1/5)')).toBeInTheDocument()

    await user.clear(password)
    await user.type(password, 'Beam@2026')
    expect(screen.getByText('(5/5)')).toBeInTheDocument()
    // Chưa nhập ô xác nhận thì chưa được báo khớp.
    expect(screen.queryByText(/hai lần nhập đã khớp/i)).not.toBeInTheDocument()
  })

  it('báo lỗi khi hai lần nhập không khớp', async () => {
    const user = userEvent.setup()
    renderScreen()
    const [password, confirmPassword] = await findPasswordInputs()

    await user.type(password, 'Beam@2026')
    await user.type(confirmPassword, 'Beam@2027')
    await user.click(screen.getByRole('button', { name: /đặt lại mật khẩu/i }))

    expect(
      await screen.findByText('Mật khẩu nhập lại không khớp')
    ).toBeInTheDocument()
  })

  it('xác nhận khớp thì hiện dấu hiệu khớp', async () => {
    const user = userEvent.setup()
    renderScreen()
    const [password, confirmPassword] = await findPasswordInputs()

    await user.type(password, 'Beam@2026')
    await user.type(confirmPassword, 'Beam@2026')

    expect(await screen.findByText(/hai lần nhập đã khớp/i)).toBeInTheDocument()
  })

  it('gửi thành công thì chuyển sang màn đã đặt lại', async () => {
    let requestBody: unknown
    server.use(
      http.post('*/auth/reset-password', async ({ request }) => {
        requestBody = await request.json()
        return HttpResponse.json({ data: null })
      })
    )
    const user = userEvent.setup()
    renderScreen()
    const [password, confirmPassword] = await findPasswordInputs()

    await user.type(password, 'Beam@2026')
    await user.type(confirmPassword, 'Beam@2026')
    await user.click(screen.getByRole('button', { name: /đặt lại mật khẩu/i }))

    expect(
      await screen.findByRole('heading', { name: 'Đã đặt lại mật khẩu' })
    ).toBeInTheDocument()
    expect(requestBody).toEqual({
      token: 'abc123',
      newPassword: 'Beam@2026',
      confirmPassword: 'Beam@2026'
    })
  })

  it('hiện message BE trả về khi gửi thất bại, không lộ raw error', async () => {
    server.use(errorHandlers.newPasswordFailed)
    const user = userEvent.setup()
    renderScreen()
    const [password, confirmPassword] = await findPasswordInputs()

    await user.type(password, 'Beam@2026')
    await user.type(confirmPassword, 'Beam@2026')
    await user.click(screen.getByRole('button', { name: /đặt lại mật khẩu/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Mật khẩu trùng mật khẩu cũ')
  })

  it('token hết hạn giữa chừng thì chuyển sang màn liên kết hỏng', async () => {
    server.use(errorHandlers.newPasswordExpired)
    const user = userEvent.setup()
    renderScreen()
    const [password, confirmPassword] = await findPasswordInputs()

    await user.type(password, 'Beam@2026')
    await user.type(confirmPassword, 'Beam@2026')
    await user.click(screen.getByRole('button', { name: /đặt lại mật khẩu/i }))

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Liên kết không còn hiệu lực' })
      ).toBeInTheDocument()
    )
  })
})
