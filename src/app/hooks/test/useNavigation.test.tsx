import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { _ROLEMANAGEMENT_V2 } from '@constants/routersConstant'
import useNavigationEw from '../useNavigation'

const wrapperWith = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

const childKeysOf = (permissions: string[], groupKey: string): string[] => {
  const { result } = renderHook(() => useNavigationEw(), {
    wrapper: wrapperWith(permissions)
  })
  const group = result.current[0].find((item) => item.key === groupKey)
  return (group?.children ?? []).map((child) => String(child.key))
}

const groupKeysOf = (permissions: string[]): string[] => {
  const { result } = renderHook(() => useNavigationEw(), {
    wrapper: wrapperWith(permissions)
  })
  return result.current[0].map((item) => String(item.key))
}

describe('useNavigationEw', () => {
  it('chỉ giữ menu identity mà user có quyền xem', () => {
    expect(childKeysOf(['EWALLET:USER:VIEW'], _ROLEMANAGEMENT_V2)).toEqual([
      'user-account'
    ])
  })

  it('hiện đúng nhiều màn identity theo từng module', () => {
    expect(
      childKeysOf(
        ['EWALLET:USER:VIEW', 'EWALLET:ROLE:VIEW'],
        _ROLEMANAGEMENT_V2
      )
    ).toEqual(['user-account', 'permission-management'])
  })

  it('ẩn menu cha khi không còn menu con', () => {
    expect(groupKeysOf([])).not.toContain(_ROLEMANAGEMENT_V2)
  })

  it('module chưa phát hành vẫn hiện', () => {
    expect(groupKeysOf([])).toContain('secure-panel/fee-v4')
  })

  it('super-admin thấy toàn bộ menu identity', () => {
    expect(
      childKeysOf(['EWALLET:ADMIN:FULL'], _ROLEMANAGEMENT_V2)
    ).toHaveLength(3)
  })
})
