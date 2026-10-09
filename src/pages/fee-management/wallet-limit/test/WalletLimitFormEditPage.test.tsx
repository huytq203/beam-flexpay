import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { walletLimitPaths } from '../utils/walletLimit.paths'
import {
  CONFLICT_MESSAGE,
  basePolicy,
  mockPolicy,
  ok,
  renderForm,
  systemAll
} from './WalletLimitFormTestHelpers'

describe('WalletLimitFormPage - Cập nhật', () => {
  const editRoute = (id: string) => `${walletLimitPaths.edit(id)}`

  it('404 hiện "Không tìm thấy cấu hình"', async () => {
    server.use(
      http.get('*/wallet-limit-policies/:id', () =>
        HttpResponse.json(
          { success: false, detail: 'Không tìm thấy', status: '1003' },
          { status: 404 }
        )
      )
    )
    renderForm(editRoute('missing'))

    expect(
      await screen.findByText('Không tìm thấy cấu hình')
    ).toBeInTheDocument()
  })

  it('409: hiện banner, Tải lại cấu hình nạp bản mới và gửi rowVersion mới', async () => {
    const user = userEvent.setup()
    mockPolicy([
      basePolicy,
      { ...basePolicy, maxPerTransaction: 6000000, rowVersion: 4 }
    ])
    const bodies: unknown[] = []
    server.use(
      http.put('*/wallet-limit-policies/p-1', async ({ request }) => {
        bodies.push(await request.json())
        if (bodies.length === 1) {
          return HttpResponse.json(
            { success: false, detail: CONFLICT_MESSAGE, status: '19110' },
            { status: 409 }
          )
        }
        return ok({ ...basePolicy, rowVersion: 5 })
      })
    )
    renderForm(editRoute('p-1'))

    expect(
      await screen.findByText(/Đang sửa phiên bản dữ liệu 3/)
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText(CONFLICT_MESSAGE)).toBeInTheDocument()
    expect(bodies[0]).toMatchObject({ rowVersion: 3, status: 'ACTIVE' })
    expect(bodies[0]).not.toHaveProperty('scopeType')

    await user.click(screen.getByRole('button', { name: 'Tải lại cấu hình' }))
    expect(
      await screen.findByText(/Đang sửa phiên bản dữ liệu 4/)
    ).toBeInTheDocument()
    expect(screen.queryByText(CONFLICT_MESSAGE)).not.toBeInTheDocument()
    expect(screen.getAllByLabelText(/^Tối đa\/GD/)[0]).toHaveValue('6,000,000')

    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    expect(await screen.findByText('Trang chi tiết')).toBeInTheDocument()
    expect(bodies[1]).toMatchObject({
      rowVersion: 4,
      maxPerTransaction: 6000000
    })
  })

  it('khóa Hệ thống / Tất cả: hộp xác nhận nói rõ dừng mọi lệnh rồi mới lưu', async () => {
    const user = userEvent.setup()
    mockPolicy([systemAll])
    let body: unknown
    server.use(
      http.put('*/wallet-limit-policies/sys-1', async ({ request }) => {
        body = await request.json()
        return ok({ ...systemAll, status: 'LOCKED', rowVersion: 4 })
      })
    )
    renderForm(editRoute('sys-1'))

    await screen.findByText(/Đang sửa phiên bản dữ liệu 3/)
    await user.click(screen.getByLabelText('Trạng thái'))
    await user.click(await screen.findByTitle('Khóa'))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText(
        /dừng mọi lệnh nạp, rút và chuyển mới của mọi ví/
      )
    ).toBeInTheDocument()
    expect(body).toBeUndefined()

    await user.click(
      within(dialog).getByRole('button', { name: 'Xác nhận khóa' })
    )
    expect(await screen.findByText('Trang chi tiết')).toBeInTheDocument()
    expect(body).toMatchObject({ status: 'LOCKED', rowVersion: 3 })
  })

  it('khóa cấu hình Ví: nói rõ chỉ bỏ qua lớp này, không chặn giao dịch', async () => {
    const user = userEvent.setup()
    mockPolicy([basePolicy])
    renderForm(editRoute('p-1'))

    await screen.findByText(/Đang sửa phiên bản dữ liệu 3/)
    await user.click(screen.getByLabelText('Trạng thái'))
    await user.click(await screen.findByTitle('Khóa'))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText(/giao dịch không bị chặn/)
    ).toBeInTheDocument()
    expect(within(dialog).queryByText(/dừng mọi lệnh/)).not.toBeInTheDocument()
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Hủy' })
      ).toBeInTheDocument()
    )
  })

  it('Hệ thống: ô đang có giá trị không được bỏ trống', async () => {
    const user = userEvent.setup()
    mockPolicy([systemAll])
    renderForm(editRoute('sys-1'))

    await screen.findByText(/Đang sửa phiên bản dữ liệu 3/)
    await user.clear(screen.getByLabelText('Sức chứa ví'))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(
      await screen.findByText(
        'Không được bỏ trống Sức chứa ví của cấu hình Hệ thống.'
      )
    ).toBeInTheDocument()
  })
})
