import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { createAppStore } from '@/app/store'
import useFetchDataWithdraw from '../withdraw-history/hooks/useFetchDataWithdraw'
import useFrozenTransactions from '../frozen-transactions/hooks/useFrozenTransactions'
import useSystemLedger from '../system-ledger/hooks/useSystemLedger'

const PHONE = '0912345678'

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createAppStore()}>
    <MemoryRouter initialEntries={['/list']}>{children}</MemoryRouter>
  </Provider>
)

afterEach(() => sessionStorage.clear())

describe('SĐT/username không lên URL ở các màn giao dịch', () => {
  it('Lịch sử rút tiền: từ khóa (nhận SĐT) chỉ lưu sessionStorage', () => {
    const { result } = renderHook(
      () => ({ list: useFetchDataWithdraw(), location: useLocation() }),
      { wrapper }
    )
    act(() => result.current.list.handleSearch({ keyword: PHONE }))
    expect(result.current.location.search).not.toContain(PHONE)
    expect(result.current.list.filters.keyword).toBe(PHONE)
  })

  it('Giao dịch phong tỏa: username chỉ lưu sessionStorage', () => {
    const { result } = renderHook(
      () => ({ list: useFrozenTransactions(), location: useLocation() }),
      { wrapper }
    )
    act(() => result.current.list.handleSearch({ username: PHONE }))
    expect(result.current.location.search).not.toContain(PHONE)
    expect(result.current.list.filter.username).toBe(PHONE)
  })

  it('Sổ cái: từ khóa chủ tài khoản chỉ lưu sessionStorage', () => {
    const { result } = renderHook(
      () => ({ list: useSystemLedger(), location: useLocation() }),
      { wrapper }
    )
    act(() => result.current.list.handleSearch({ keyword: PHONE }))
    expect(result.current.location.search).not.toContain(PHONE)
  })
})
