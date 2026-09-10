import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MessageProvider } from '@/app/hooks/useMessage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import DialogEditUser from '../DialogEditUser'

const roleOptions = [
  { value: 'role-accountant-id', label: 'Tài khoản kế toán' },
  { value: 'role-operator-id', label: 'Tài khoản tổ chức' }
]

const registerDetailHandlers = (): void => {
  server.use(
    http.get('*/users/managers/user-1', () =>
      HttpResponse.json({
        success: true,
        data: {
          id: 'user-1',
          username: 'nguyenvana',
          email: 'vana@beamewa.com.vn',
          firstName: 'Nguyen',
          lastName: 'Van A',
          phoneNumber: '0912345678',
          enabled: true,
          emailVerified: true,
          groups: ['ACCOUNTANT']
        }
      })
    ),
    http.get('*/users/user-1/roles', () =>
      HttpResponse.json({
        success: true,
        data: [{ id: 'role-accountant-id', name: 'ACCOUNTANT' }]
      })
    )
  )
}

const renderDialog = () => {
  const onSuccess = vi.fn()
  const onCancel = vi.fn()
  const onLoadingChange = vi.fn()

  renderWithProviders(
    <MessageProvider>
      <DialogEditUser
        userId='user-1'
        roleOptions={roleOptions}
        onSuccess={onSuccess}
        onCancel={onCancel}
        onLoadingChange={onLoadingChange}
      />
    </MessageProvider>
  )

  return {
    onSuccess,
    onCancel,
    onLoadingChange,
    user: userEvent.setup()
  }
}

describe('DialogEditUser', () => {
  it(
    'tải dữ liệu hiện tại và gửi PUT với danh sách role cuối cùng',
    async () => {
      registerDetailHandlers()
      let requestBody: unknown
      server.use(
        http.put('*/users/managers/user-1', async ({ request }) => {
          requestBody = await request.json()
          return HttpResponse.json({
            success: true,
            data: { id: 'user-1', username: 'nguyenvana' }
          })
        })
      )
      const { onSuccess, onLoadingChange, user } = renderDialog()

      expect(await screen.findByText('nguyenvana')).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/)).toHaveValue('vana@beamewa.com.vn')
      expect(screen.getByLabelText(/^Họ/)).toHaveValue('Nguyen')
      expect(screen.getByText('Tài khoản kế toán')).toBeInTheDocument()

      await user.clear(screen.getByLabelText(/Email/))
      await user.type(screen.getByLabelText(/Email/), 'VAN.A@BEAM.VN')
      await user.clear(screen.getByLabelText(/^Họ/))
      await user.type(screen.getByLabelText(/^Họ/), 'Nguyễn')
      await user.click(screen.getByLabelText('Nhóm quyền'))
      await user.click(await screen.findByTitle('Tài khoản tổ chức'))
      await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
      expect(requestBody).toEqual({
        email: 'van.a@beam.vn',
        firstName: 'Nguyễn',
        lastName: 'Van A',
        phoneNumber: '0912345678',
        enabled: true,
        roleIds: ['role-accountant-id', 'role-operator-id']
      })
      expect(onLoadingChange).toHaveBeenNthCalledWith(1, true)
      expect(onLoadingChange).toHaveBeenLastCalledWith(false)
    },
    10_000
  )

  it('chặn submit khi số điện thoại không hợp lệ', async () => {
    registerDetailHandlers()
    let requestCount = 0
    server.use(
      http.put('*/users/managers/user-1', () => {
        requestCount += 1
        return HttpResponse.json({ data: null })
      })
    )
    const { user } = renderDialog()

    const phoneInput = await screen.findByLabelText(/Số điện thoại/)
    await user.clear(phoneInput)
    await user.type(phoneInput, '12345')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(
      await screen.findByText('Số điện thoại không đúng định dạng')
    ).toBeInTheDocument()
    expect(requestCount).toBe(0)
  })

  it('chặn submit khi email không hợp lệ', async () => {
    registerDetailHandlers()
    let requestCount = 0
    server.use(
      http.put('*/users/managers/user-1', () => {
        requestCount += 1
        return HttpResponse.json({ data: null })
      })
    )
    const { user } = renderDialog()

    const emailInput = await screen.findByLabelText(/Email/)
    await user.clear(emailInput)
    await user.type(emailInput, 'email-khong-hop-le')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText('Email không đúng định dạng')).toBeInTheDocument()
    expect(requestCount).toBe(0)
  })

  it('giữ dữ liệu và hiển thị lý do khi API từ chối tự sửa tài khoản', async () => {
    registerDetailHandlers()
    server.use(
      http.put('*/users/managers/user-1', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'FORBIDDEN',
            detail: 'Không thể chỉnh sửa tài khoản của chính mình'
          },
          { status: 403 }
        )
      )
    )
    const { onSuccess, user } = renderDialog()

    const firstNameInput = await screen.findByLabelText(/^Họ/)
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Tên mới')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(
      await screen.findAllByText('Không thể chỉnh sửa tài khoản của chính mình')
    ).not.toHaveLength(0)
    expect(firstNameInput).toHaveValue('Tên mới')
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
