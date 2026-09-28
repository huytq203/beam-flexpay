import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { feedback } from '@components/index'
import { renderPage } from './merchantAccess.setup'

const permissions = [
  PERMISSION.MERCHANT_USER_VIEW,
  PERMISSION.MERCHANT_USER_RESET_PASSWORD
]

describe('đặt lại mật khẩu Merchant User', () => {
  it('chỉ hiện thao tác cho User đang hoạt động', async () => {
    server.use(
      http.get('*/merchant-users', () =>
        HttpResponse.json({
          data: {
            content: [
              {
                id: 'active',
                fullName: 'User Active',
                email: 'active@example.com',
                status: 'ACTIVE',
                merchantIds: []
              },
              {
                id: 'locked',
                fullName: 'User Locked',
                email: 'locked@example.com',
                status: 'LOCKED',
                merchantIds: []
              },
              {
                id: 'pending',
                fullName: 'User Pending',
                email: 'pending@example.com',
                status: 'PENDING',
                merchantIds: []
              }
            ],
            totalElements: 3,
            number: 0,
            size: 20
          }
        })
      )
    )
    renderPage('/secure-panel/merchant/user', permissions)
    expect(await screen.findByText('User Active')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Đặt lại mật khẩu User User Active' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'Đặt lại mật khẩu User User Locked'
      })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'Đặt lại mật khẩu User User Pending'
      })
    ).not.toBeInTheDocument()
  })

  it('báo đúng nguyên nhân khi User vừa chuyển khỏi trạng thái hoạt động', async () => {
    const feedbackSpy = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    server.use(
      http.post('*/merchant-users/user-1/reset-password', () =>
        HttpResponse.json(
          {
            message: 'DUPLICATE_FIELD_VALUE',
            detail: 'Merchant user must be active',
            success: false,
            status: '3006'
          },
          { status: 400 }
        )
      )
    )
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user', permissions)
    await user.click(
      await screen.findByRole('button', {
        name: 'Đặt lại mật khẩu User Nguyễn Văn Hải'
      })
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Xác nhận đặt lại mật khẩu'
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Gửi hướng dẫn' })
    )
    await waitFor(() =>
      expect(feedbackSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'chỉ có thể đặt lại mật khẩu cho User đang hoạt động'
        )
      )
    )
    expect(dialog).toBeInTheDocument()
    feedbackSpy.mockRestore()
  })
})
