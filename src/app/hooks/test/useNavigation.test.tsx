import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import {
  _ROLEMANAGEMENT_V2,
  _TRANSACTIONMANAGEMENT
} from '@constants/routersConstant'
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

  it('không quyền thì ẩn toàn bộ menu nghiệp vụ', () => {
    expect(groupKeysOf([])).toEqual([])
  })

  it('chỉ có FEE thì chỉ hiện nhóm Quản lý phí', () => {
    const permissions = ['EWALLET:FEE:CREATE']

    expect(groupKeysOf(permissions)).toEqual(['secure-panel/fee-v4'])
    expect(childKeysOf(permissions, 'secure-panel/fee-v4')).toEqual([
      'fee-managementV4',
      'fee-bankV4',
      'fee-assignmentV4'
    ])
  })

  it('nhóm giao dịch hiện với TRANSACTION:VIEW, riêng đóng băng cần FREEZE:VIEW', () => {
    expect(groupKeysOf(['EWALLET:FEE:VIEW'])).not.toContain(
      _TRANSACTIONMANAGEMENT
    )
    expect(
      childKeysOf(['EWALLET:TRANSACTION:VIEW'], _TRANSACTIONMANAGEMENT)
    ).toEqual(['transaction-wallet', 'system-ledger', 'withdraw-history'])
    expect(
      childKeysOf(['EWALLET:FREEZE:VIEW'], _TRANSACTIONMANAGEMENT)
    ).toEqual(['frozen-transactions'])
  })

  it('EWALLET:FULL thấy đủ các màn giao dịch', () => {
    expect(
      childKeysOf(['EWALLET:EWALLET:FULL'], _TRANSACTIONMANAGEMENT)
    ).toEqual([
      'transaction-wallet',
      'frozen-transactions',
      'refund-management',
      'system-ledger',
      'withdraw-history'
    ])
  })

  it('super-admin thấy toàn bộ menu identity', () => {
    expect(
      childKeysOf(['EWALLET:ADMIN:FULL'], _ROLEMANAGEMENT_V2)
    ).toHaveLength(3)
  })

  it('tách ví doanh nghiệp thành một nhóm điều hướng riêng', () => {
    const permissions = ['EWALLET:MERCHANT:VIEW']

    expect(groupKeysOf(permissions)).toEqual([
      'business-wallet',
      'secure-panel/merchant'
    ])
    expect(childKeysOf(permissions, 'secure-panel/merchant')).not.toContain(
      'business-wallet-account'
    )
    expect(childKeysOf(permissions, 'business-wallet')).toEqual([
      'business-wallet-account'
    ])
  })

  it('dùng chung tiêu đề nhóm cho hai dropdown merchant', () => {
    const { result } = renderHook(() => useNavigationEw(), {
      wrapper: wrapperWith(['EWALLET:MERCHANT:VIEW'])
    })
    const merchantGroups = result.current[0].filter((item) =>
      ['secure-panel/merchant', 'business-wallet'].includes(String(item.key))
    )

    expect(merchantGroups.map((item) => item.groupLabel)).toEqual([
      'Quản lý merchant',
      'Quản lý merchant'
    ])
  })
})
