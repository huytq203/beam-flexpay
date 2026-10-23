import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { GROUPS, openRoleDetail, renderPage } from './merchantAccess.setup'

vi.mock('@utils/file-download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@utils/file-download')>()),
  saveBlobAsFile: vi.fn().mockResolvedValue(undefined)
}))

describe('Nhóm quyền — chi tiết từ API', () => {
  it('mở nhóm thì gọi GET /merchant-permission-groups/{id} và dùng quyền mới nhất', async () => {
    const user = userEvent.setup()
    const requested: string[] = []
    server.use(
      http.get('*/merchant-permissions', () =>
        HttpResponse.json({
          data: [
            { code: 'VIEW_TRANSACTION', category: 'TRANSACTION' },
            { code: 'EXPORT_TRANSACTION', category: 'TRANSACTION' }
          ]
        })
      ),
      http.get('*/merchant-permission-groups/:id', ({ params }) => {
        requested.push(String(params.id))
        return HttpResponse.json({
          data: {
            ...GROUPS[0],
            permissions: ['VIEW_TRANSACTION', 'EXPORT_TRANSACTION']
          }
        })
      })
    )
    renderPage('/secure-panel/merchant/user-role')
    const dialog = await openRoleDetail(user, 'Quản trị Merchant')
    expect(requested).toEqual(['role-admin'])
    // Dòng trong bảng chỉ có 1 quyền; chi tiết mới nhất có 2.
    expect(within(dialog).getByText('2/2 quyền')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('checkbox', { name: 'Xuất Excel giao dịch' })
    ).toBeChecked()
  })

  it('báo lỗi khi không tải được chi tiết nhóm', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('*/merchant-permission-groups/:id', () =>
        HttpResponse.json(
          {
            message: 'RESOURCE_NOT_FOUND',
            detail: 'Không tìm thấy nhóm quyền'
          },
          { status: 404 }
        )
      )
    )
    renderPage('/secure-panel/merchant/user-role')
    await user.click(
      await screen.findByRole('button', { name: 'Quản trị Merchant' })
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Quản lý quyền trong nhóm'
    })
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Không tìm thấy nhóm quyền'
    )
  })
})

describe('User Merchant — xuất CSV', () => {
  it('gửi query, merchantId, status theo bộ lọc, không kèm page/size', async () => {
    const user = userEvent.setup()
    let url: URL | undefined
    server.use(
      http.get('*/merchant-users/export', ({ request }) => {
        url = new URL(request.url)
        return new HttpResponse('"a"', {
          headers: { 'Content-Type': 'text/csv;charset=UTF-8' }
        })
      })
    )
    renderPage('/secure-panel/merchant/user', [
      PERMISSION.MERCHANT_USER_VIEW,
      PERMISSION.MERCHANT_USER_EXPORT,
      PERMISSION.MERCHANT_PERMISSION_GROUP_VIEW
    ])
    await screen.findByText('Nguyễn Văn Hải')
    await user.type(screen.getByLabelText('Từ khóa'), 'Hải{Enter}')
    await user.click(screen.getByRole('button', { name: /Xuất CSV/ }))
    await waitFor(() => expect(url).toBeDefined())
    expect(Object.fromEntries(url?.searchParams ?? [])).toEqual({
      query: 'Hải'
    })
  })

  it('ẩn nút xuất khi thiếu quyền MERCHANT_USER:EXPORT', async () => {
    renderPage('/secure-panel/merchant/user')
    await screen.findByText('Nguyễn Văn Hải')
    expect(screen.queryByRole('button', { name: /Xuất CSV/ })).toBeNull()
  })
})
