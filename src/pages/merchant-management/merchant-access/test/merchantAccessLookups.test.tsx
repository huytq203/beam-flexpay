import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { renderPage } from './merchantAccess.setup'

const countRequests = () => {
  const counts = { merchants: 0, subMerchants: 0, permissions: 0 }
  server.use(
    http.get('*/merchants', ({ request }) => {
      if (new URL(request.url).searchParams.get('size') === '100')
        counts.merchants += 1
      return undefined
    }),
    http.get('*/sub-merchants', ({ request }) => {
      if (new URL(request.url).searchParams.get('size') === '100')
        counts.subMerchants += 1
      return undefined
    }),
    http.get('*/merchant-permissions', () => {
      counts.permissions += 1
      return undefined
    })
  )
  return counts
}

describe('Tra cứu dùng chung của màn quyền Merchant', () => {
  it('màn User không tải danh mục quyền và mở modal không gọi lại API tra cứu', async () => {
    const user = userEvent.setup()
    const counts = countRequests()
    renderPage('/secure-panel/merchant/user')

    expect(await screen.findByText('Nguyễn Văn Hải')).toBeInTheDocument()
    await waitFor(() => expect(counts.merchants).toBe(1))
    expect(counts.subMerchants).toBe(1)

    await user.click(screen.getByRole('button', { name: 'Thêm mới User' }))
    await screen.findByText('Thêm mới User', { selector: '.ant-modal-title' })

    expect(counts.merchants).toBe(1)
    expect(counts.subMerchants).toBe(1)
    expect(counts.permissions).toBe(0)
  })

  it('màn Nhóm quyền không tải danh sách 100 Merchant, Sub-merchant hay User', async () => {
    const counts = countRequests()
    let userListRequests = 0
    server.use(
      http.get('*/merchant-users', () => {
        userListRequests += 1
        return undefined
      })
    )
    renderPage('/secure-panel/merchant/user-role')

    expect(
      await screen.findByRole('button', { name: 'Quản trị Merchant' })
    ).toBeInTheDocument()
    expect(
      (await screen.findAllByText('Highlands Coffee')).length
    ).toBeGreaterThan(0)
    expect(counts.merchants).toBe(0)
    expect(counts.subMerchants).toBe(0)
    expect(userListRequests).toBe(0)
  })
})
