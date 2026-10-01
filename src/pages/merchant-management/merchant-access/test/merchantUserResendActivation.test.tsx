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
  PERMISSION.MERCHANT_USER_CREATE
]

const usersResponse = () =>
  HttpResponse.json({
    data: {
      content: [
        {
          id: 'pending',
          fullName: 'User Pending',
          email: 'pending@example.com',
          status: 'PENDING',
          merchantIds: []
        },
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
        }
      ],
      totalElements: 3,
      number: 0,
      size: 20
    }
  })

const resendLabel = (name: string) => `Gửi lại liên kết kích hoạt User ${name}`

describe('gửi lại liên kết kích hoạt Merchant User', () => {
  it('chỉ hiện thao tác cho User đang chờ kích hoạt khi có quyền tạo', async () => {
    server.use(http.get('*/merchant-users', usersResponse))
    renderPage('/secure-panel/merchant/user', permissions)
    expect(await screen.findByText('User Pending')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: resendLabel('User Pending') })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: resendLabel('User Active') })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: resendLabel('User Locked') })
    ).not.toBeInTheDocument()
  })

  it('không hiện thao tác khi thiếu quyền tạo', async () => {
    server.use(http.get('*/merchant-users', usersResponse))
    renderPage('/secure-panel/merchant/user', [PERMISSION.MERCHANT_USER_VIEW])
    expect(await screen.findByText('User Pending')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: resendLabel('User Pending') })
    ).not.toBeInTheDocument()
  })

  it('xác nhận gọi đúng API và báo đã tiếp nhận', async () => {
    const successSpy = vi
      .spyOn(feedback, 'success')
      .mockImplementation(() => {})
    const resendCalled = vi.fn()
    server.use(
      http.get('*/merchant-users', usersResponse),
      http.post('*/merchant-users/pending/resend-activation', () => {
        resendCalled()
        return HttpResponse.json({
          data: {
            id: 'pending',
            fullName: 'User Pending',
            email: 'pending@example.com',
            status: 'PENDING'
          }
        })
      })
    )
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user', permissions)
    await user.click(
      await screen.findByRole('button', { name: resendLabel('User Pending') })
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Xác nhận gửi lại liên kết kích hoạt'
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Gửi liên kết' })
    )
    await waitFor(() => expect(resendCalled).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(successSpy).toHaveBeenCalledWith(
        expect.stringContaining('Đã tiếp nhận yêu cầu gửi lại liên kết')
      )
    )
    successSpy.mockRestore()
  })

  it('báo đúng nguyên nhân khi User không còn chờ kích hoạt', async () => {
    const errorSpy = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    server.use(
      http.get('*/merchant-users', usersResponse),
      http.post('*/merchant-users/pending/resend-activation', () =>
        HttpResponse.json(
          {
            message: 'DUPLICATE_FIELD_VALUE',
            detail: 'Activation can only be resent for a pending user',
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
      await screen.findByRole('button', { name: resendLabel('User Pending') })
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Xác nhận gửi lại liên kết kích hoạt'
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Gửi liên kết' })
    )
    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'chỉ có thể gửi lại liên kết kích hoạt cho User đang chờ kích hoạt'
        )
      )
    )
    expect(dialog).toBeInTheDocument()
    errorSpy.mockRestore()
  })
})
