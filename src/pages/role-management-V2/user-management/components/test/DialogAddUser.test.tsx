import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MessageProvider } from '@/app/hooks/useMessage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import DialogAddUser from '../DialogAddUser'
import { CREATE_ADMIN_USER_FORM_ID } from '../../constants/userAccount'

const roleOptions = [
  { value: 'role-accountant-id', label: 'Tài khoản kế toán' }
]

const renderDialog = () => {
  const onSuccess = vi.fn()

  renderWithProviders(
    <MessageProvider>
      <DialogAddUser
        roleOptions={roleOptions}
        onSuccess={onSuccess}
      />
      <button
        type='submit'
        form={CREATE_ADMIN_USER_FORM_ID}
      >
        Tạo tài khoản
      </button>
    </MessageProvider>
  )

  return { onSuccess, user: userEvent.setup() }
}

const fillValidForm = async (
  user: ReturnType<typeof userEvent.setup>
): Promise<void> => {
  await user.type(screen.getByLabelText(/Tên đăng nhập/), 'NGUYENVANA')
  await user.type(screen.getByLabelText(/Email/), 'VANA@BEAMEWA.COM.VN')
  await user.type(screen.getByLabelText(/^Họ/), 'Nguyen')
  await user.type(screen.getByLabelText(/Tên đệm và tên/), 'Van A')
  await user.type(screen.getByLabelText(/Số điện thoại/), '0912345678')
  await user.click(screen.getByLabelText('Nhóm quyền'))
  await user.click(await screen.findByTitle('Tài khoản kế toán'))
}

describe('DialogAddUser', () => {
  it('gọi đúng API create manager với payload đã chuẩn hóa và role ID', async () => {
    let requestBody: unknown
    server.use(
      http.post('*/users/managers', async ({ request }) => {
        requestBody = await request.json()
        return HttpResponse.json(
          {
            success: true,
            data: { id: 'user-1', username: 'nguyenvana' }
          },
          { status: 201 }
        )
      })
    )
    const { onSuccess, user } = renderDialog()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(requestBody).toEqual({
      username: 'nguyenvana',
      email: 'vana@beamewa.com.vn',
      firstName: 'Nguyen',
      lastName: 'Van A',
      enabled: true,
      phoneNumber: '0912345678',
      roleIds: ['role-accountant-id']
    })
  })

  it('hiện validation cạnh field và không gọi API khi form rỗng', async () => {
    let requestCount = 0
    server.use(
      http.post('*/users/managers', () => {
        requestCount += 1
        return HttpResponse.json({ data: null }, { status: 201 })
      })
    )
    const { user } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(await screen.findByText('Tên đăng nhập là bắt buộc')).toBeInTheDocument()
    expect(screen.getByText('Email là bắt buộc')).toBeInTheDocument()
    expect(screen.getByText('Số điện thoại là bắt buộc')).toBeInTheDocument()
    expect(requestCount).toBe(0)
  })

  it('giữ dữ liệu và modal mở khi API từ chối tài khoản trùng', async () => {
    server.use(
      http.post('*/users/managers', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'AUTH_USER_EXISTS',
            detail: 'Tên đăng nhập đã tồn tại'
          },
          { status: 409 }
        )
      )
    )
    const { onSuccess, user } = renderDialog()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(await screen.findByText('Tên đăng nhập đã tồn tại')).toBeInTheDocument()
    expect(screen.getByLabelText(/Tên đăng nhập/)).toHaveValue('NGUYENVANA')
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
