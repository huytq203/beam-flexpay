import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import DialogAssignPermissions from '../DialogAssignPermissions'
import { ASSIGN_PERMISSIONS_FORM_ID } from '../../constants/RoleManagement.constant'

describe('DialogAssignPermissions', () => {
  it('tìm theo mã quyền bằng API trong modal', async () => {
    const keywords: string[] = []
    server.use(
      http.get('*/roles/:roleId/permissions', () =>
        HttpResponse.json({ success: true, data: [] })
      ),
      http.get('*/permissions/search', ({ request }) => {
        const keyword = new URL(request.url).searchParams.get('keyword') ?? ''
        keywords.push(keyword)
        const permissions = [
          {
            id: 'p-1',
            name: 'EWALLET:ROLE:VIEW',
            description: 'Xem nhóm quyền'
          },
          {
            id: 'p-2',
            name: 'EWALLET:USER:DELETE',
            description: 'Xóa tài khoản'
          }
        ].filter((permission) => permission.name.includes(keyword))
        return HttpResponse.json({
          success: true,
          data: {
            content: permissions,
            totalElements: permissions.length,
            totalPages: 1,
            size: 10,
            number: 0
          }
        })
      })
    )
    const user = userEvent.setup()
    renderWithProviders(
      <MessageProvider>
        <DialogAssignPermissions
          roleId='role-1'
          onSuccess={vi.fn()}
        />
      </MessageProvider>
    )
    const search = screen.getByRole('textbox', { name: 'Tìm quyền' })
    await screen.findByText('Xóa tài khoản')
    await user.type(search, 'USER:DELETE')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() => expect(keywords).toContain('USER:DELETE'))
    expect(await screen.findByText('Xóa tài khoản')).toBeInTheDocument()
    expect(screen.queryByText('Xem nhóm quyền')).not.toBeInTheDocument()
  })

  it('giữ quyền đã chọn khi tìm mã khác rồi lưu', async () => {
    let postedBody: unknown
    server.use(
      http.get('*/roles/:roleId/permissions', () =>
        HttpResponse.json({ success: true, data: [] })
      ),
      http.get('*/permissions/search', ({ request }) => {
        const keyword = new URL(request.url).searchParams.get('keyword') ?? ''
        const permissions = [
          {
            id: 'p-1',
            name: 'EWALLET:ROLE:VIEW',
            description: 'Xem nhóm quyền'
          },
          {
            id: 'p-2',
            name: 'EWALLET:USER:DELETE',
            description: 'Xóa tài khoản'
          }
        ].filter((permission) => permission.name.includes(keyword))
        return HttpResponse.json({
          success: true,
          data: {
            content: permissions,
            totalElements: permissions.length,
            totalPages: 1,
            size: 10,
            number: 0
          }
        })
      }),
      http.post('*/roles/role-1/permissions', async ({ request }) => {
        postedBody = await request.json()
        return HttpResponse.json({ success: true, data: null })
      })
    )
    const user = userEvent.setup()
    renderWithProviders(
      <MessageProvider>
        <DialogAssignPermissions
          roleId='role-1'
          onSuccess={vi.fn()}
        />
      </MessageProvider>
    )
    const firstRow = (await screen.findByText('Xem nhóm quyền')).closest('tr')!
    await user.click(within(firstRow).getByRole('checkbox'))
    await user.type(
      screen.getByRole('textbox', { name: 'Tìm quyền' }),
      'USER:DELETE'
    )
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    const secondRow = (await screen.findByText('Xóa tài khoản')).closest('tr')!
    await user.click(within(secondRow).getByRole('checkbox'))
    fireEvent.submit(document.getElementById(ASSIGN_PERMISSIONS_FORM_ID)!)
    await waitFor(() =>
      expect(postedBody).toEqual({
        permissionNames: ['EWALLET:ROLE:VIEW', 'EWALLET:USER:DELETE']
      })
    )
  })

  it('lấy mô tả làm nhãn quyền, giữ mã để phân biệt và có ô tìm kiếm', async () => {
    server.use(
      http.get('*/roles/:roleId/permissions', () =>
        HttpResponse.json({ success: true, data: [] })
      ),
      http.get('*/permissions/search', () =>
        HttpResponse.json({
          success: true,
          data: {
            content: [
              {
                id: 'p-1',
                name: 'EWALLET:ROLE:VIEW',
                description: 'Xem nhóm quyền'
              }
            ],
            totalElements: 1,
            totalPages: 1,
            size: 10,
            number: 0
          }
        })
      )
    )
    renderWithProviders(
      <MessageProvider>
        <DialogAssignPermissions
          roleId='role-1'
          onSuccess={vi.fn()}
        />
      </MessageProvider>
    )
    expect(await screen.findByText('Xem nhóm quyền')).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Mô tả' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: 'Tên quyền' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Mã quyền' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Tìm quyền' })
    ).toBeInTheDocument()
  })

  it('không dùng mã quyền thay cho mô tả rỗng từ API', async () => {
    server.use(
      http.get('*/roles/:roleId/permissions', () =>
        HttpResponse.json({ success: true, data: [] })
      ),
      http.get('*/permissions/search', () =>
        HttpResponse.json({
          success: true,
          data: {
            content: [
              {
                id: 'p-1',
                name: 'EWALLET:TERMINAL:VIEW',
                description: ''
              }
            ],
            totalElements: 1,
            totalPages: 1,
            size: 10,
            number: 0
          }
        })
      )
    )

    renderWithProviders(
      <MessageProvider>
        <DialogAssignPermissions
          roleId='role-1'
          onSuccess={vi.fn()}
        />
      </MessageProvider>
    )

    const row = (
      await screen.findAllByText('EWALLET:TERMINAL:VIEW')
    )[0].closest('tr')!
    expect(within(row).getByText('—')).toBeInTheDocument()
    expect(within(row).getAllByText('EWALLET:TERMINAL:VIEW')).toHaveLength(1)
  })

  it('tải danh mục quyền theo createdAt DESC đúng contract BE', async () => {
    const permissionQueries: URLSearchParams[] = []
    server.use(
      http.get('*/roles/:roleId/permissions', () =>
        HttpResponse.json({ success: true, data: [] })
      ),
      http.get('*/permissions/search', ({ request }) => {
        permissionQueries.push(new URL(request.url).searchParams)
        return HttpResponse.json({
          success: true,
          data: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0
          }
        })
      })
    )

    renderWithProviders(
      <MessageProvider>
        <DialogAssignPermissions
          roleId='role-1'
          onSuccess={vi.fn()}
        />
      </MessageProvider>
    )

    await waitFor(() => expect(permissionQueries).toHaveLength(1))
    expect(permissionQueries[0].get('sortBy')).toBe('createdAt')
    expect(permissionQueries[0].get('sortDirection')).toBe('DESC')
  })
})
