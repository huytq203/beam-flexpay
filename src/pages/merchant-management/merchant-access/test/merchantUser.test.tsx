import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { roleAvailableToUser } from '../utils/merchantAccess.utils'
import { renderPage } from './merchantAccess.setup'

describe('Merchant User', () => {
  it('lọc User theo tên và chỉ hiện thao tác xem với quyền xem', async () => {
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user', [PERMISSION.MERCHANT_USER_VIEW])

    await user.type(screen.getByLabelText('Từ khóa'), 'Nguyễn Văn Hải{Enter}')

    expect(await screen.findByText('Nguyễn Văn Hải')).toBeInTheDocument()
    expect(screen.queryByText('Lê Thị Mai')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Xem User Nguyễn Văn Hải')).toBeInTheDocument()
    expect(screen.queryByLabelText('Sửa User Nguyễn Văn Hải')).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Làm mới dữ liệu' })
    ).toBeInTheDocument()
    expect(screen.queryByText(/Đang hiển thị User/)).toBeNull()
  })

  it('mở form thêm User bằng form wrapper và hiển thị validation', async () => {
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user')

    await user.click(screen.getByRole('button', { name: 'Thêm mới User' }))
    const dialog = screen.getByRole('dialog', { name: 'Thêm mới User' })
    await user.click(within(dialog).getByRole('button', { name: 'Thêm User' }))

    expect(
      await within(dialog).findByText('Vui lòng nhập họ tên')
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('Vui lòng chọn ít nhất một Merchant')
    ).toBeInTheDocument()
  })

  it('xác nhận đặt lại mật khẩu qua API với quyền riêng', async () => {
    const user = userEvent.setup()
    let resetCalled = false
    server.use(
      http.post('*/merchant-users/user-1/reset-password', () => {
        resetCalled = true
        return HttpResponse.json({ data: { id: 'user-1' } })
      })
    )
    renderPage('/secure-panel/merchant/user', [
      PERMISSION.MERCHANT_USER_VIEW,
      PERMISSION.MERCHANT_USER_RESET_PASSWORD
    ])

    await screen.findByText('Nguyễn Văn Hải')
    await user.click(
      screen.getByRole('button', {
        name: 'Đặt lại mật khẩu User Nguyễn Văn Hải'
      })
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Xác nhận đặt lại mật khẩu'
    })
    expect(within(dialog).getByText(/Highlands Coffee/)).toBeInTheDocument()
    await user.click(
      within(dialog).getByRole('button', { name: 'Gửi hướng dẫn' })
    )
    await waitFor(() => expect(resetCalled).toBe(true))
  })
})

describe('quy tắc dữ liệu phân quyền', () => {
  it('chỉ cho User nhiều Merchant dùng nhóm chung', () => {
    const user = {
      id: 'user-6',
      name: 'User',
      email: 'user@example.com',
      phone: '',
      merchantIds: ['one', 'two'],
      subMerchantIds: [],
      roleIds: [],
      status: 'ACTIVE' as const,
      lastLogin: null,
      createdAt: ''
    }
    const group = {
      id: 'role-admin',
      name: 'Quản trị',
      description: '',
      merchantId: 'one',
      permissions: [],
      createdBy: '',
      createdAt: ''
    }
    expect(roleAvailableToUser(group, user)).toBe(false)
    expect(roleAvailableToUser({ ...group, merchantId: null }, user)).toBe(true)
  })
})
