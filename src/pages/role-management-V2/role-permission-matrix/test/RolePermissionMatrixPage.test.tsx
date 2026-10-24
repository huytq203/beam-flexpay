import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { feedback } from '@components/index'
import RolePermissionMatrixPage from '../pages/RolePermissionMatrixPage'
import {
  BASE,
  matrixFixture,
  mockMatrix,
  renderMatrix,
  syncFixture
} from './rolePermissionMatrix.setup'

const VIEW = PERMISSION.ROLE_PERMISSION_VIEW
const MANAGE = PERMISSION.ROLE_PERMISSION_MANAGE
const REASON = 'Bổ sung quyền theo yêu cầu BA'

describe('RolePermissionMatrixPage', { timeout: 30000 }, () => {
  it('dựng bảng từ roles và cells của BE, có nhóm, cột # và ô Assigned', async () => {
    mockMatrix()
    renderMatrix(<RolePermissionMatrixPage />, [VIEW])
    const table = await screen.findByRole('table')
    expect(await within(table).findByText('Merchant (2)')).toBeInTheDocument()
    expect(within(table).getByText('Quản trị hệ thống (1)')).toBeInTheDocument()
    expect(within(table).getAllByText('Super Admin').length).toBeGreaterThan(0)
    expect(within(table).getAllByText('Kinh doanh').length).toBeGreaterThan(0)
    expect(within(table).getAllByText('#').length).toBeGreaterThan(0)
    expect(within(table).getByText('(Assigned)')).toBeInTheDocument()
    expect(within(table).getByText('MERCHANT_LIST')).toBeInTheDocument()
  })

  it('chỉ có quyền xem thì ẩn nút Sửa và Đồng bộ, và luôn nhắc đồng bộ chưa hiệu lực', async () => {
    mockMatrix()
    renderMatrix(<RolePermissionMatrixPage />, [VIEW])
    await screen.findByRole('table')
    expect(screen.queryByRole('button', { name: /^Sửa quyền/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Đồng bộ/ })).toBeNull()
    expect(
      screen.getByText(/chưa thực sự đẩy quyền/, { exact: false })
    ).toBeInTheDocument()
  })

  it('khóa cột Super Admin với người không phải Super Admin', async () => {
    mockMatrix()
    const first = renderMatrix(
      <RolePermissionMatrixPage />,
      [VIEW, MANAGE],
      ['ADMIN']
    )
    const locked = await screen.findByRole('button', {
      name: 'Sửa quyền Super Admin'
    })
    expect(locked).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Sửa quyền Quản trị viên' })
    ).toBeEnabled()
    first.unmount()

    renderMatrix(<RolePermissionMatrixPage />, [VIEW, MANAGE], ['SUPER_ADMIN'])
    expect(
      await screen.findByRole('button', { name: 'Sửa quyền Super Admin' })
    ).toBeEnabled()
  })

  it('sửa một ô rồi lưu gửi toàn bộ quyền đang cấp, đúng enum, và thay bảng bằng ma trận trả về', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    mockMatrix()
    let body: unknown
    let path = ''
    const updated = matrixFixture()
    updated.functions[1].cells[1] = {
      role: 'ADMIN',
      granted: false,
      accessType: null,
      symbol: '-',
      scope: null
    }
    server.use(
      http.put(`${BASE}/:role`, async ({ request, params }) => {
        path = String(params.role)
        body = await request.json()
        return HttpResponse.json({ data: updated })
      })
    )
    renderMatrix(<RolePermissionMatrixPage />, [VIEW, MANAGE], ['MANAGER'])
    await user.click(
      await screen.findByRole('button', { name: 'Sửa quyền Quản trị viên' })
    )
    const select = await screen.findByRole('combobox', {
      name: 'Quyền: Thêm mới Merchant'
    })
    await user.click(select)
    await user.click(await screen.findByTitle('Không'))
    await user.type(screen.getByLabelText(/Lý do/), REASON)
    await user.click(screen.getByRole('button', { name: 'Lưu quyền' }))
    await waitFor(() => expect(success).toHaveBeenCalled())
    expect(path).toBe('ADMIN')
    expect(body).toEqual({
      reason: REASON,
      permissions: [
        { function: 'MERCHANT_LIST', accessType: 'READ', scope: 'ALL' },
        {
          function: 'ROLE_PERMISSION_MANAGE',
          accessType: 'UPDATE',
          scope: 'ALL'
        }
      ]
    })
    success.mockRestore()
  })

  it('đồng bộ mà BE chưa đẩy thì hiện ghi chú thật của BE và không báo thành công', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    const warning = vi.spyOn(feedback, 'warning').mockImplementation(() => {})
    mockMatrix()
    let reason: string | null = null
    server.use(
      http.post(`${BASE}/:role/sync`, ({ request }) => {
        reason = new URL(request.url).searchParams.get('reason')
        return HttpResponse.json({
          data: syncFixture({ note: 'Chua cau hinh dong bo Keycloak' })[1]
        })
      })
    )
    renderMatrix(<RolePermissionMatrixPage />, [VIEW, MANAGE], ['ADMIN'])
    await user.click(
      await screen.findByRole('button', { name: 'Đồng bộ Quản trị viên' })
    )
    await user.click(screen.getByRole('button', { name: 'Đồng bộ' }))
    expect(
      await screen.findByText('Lý do không được để trống')
    ).toBeInTheDocument()
    expect(reason).toBeNull()
    await user.type(screen.getByLabelText(/Lý do/), 'Áp dụng quyền mới')
    await user.click(screen.getByRole('button', { name: 'Đồng bộ' }))
    expect(
      await screen.findByText(/Ghi chú từ BE: Chua cau hinh/)
    ).toBeInTheDocument()
    expect(screen.getByText(/^Chưa đồng bộ: BE đã nhận/)).toBeInTheDocument()
    expect(reason).toBe('Áp dụng quyền mới')
    expect(success).not.toHaveBeenCalled()
    expect(warning).toHaveBeenCalled()
    success.mockRestore()
    warning.mockRestore()
  })

  it('gỡ dòng quản trị ma trận khỏi vai trò của chính mình phải xác nhận thêm một bước', async () => {
    const user = userEvent.setup()
    mockMatrix()
    let calls = 0
    server.use(
      http.put(`${BASE}/:role`, () => {
        calls += 1
        return HttpResponse.json({ data: matrixFixture() })
      })
    )
    renderMatrix(<RolePermissionMatrixPage />, [VIEW, MANAGE], ['ADMIN'])
    await user.click(
      await screen.findByRole('button', { name: 'Sửa quyền Quản trị viên' })
    )
    await user.click(
      await screen.findByRole('combobox', {
        name: 'Quyền: Quản trị ma trận phân quyền'
      })
    )
    await user.click(await screen.findByTitle('Không'))
    await user.type(screen.getByLabelText(/Lý do/), REASON)
    await user.click(screen.getByRole('button', { name: 'Lưu quyền' }))
    expect(
      await screen.findByText(/Bạn đang giữ vai trò Quản trị viên/)
    ).toBeInTheDocument()
    expect(calls).toBe(0)
    await user.click(screen.getByRole('button', { name: 'Vẫn lưu' }))
    await waitFor(() => expect(calls).toBe(1))
  })
})
