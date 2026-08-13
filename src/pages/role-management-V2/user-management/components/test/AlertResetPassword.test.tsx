import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, delay } from 'msw'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import type { UserInfor } from '@type/userManagement'
import AlertResetPassword from '../AlertResetPassword'

const manager = {
  id: 'manager-1',
  username: 'nguyenvana',
  email: 'vana@beamewa.com.vn',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  phoneNumber: '0912345678',
  enabled: true,
  emailVerified: true,
  createdTimestamp: 1_786_300_000_000,
  createdAt: '2026-08-01T08:00:00',
  createdBy: 'root.admin',
  updatedAt: null,
  updatedBy: null,
  groups: []
} satisfies UserInfor

const renderDialog = () => {
  const onCancel = vi.fn()
  const onLoadingChange = vi.fn()

  renderWithProviders(
    <AlertResetPassword
      user={manager}
      onCancel={onCancel}
      onLoadingChange={onLoadingChange}
    />
  )

  return { onCancel, onLoadingChange, user: userEvent.setup() }
}

describe('AlertResetPassword', () => {
  it('gửi đúng endpoint và chỉ báo thành công bằng dữ liệu server trả về', async () => {
    let requestCount = 0
    server.use(
      http.post('*/users/managers/manager-1/reset-password', () => {
        requestCount += 1
        return HttpResponse.json({
          data: { maskedEmail: 'va***@beamewa.com.vn', expiresInHours: 24 }
        })
      })
    )
    const { onLoadingChange, user } = renderDialog()

    expect(screen.getByText('vana@beamewa.com.vn')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Gửi liên kết đặt lại' })
    )

    expect(
      await screen.findByText('Đã gửi liên kết đặt lại mật khẩu')
    ).toBeInTheDocument()
    expect(screen.getByText(/va\*\*\*@beamewa\.com\.vn/)).toBeInTheDocument()
    expect(screen.getByText(/24 giờ/)).toBeInTheDocument()
    expect(requestCount).toBe(1)
    expect(onLoadingChange).toHaveBeenNthCalledWith(1, true)
    expect(onLoadingChange).toHaveBeenLastCalledWith(false)
  })

  it('giữ modal ở bước xác nhận và hướng dẫn chờ khi bị rate limit', async () => {
    server.use(
      http.post('*/users/managers/manager-1/reset-password', () =>
        HttpResponse.json(
          {
            message: 'PASSWORD_RESET_RATE_LIMITED',
            detail: 'Đã yêu cầu quá nhiều lần'
          },
          { status: 429 }
        )
      )
    )
    const { user } = renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Gửi liên kết đặt lại' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Vui lòng chờ trước khi gửi lại'
    )
    expect(
      screen.getByRole('button', { name: 'Gửi liên kết đặt lại' })
    ).toBeEnabled()
  })

  it('khóa double-submit trong khi request đầu tiên chưa hoàn tất', async () => {
    let requestCount = 0
    server.use(
      http.post('*/users/managers/manager-1/reset-password', async () => {
        requestCount += 1
        await delay(80)
        return HttpResponse.json({
          data: { maskedEmail: 'va***@beamewa.com.vn', expiresInHours: 24 }
        })
      })
    )
    const { user } = renderDialog()
    const submit = screen.getByRole('button', {
      name: 'Gửi liên kết đặt lại'
    })

    await user.dblClick(submit)

    await waitFor(() => expect(requestCount).toBe(1))
    expect(
      await screen.findByText('Đã gửi liên kết đặt lại mật khẩu')
    ).toBeInTheDocument()
  })
})
