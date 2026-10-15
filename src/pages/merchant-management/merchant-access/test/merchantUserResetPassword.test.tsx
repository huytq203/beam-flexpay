import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { renderPage } from './merchantAccess.setup'

const permissions = [
  PERMISSION.MERCHANT_USER_VIEW,
  PERMISSION.MERCHANT_USER_RESET_PASSWORD
]

describe('đặt lại mật khẩu Merchant User', () => {
  it('hiện thao tác cho User ở mọi trạng thái (BE nhận reset cả khi khóa hoặc chờ kích hoạt)', async () => {
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
      screen.getByRole('button', {
        name: 'Đặt lại mật khẩu User User Locked'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Đặt lại mật khẩu User User Pending'
      })
    ).toBeInTheDocument()
  })
})
