import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { openRoleDetail, renderPage } from './merchantAccess.setup'

describe('Nhóm quyền Merchant', () => {
  it('chọn và bỏ chọn toàn bộ quyền trong nhóm', async () => {
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user-role')

    await user.click(screen.getByRole('button', { name: 'Thêm nhóm quyền' }))
    const dialog = screen.getByRole('dialog', { name: 'Thêm mới nhóm quyền' })
    await user.click(
      within(dialog).getByRole('button', { name: 'Chọn tất cả' })
    )
    expect(
      within(dialog).getByRole('button', { name: 'Bỏ chọn tất cả' })
    ).toBeInTheDocument()
    await user.click(
      within(dialog).getByRole('button', { name: 'Bỏ chọn tất cả' })
    )
    expect(
      within(dialog).getByRole('button', { name: 'Chọn tất cả' })
    ).toBeInTheDocument()
  })

  it('xem quyền dạng checkbox và lưu quyền nhóm riêng qua API', async () => {
    const user = userEvent.setup()
    let updatedPermissions: unknown
    server.use(
      http.get('*/merchant-permissions', () =>
        HttpResponse.json({
          data: [
            { code: 'VIEW_TRANSACTION', category: 'TRANSACTION' },
            { code: 'EXPORT_TRANSACTION', category: 'TRANSACTION' }
          ]
        })
      ),
      http.put(
        '*/merchant-permission-groups/role-admin/permissions',
        async ({ request }) => {
          updatedPermissions = await request.json()
          return HttpResponse.json({
            data: {
              id: 'role-admin',
              permissions: ['VIEW_TRANSACTION', 'EXPORT_TRANSACTION']
            }
          })
        }
      )
    )
    renderPage('/secure-panel/merchant/user-role')

    expect(screen.queryByRole('button', { name: 'Danh sách User' })).toBeNull()
    const dialog = await openRoleDetail(user, 'Quản trị Merchant')
    const checkbox = within(dialog).getByRole('checkbox', {
      name: 'Xem giao dịch'
    })
    expect(checkbox).toBeChecked()
    await user.click(
      within(dialog).getByRole('checkbox', { name: 'Xuất Excel giao dịch' })
    )
    await user.click(within(dialog).getByRole('button', { name: 'Lưu quyền' }))
    await waitFor(() =>
      expect(updatedPermissions).toEqual({
        permissions: ['VIEW_TRANSACTION', 'EXPORT_TRANSACTION']
      })
    )
    expect(
      await screen.findByText('Đã cập nhật quyền trong nhóm')
    ).toBeInTheDocument()
  })

  it('hiển thị lý do từ API khi lưu quyền thất bại', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('*/merchant-permissions', () =>
        HttpResponse.json({
          data: [
            { code: 'VIEW_TRANSACTION', category: 'TRANSACTION' },
            { code: 'EXPORT_TRANSACTION', category: 'TRANSACTION' }
          ]
        })
      ),
      http.put('*/merchant-permission-groups/role-admin/permissions', () =>
        HttpResponse.json(
          { detail: 'Nhóm quyền đã được cập nhật bởi người khác' },
          { status: 409 }
        )
      )
    )
    renderPage('/secure-panel/merchant/user-role')
    const dialog = await openRoleDetail(user, 'Quản trị Merchant')
    await user.click(
      within(dialog).getByRole('checkbox', { name: 'Xuất Excel giao dịch' })
    )
    await user.click(within(dialog).getByRole('button', { name: 'Lưu quyền' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Nhóm quyền đã được cập nhật bởi người khác'
    )
  })

  it('chọn và bỏ chọn tất cả hoặc theo từng nhóm trong màn quản lý quyền', async () => {
    const user = userEvent.setup()
    let updatedPermissions: unknown
    server.use(
      http.get('*/merchant-permissions', () =>
        HttpResponse.json({
          data: [
            { code: 'VIEW_TRANSACTION', category: 'TRANSACTION' },
            { code: 'EXPORT_TRANSACTION', category: 'TRANSACTION' },
            { code: 'CREATE_REFUND', category: 'REFUND' }
          ]
        })
      ),
      http.put(
        '*/merchant-permission-groups/role-admin/permissions',
        async ({ request }) => {
          updatedPermissions = await request.json()
          return HttpResponse.json({
            data: {
              id: 'role-admin',
              permissions: ['VIEW_TRANSACTION', 'EXPORT_TRANSACTION']
            }
          })
        }
      )
    )
    renderPage('/secure-panel/merchant/user-role')
    const dialog = await openRoleDetail(user, 'Quản trị Merchant')
    const transactions = within(dialog).getByRole('group', {
      name: 'Giao dịch'
    })
    const transactionToggle = within(transactions).getByRole('checkbox', {
      name: 'Giao dịch'
    })
    expect(transactionToggle).toBePartiallyChecked()

    await user.click(
      within(dialog).getByRole('button', { name: 'Chọn tất cả' })
    )
    expect(
      within(dialog).getByRole('button', { name: 'Bỏ chọn tất cả' })
    ).toBeInTheDocument()
    expect(within(dialog).getByText('3/3 quyền')).toBeInTheDocument()

    await user.click(transactionToggle)
    expect(within(dialog).getByText('1/3 quyền')).toBeInTheDocument()
    await user.click(
      within(dialog).getByRole('button', { name: 'Chọn tất cả' })
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Bỏ chọn tất cả' })
    )
    expect(within(dialog).getByText('0/3 quyền')).toBeInTheDocument()

    await user.click(transactionToggle)
    expect(within(dialog).getByText('2/3 quyền')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Lưu quyền' }))
    await waitFor(() =>
      expect(updatedPermissions).toEqual({
        permissions: ['VIEW_TRANSACTION', 'EXPORT_TRANSACTION']
      })
    )
  })

  it('hiện thao tác sửa cho nhóm dùng chung khi có quyền hệ thống', async () => {
    renderPage('/secure-panel/merchant/user-role', [
      PERMISSION.MERCHANT_PERMISSION_GROUP_VIEW,
      PERMISSION.MERCHANT_SYSTEM_GROUP_MANAGE
    ])
    expect(
      await screen.findByRole('button', { name: 'Sửa nhóm Chỉ xem báo cáo' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Xóa nhóm Chỉ xem báo cáo' })
    ).toBeNull()
  })

  it('nhóm dùng chung hiện cùng nhóm riêng khi lọc Merchant, và không xóa nhóm đang được dùng', async () => {
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user-role')

    expect(await screen.findByText('Quản trị Merchant')).toBeInTheDocument()
    expect(screen.getByText('Chỉ xem báo cáo')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Xóa nhóm Quản trị Merchant' })
    )

    const dialog = await screen.findByRole('dialog', { name: 'Xóa nhóm quyền' })
    expect(
      within(dialog).getByText(/Nhóm đang được gán cho/)
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Xóa nhóm quyền' })
    ).toBeDisabled()
  })
})
