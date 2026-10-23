import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import {
  renderAssignDialog,
  renderRemoveDialog
} from './merchantAssignment.setup'

vi.setConfig({ testTimeout: 30000 })

describe('gỡ Sales phụ trách', () => {
  it('chặn lý do trống và không gọi BE (BE trả 500 nếu thiếu reason)', async () => {
    const user = userEvent.setup()
    let called = false
    server.use(
      http.delete('*/merchants/m1/assignments/u-sales-1', () => {
        called = true
        return HttpResponse.json({ success: true })
      })
    )
    renderRemoveDialog()
    const dialog = await screen.findByRole('dialog', {
      name: 'Gỡ Sales phụ trách'
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Gỡ phụ trách' })
    )
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Lý do không được để trống'
    )
    expect(called).toBe(false)
  })

  it('gửi reason qua query param, không có body, rồi đóng hộp thoại', async () => {
    const user = userEvent.setup()
    let search = ''
    let body = 'chưa gọi'
    const onClose = vi.fn()
    server.use(
      http.delete(
        '*/merchants/m1/assignments/u-sales-1',
        async ({ request }) => {
          search = new URL(request.url).search
          body = await request.text()
          return HttpResponse.json({ success: true, message: 'success' })
        }
      )
    )
    renderRemoveDialog(onClose)
    const dialog = await screen.findByRole('dialog', {
      name: 'Gỡ Sales phụ trách'
    })
    await user.type(within(dialog).getByLabelText(/Lý do/), 'Chuyển khu vực')
    await user.click(
      within(dialog).getByRole('button', { name: 'Gỡ phụ trách' })
    )
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(new URLSearchParams(search).get('reason')).toBe('Chuyển khu vực')
    expect(body).toBe('')
  })

  it('giữ hộp thoại mở và báo detail khi BE từ chối (403)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    server.use(
      http.delete('*/merchants/m1/assignments/u-sales-1', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'ADMIN_PERMISSION_DENIED',
            detail: 'Chỉ Super Admin và Admin mới được gán Sales phụ trách',
            status: '6101'
          },
          { status: 403 }
        )
      )
    )
    renderRemoveDialog(onClose)
    const dialog = await screen.findByRole('dialog', {
      name: 'Gỡ Sales phụ trách'
    })
    await user.type(within(dialog).getByLabelText(/Lý do/), 'Thử')
    await user.click(
      within(dialog).getByRole('button', { name: 'Gỡ phụ trách' })
    )
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Chỉ Super Admin và Admin'
    )
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('gán Sales phụ trách', () => {
  const pickAdmin = async (
    user: ReturnType<typeof userEvent.setup>,
    name: string
  ) => {
    await user.click(screen.getByLabelText(/Người phụ trách/))
    await user.click(await screen.findByLabelText(`Chọn người dùng ${name}`))
  }

  it('chọn từ danh bạ admin và gửi đúng adminUserId, reason', async () => {
    const user = userEvent.setup()
    let body: unknown
    const onClose = vi.fn()
    server.use(
      http.post('*/merchants/m1/assignments', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({
          data: {
            adminUserId: 'u-sales-2',
            assignedAt: '2026-10-22T10:15:30',
            assignedBy: 'u-admin'
          },
          success: true
        })
      })
    )
    renderAssignDialog(onClose)
    await pickAdmin(user, 'Trần Bình')
    await user.type(screen.getByLabelText(/Lý do/), 'Phụ trách HCM')
    await user.click(
      screen.getByRole('button', {
        name: 'Gán phụ trách',
        hidden: true
      })
    )
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(body).toEqual({ adminUserId: 'u-sales-2', reason: 'Phụ trách HCM' })
  })

  it('chặn gán lại người đã có dòng gán trực tiếp', async () => {
    const user = userEvent.setup()
    let called = false
    server.use(
      http.post('*/merchants/m1/assignments', () => {
        called = true
        return HttpResponse.json({ success: true })
      })
    )
    renderAssignDialog()
    await pickAdmin(user, 'Nguyễn An')
    await user.type(screen.getByLabelText(/Lý do/), 'Trùng')
    await user.click(
      screen.getByRole('button', {
        name: 'Gán phụ trách',
        hidden: true
      })
    )
    expect(await screen.findByText(/đã được gán trực tiếp/)).toBeInTheDocument()
    expect(called).toBe(false)
  })
})
