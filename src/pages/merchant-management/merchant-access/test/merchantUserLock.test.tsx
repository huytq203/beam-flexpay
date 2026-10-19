import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderPage } from './merchantAccess.setup'

const permissions = [
  PERMISSION.MERCHANT_USER_VIEW,
  PERMISSION.MERCHANT_USER_LOCK
]

describe('khóa Merchant User', () => {
  it('lý do trống không gọi API', async () => {
    const user = userEvent.setup()
    let called = false
    server.use(
      http.post('*/merchant-users/user-1/lock', () => {
        called = true
        return HttpResponse.json({ data: {} })
      })
    )
    renderPage('/secure-panel/merchant/user', permissions)
    await user.click(
      await screen.findByRole('button', { name: 'Khóa User Nguyễn Văn Hải' })
    )
    const dialog = await screen.findByRole('dialog', { name: 'Khóa User' })
    await user.type(within(dialog).getByLabelText('Lý do khóa User'), '   ')
    await user.click(within(dialog).getByRole('button', { name: 'Khóa User' }))
    expect(called).toBe(false)
  })

  it('lý do đủ 10 ký tự gửi lên BE đã trim', async () => {
    const user = userEvent.setup()
    let body: unknown
    server.use(
      http.post('*/merchant-users/user-1/lock', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: {} })
      })
    )
    renderPage('/secure-panel/merchant/user', permissions)
    await user.click(
      await screen.findByRole('button', { name: 'Khóa User Nguyễn Văn Hải' })
    )
    const dialog = await screen.findByRole('dialog', { name: 'Khóa User' })
    await user.type(
      within(dialog).getByLabelText('Lý do khóa User'),
      '  Nghi ngờ gian lận  '
    )
    await user.click(within(dialog).getByRole('button', { name: 'Khóa User' }))
    await waitFor(() => expect(body).toEqual({ reason: 'Nghi ngờ gian lận' }))
  })
})
