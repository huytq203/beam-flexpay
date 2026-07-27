import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { errorHandlers } from '@/test/mocks/handlers'
import ResetPassword from '../ResetPassword'

// Kịch bản khi BE đã có API kiểm tra token — bật cờ để chạy trước các trạng thái đó.
vi.mock('./constants', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../constant/constants')>()),
  IS_TOKEN_VERIFY_ENABLED: true
}))

const BASE_PATH = '/secure-panel/auth/reset-password'

const renderAt = (search: string) => {
  window.history.replaceState({}, '', `${BASE_PATH}${search}`)
  return renderWithProviders(<ResetPassword />, {
    route: `${BASE_PATH}${search}`
  })
}

describe('ResetPassword — bước xác thực liên kết', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', BASE_PATH)
  })

  it('hiện trạng thái đang kiểm tra rồi mở form khi token hợp lệ', async () => {
    renderAt('?token=abc123')

    expect(
      screen.getByRole('heading', { name: 'Đang kiểm tra liên kết' })
    ).toBeInTheDocument()

    expect(
      await screen.findByRole('heading', { name: 'Đặt lại mật khẩu' })
    ).toBeInTheDocument()
  })

  it('token không hợp lệ thì báo liên kết hết hiệu lực', async () => {
    server.use(errorHandlers.verifyTokenInvalid)
    renderAt('?token=sai-be-bet')

    expect(
      await screen.findByRole('heading', {
        name: 'Liên kết không còn hiệu lực'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /yêu cầu liên kết mới/i })
    ).toBeInTheDocument()
  })

  it('URL thiếu token thì báo ngay, không cần gọi API', () => {
    renderAt('')

    expect(
      screen.getByRole('heading', { name: 'Liên kết không còn hiệu lực' })
    ).toBeInTheDocument()
  })

  it('mất kết nối thì nói rõ là lỗi máy chủ, không đổ cho liên kết', async () => {
    server.use(errorHandlers.verifyTokenOffline)
    renderAt('?token=abc123')

    expect(
      await screen.findByRole('heading', { name: 'Chưa kết nối được máy chủ' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument()
  })
})
