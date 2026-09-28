import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MessageProvider } from '@hooks/MessageProvider'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { errorHandlers } from '@/test/mocks/handlers'
import { EmployeePassword } from '../EmployeePassword'

const fillValidForm = async (user: UserEvent): Promise<void> => {
  await user.type(
    screen.getByLabelText('Mật khẩu hiện tại'),
    'OldPass@2025'
  )
  await user.type(screen.getByLabelText('Mật khẩu mới'), 'NewPass@2026')
  await user.type(
    screen.getByLabelText('Nhập lại mật khẩu mới'),
    'NewPass@2026'
  )
}

const renderModal = (onClose = vi.fn()) => {
  renderWithProviders(
    <MessageProvider>
      <EmployeePassword
        open
        onClose={onClose}
      />
    </MessageProvider>
  )
  return onClose
}

describe('EmployeePassword', () => {
  it('chỉ gửi đúng ba field của API mới và đóng modal khi thành công', async () => {
    let requestBody: object | null = null
    server.use(
      http.post('*/auth/change-password', async ({ request }) => {
        const body = await request.json()
        if (body && typeof body === 'object') requestBody = body
        return HttpResponse.json({ data: null })
      })
    )
    const onClose = renderModal()

    expect(screen.queryByText('OTP')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cập nhật' })).toBeDisabled()

    const user = userEvent.setup()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Cập nhật' }))

    expect(requestBody).toEqual({
      oldPassword: 'OldPass@2025',
      newPassword: 'NewPass@2026',
      confirmPassword: 'NewPass@2026'
    })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('hiển thị checklist và không submit khi mật khẩu chưa đủ policy', async () => {
    let requestCount = 0
    server.use(
      http.post('*/auth/change-password', () => {
        requestCount += 1
        return HttpResponse.json({ data: null })
      })
    )
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText('Mật khẩu hiện tại'), 'OldPass@2025')
    await user.type(screen.getByLabelText('Mật khẩu mới'), 'weak')

    expect(await screen.findByText('1/5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cập nhật' })).toBeDisabled()
    expect(requestCount).toBe(0)
  })

  it('đưa lỗi 23010 về field mật khẩu hiện tại', async () => {
    server.use(errorHandlers.changePasswordCurrentIncorrect)
    const onClose = renderModal()

    const user = userEvent.setup()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Cập nhật' }))

    expect(
      await screen.findByText('Mật khẩu hiện tại không chính xác')
    ).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('hiển thị lỗi mạng trong modal và cho phép thử lại', async () => {
    server.use(errorHandlers.changePasswordOffline)
    renderModal()

    const user = userEvent.setup()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Cập nhật' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi thử lại.'
    )
    expect(screen.getByRole('button', { name: 'Cập nhật' })).toBeEnabled()
  })
})
