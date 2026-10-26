import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import MerchantRoleListPage from '../pages/MerchantRoleListPage'
import MerchantUserListPage from '../pages/MerchantUserListPage'
import { suppressAntPseudoElementWarning } from '../../sub-merchant-management/sub-merchant/test/domTestSetup'

suppressAntPseudoElementWarning()

export const GROUPS = [
  {
    id: 'role-admin',
    code: 'ADMIN',
    name: 'Quản trị Merchant',
    description: 'Quản trị',
    merchantId: 'merchant-0142',
    permissions: ['VIEW_TRANSACTION'],
    system: false,
    createdAt: '2026-03-01T09:30:00'
  },
  {
    id: 'role-viewer',
    code: 'VIEWER',
    name: 'Chỉ xem báo cáo',
    description: 'Chỉ xem',
    merchantId: null,
    permissions: ['VIEW_TRANSACTION'],
    system: true,
    createdAt: '2026-03-01T09:30:00'
  }
]
// Bộ lọc được lưu theo đường dẫn màn; không xoá thì lọc của test trước rò sang test sau.
afterEach(() => sessionStorage.clear())
beforeEach(() => {
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: {
          content: [
            { id: 'merchant-0142', code: 'MC000142', name: 'Highlands Coffee' }
          ],
          totalElements: 1,
          number: 0,
          size: 100
        }
      })
    ),
    http.get('*/merchants/:id', ({ params }) =>
      HttpResponse.json({
        data: {
          id: params.id,
          code: 'MC000142',
          name: 'Highlands Coffee',
          status: 'ACTIVE'
        }
      })
    ),
    http.get('*/sub-merchants', () =>
      HttpResponse.json({
        data: {
          content: [
            {
              id: 'sub-hlc-north',
              merchantId: 'merchant-0142',
              name: 'HLC Miền Bắc'
            }
          ],
          totalElements: 1,
          number: 0,
          size: 100
        }
      })
    ),
    http.get('*/merchant-permissions', () =>
      HttpResponse.json({
        data: [{ code: 'VIEW_TRANSACTION', category: 'TRANSACTION' }]
      })
    ),
    http.get('*/merchant-users', ({ request }) => {
      const query = new URL(request.url).searchParams
        .get('query')
        ?.toLocaleLowerCase('vi-VN')
      const users = [
        {
          id: 'user-1',
          fullName: 'Nguyễn Văn Hải',
          email: 'hai@example.com',
          phone: '0912345456',
          merchantIds: ['merchant-0142'],
          subMerchantIds: ['sub-hlc-north'],
          groupIds: ['role-admin'],
          status: 'ACTIVE',
          createdAt: '2026-03-02T09:00:00'
        },
        {
          id: 'user-2',
          fullName: 'Lê Thị Mai',
          email: 'mai@example.com',
          phone: '0905432222',
          merchantIds: ['merchant-0142'],
          subMerchantIds: [],
          groupIds: [],
          status: 'ACTIVE',
          createdAt: '2026-03-04T10:00:00'
        }
      ].filter(
        (item) =>
          !query || item.fullName.toLocaleLowerCase('vi-VN').includes(query)
      )
      return HttpResponse.json({
        data: {
          content: users,
          totalElements: users.length,
          number: 0,
          size: 20
        }
      })
    }),
    http.get('*/merchant-permission-groups', () =>
      HttpResponse.json({
        data: {
          content: GROUPS,
          totalElements: GROUPS.length,
          number: 0,
          size: 20
        }
      })
    ),
    http.get('*/merchant-permission-groups/:id', ({ params }) => {
      const group = GROUPS.find((item) => item.id === params.id)
      return group
        ? HttpResponse.json({ data: group })
        : HttpResponse.json(
            {
              message: 'RESOURCE_NOT_FOUND',
              detail: 'Không tìm thấy nhóm quyền'
            },
            { status: 404 }
          )
    }),
    http.get('*/merchant-permission-groups/:id/users', () =>
      HttpResponse.json({
        data: { content: [], totalElements: 1, number: 0, size: 1 }
      })
    )
  )
})

export const renderPage = (
  path: '/secure-panel/merchant/user' | '/secure-panel/merchant/user-role',
  permissions: string[] = [
    PERMISSION.MERCHANT_USER_VIEW,
    PERMISSION.MERCHANT_USER_CREATE,
    PERMISSION.MERCHANT_USER_UPDATE,
    PERMISSION.MERCHANT_USER_LOCK,
    PERMISSION.MERCHANT_PERMISSION_GROUP_VIEW,
    PERMISSION.MERCHANT_PERMISSION_GROUP_MANAGE
  ]
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route
              element={<MerchantUserListPage />}
              path='/secure-panel/merchant/user'
            />
            <Route
              element={<MerchantRoleListPage />}
              path='/secure-panel/merchant/user-role'
            />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}

/** Mở chi tiết nhóm quyền và đợi API chi tiết trả về trước khi thao tác. */
export const openRoleDetail = async (
  user: ReturnType<typeof userEvent.setup>,
  roleName: string
) => {
  await user.click(await screen.findByRole('button', { name: roleName }))
  await waitFor(() =>
    expect(screen.getByText(/^\d+\/\d+ quyền$/)).toBeInTheDocument()
  )
  return screen.getByRole('dialog', { name: 'Quản lý quyền trong nhóm' })
}
