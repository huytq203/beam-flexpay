import { render } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { savePermissions, setAccessToken } from '@slices/authSlice'
import type {
  AdminAccessScope,
  AdminAccessType,
  AdminFunctionRow,
  AdminRole,
  AdminRolePermissionMatrix,
  AdminRoleSyncStatus
} from '../types/rolePermissionMatrix.types'

export const BASE = '*/role-permissions'

const cellOf = (
  role: AdminRole,
  accessType: AdminAccessType | null,
  scope: AdminAccessScope = 'ALL'
) => ({
  role,
  granted: accessType !== null,
  accessType,
  symbol: accessType ? accessType.charAt(0) : '-',
  scope: accessType ? scope : null
})

const ROLES: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'SALES']

const row = (
  code: string,
  displayName: string,
  sortOrder: number,
  types: Array<[AdminAccessType | null, AdminAccessScope?]>
): AdminFunctionRow => ({
  code,
  displayName,
  sortOrder,
  cells: ROLES.map((role, index) =>
    cellOf(role, types[index][0], types[index][1])
  )
})

export const matrixFixture = (): AdminRolePermissionMatrix => ({
  roles: ROLES,
  functions: [
    row('MERCHANT_LIST', 'Xem danh sách Merchant', 1, [
      ['READ'],
      ['READ'],
      ['READ', 'ASSIGNED']
    ]),
    row('MERCHANT_CREATE', 'Thêm mới Merchant', 3, [
      ['CREATE'],
      ['CREATE'],
      [null]
    ]),
    row('ROLE_PERMISSION_MANAGE', 'Quản trị ma trận phân quyền', 26, [
      ['UPDATE'],
      ['UPDATE'],
      [null]
    ])
  ]
})

export const syncFixture = (
  over: Partial<AdminRoleSyncStatus> = {}
): AdminRoleSyncStatus[] =>
  ROLES.map((role) => ({
    role,
    state: 'NEVER_SYNCED',
    authorities: ['PERMISSION_EWALLET:MERCHANT:VIEW'],
    unmappedFunctions: [],
    lastSyncedAt: null,
    lastSyncedBy: null,
    added: ['PERMISSION_EWALLET:MERCHANT:VIEW'],
    removed: [],
    note: null,
    ...over
  }))

export const mockMatrix = (
  matrix: AdminRolePermissionMatrix = matrixFixture(),
  sync: AdminRoleSyncStatus[] = syncFixture()
) =>
  server.use(
    http.get(BASE, () => HttpResponse.json({ data: matrix })),
    http.get(`${BASE}/sync-status`, () => HttpResponse.json({ data: sync }))
  )

const base64Url = (value: object): string =>
  btoa(JSON.stringify(value))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

/** Token không ký, đủ để `decodeToken` đọc `roles` của người gọi. */
export const tokenWithRoles = (roles: string[]): string =>
  [
    base64Url({ alg: 'none' }),
    base64Url({ exp: Math.floor(Date.now() / 1000) + 3600, roles }),
    'sig'
  ].join('.')

export const renderMatrix = (
  ui: ReactElement,
  permissions: string[],
  roles: string[] = []
) => {
  const store = createAppStore()
  store.dispatch(setAccessToken({ token: tokenWithRoles(roles) }))
  store.dispatch(savePermissions(permissions))
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    )
  }
}
