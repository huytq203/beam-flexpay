import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getPermissionManagementColumns } from '@pages/role-management-V2/permission-management/columns/PermissionManagement.column'
import { getRoleManagementColumn } from '@pages/role-management-V2/role-management/columns/RoleManagement.column'
import { getUserManagementColumn } from '@pages/role-management-V2/user-management/columns/UserManagement.column'
import { CAPY_BLOCKED_PATHS, isCapyRoute } from '../capyRoutes'
import { FORBIDDEN_SELECTOR } from '../engine/zones'
import { capyWrapper } from './helpers'

interface Column {
  readonly dataIndex?: unknown
  readonly key?: unknown
  readonly render?: (value: unknown, record: never, index: number) => ReactNode
}

const noop = (): void => undefined

/** Dựng một ô của cột và trả phần tử gốc của nó. */
function cellRoot(column: Column | undefined, value: unknown): Element | null {
  const record = {} as never
  const node = column?.render?.(value, record, 0)
  const { container } = render(<>{node}</>, {
    wrapper: capyWrapper({ username: 'huy' }, '/')
  })
  return container.firstElementChild
}

const isAction = (column: Column): boolean =>
  column.dataIndex === 'action' || column.key === 'action'

describe('vùng cấm trên các màn được phép có Capy', () => {
  it('cột thao tác của ba màn quản lý tài khoản và quyền là vùng cấm', () => {
    const user = getUserManagementColumn({ openModal: noop })
    const role = getRoleManagementColumn({ openModal: noop })
    const permission = getPermissionManagementColumns({ openModal: noop })
    for (const columns of [user, role, permission]) {
      const action = (columns as Column[]).find(isAction)
      expect(cellRoot(action, null)?.matches(FORBIDDEN_SELECTOR)).toBe(true)
    }
  })

  it('cột email của danh sách tài khoản là vùng cấm', () => {
    const email = (
      getUserManagementColumn({ openModal: noop }) as Column[]
    ).find((column) => column.dataIndex === 'email')
    expect(cellRoot(email, 'a@beam.vn')?.matches(FORBIDDEN_SELECTOR)).toBe(true)
  })

  it('chỉ chặn route đăng nhập và từ chối truy cập, mọi màn khác được phép', () => {
    expect(CAPY_BLOCKED_PATHS).toHaveLength(2)
    expect(isCapyRoute('/secure-panel/auth/login')).toBe(false)
    expect(isCapyRoute('/secure-panel/forbidden')).toBe(false)
    expect(
      isCapyRoute('/secure-panel/transaction-management/transaction-wallet')
    ).toBe(true)
  })
})
