import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { useAccess, useScreenAccess } from '../useAccess'

const wrapperWith = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useAccess', () => {
  it('has, hasAny và hasAll dùng cùng logic grants', () => {
    const { result } = renderHook(() => useAccess(), {
      wrapper: wrapperWith(['EWALLET:ROLE:VIEW'])
    })

    expect(result.current.has('EWALLET:ROLE:VIEW')).toBe(true)
    expect(result.current.has('EWALLET:ROLE:DELETE')).toBe(false)
    expect(
      result.current.hasAny(['EWALLET:ROLE:VIEW', 'EWALLET:ROLE:DELETE'])
    ).toBe(true)
    expect(
      result.current.hasAll(['EWALLET:ROLE:VIEW', 'EWALLET:ROLE:DELETE'])
    ).toBe(false)
  })
})

describe('useScreenAccess', () => {
  it('phân biệt quyền xem màn và quyền hành động', () => {
    const { result } = renderHook(() => useScreenAccess('USER_ACCOUNT'), {
      wrapper: wrapperWith(['EWALLET:USER:VIEW'])
    })

    expect(result.current.canView).toBe(true)
    expect(result.current.can('viewDetail')).toBe(true)
    expect(result.current.can('create')).toBe(false)
    expect(result.current.can('assignRoles')).toBe(false)
  })

  it('quyền CREATE vẫn cho phép mở screen cùng module', () => {
    const { result } = renderHook(() => useScreenAccess('USER_ACCOUNT'), {
      wrapper: wrapperWith(['EWALLET:USER:CREATE'])
    })

    expect(result.current.canView).toBe(true)
    expect(result.current.can('create')).toBe(true)
    expect(result.current.can('edit')).toBe(false)
  })

  it('FULL bao trùm mọi hành động của màn', () => {
    const { result } = renderHook(() => useScreenAccess('USER_ACCOUNT'), {
      wrapper: wrapperWith(['EWALLET:USER:FULL'])
    })

    expect(result.current.canView).toBe(true)
    expect(result.current.can('create')).toBe(true)
    expect(result.current.can('resetPassword')).toBe(true)
  })

  it('canView của màn giao dịch mở với quyền xem hoặc EWALLET:FULL, không mở với quyền khác', () => {
    const open = (code: string) =>
      renderHook(() => useScreenAccess('TRANSACTION_WALLET'), {
        wrapper: wrapperWith([code])
      }).result.current.canView

    expect(open('EWALLET:TRANSACTION:VIEW')).toBe(true)
    expect(open('EWALLET:EWALLET:FULL')).toBe(true)
    expect(open('EWALLET:FEE:VIEW')).toBe(false)
  })

  it('không quyền thì chặn module đã phát hành', () => {
    const { result } = renderHook(() => useScreenAccess('ROLE_MANAGEMENT'), {
      wrapper: wrapperWith([])
    })

    expect(result.current.canView).toBe(false)
    expect(result.current.can('delete')).toBe(false)
  })

  it('module FEE cũng bị chặn khi thiếu quyền', () => {
    const { result } = renderHook(() => useScreenAccess('FEE_POLICY'), {
      wrapper: wrapperWith([])
    })

    expect(result.current.canView).toBe(false)
    expect(result.current.can('approve')).toBe(false)
  })

  it('quyền FEE cụ thể chỉ mở đúng hành động tương ứng', () => {
    const { result } = renderHook(() => useScreenAccess('FEE_POLICY'), {
      wrapper: wrapperWith(['EWALLET:FEE:VIEW', 'EWALLET:FEE:UPDATE'])
    })

    expect(result.current.canView).toBe(true)
    expect(result.current.can('deactivate')).toBe(true)
    expect(result.current.can('approve')).toBe(false)
    expect(result.current.can('activate')).toBe(false)
    expect(result.current.can('create')).toBe(false)
  })

  it('super-admin đi qua mọi màn', () => {
    const { result } = renderHook(() => useScreenAccess('CONFIRM_EKYC'), {
      wrapper: wrapperWith(['EWALLET:ADMIN:FULL'])
    })

    expect(result.current.canView).toBe(true)
    expect(result.current.can('approve')).toBe(true)
  })
})
