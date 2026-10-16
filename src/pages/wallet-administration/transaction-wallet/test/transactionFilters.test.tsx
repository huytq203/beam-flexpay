import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ getUnified: vi.fn() }))

vi.mock('../../../../app/services/apiJournal', () => ({
  useGetUnifiedInlineErrorQuery: (params: Record<string, unknown>) => {
    mocks.getUnified(params)
    return {
      data: { content: [], totalElements: 0 },
      isFetching: false,
      isLoading: false,
      isError: false,
      refetch: vi.fn()
    }
  }
}))

vi.mock('@services/apiWalletAccount.api', () => ({
  useLazyGetAccountQuery: () => [vi.fn()]
}))

vi.mock('@services/apiFreezes', () => ({
  useLazyGetFreezesQuery: () => [vi.fn()]
}))

vi.mock('@/app/permissions', () => ({
  PERMISSION: { FREEZE_UPDATE: 'FREEZE_UPDATE', EWALLET_FULL: 'EWALLET_FULL' },
  SCREENS: { TRANSACTION_WALLET: { path: '/transaction-wallet' } },
  useAccess: () => ({ hasAny: () => false })
}))

vi.mock('@hooks/useMessage', () => ({
  useMessage: () => ({ errorMess: vi.fn() })
}))

import useTransaction from '../hooks/useTransaction'

const lastPayload = (): Record<string, unknown> =>
  mocks.getUnified.mock.calls[mocks.getUnified.mock.calls.length - 1][0]

describe('Bộ lọc hoàn tiền', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => sessionStorage.clear())

  it('hasRefund "true"/"false" gửi boolean, status FAILED_REFUND gửi nguyên giá trị', () => {
    const { result } = renderHook(() => useTransaction(), {
      wrapper: MemoryRouter
    })

    act(() =>
      result.current.handleSearch({
        hasRefund: 'true',
        status: 'FAILED_REFUND'
      })
    )
    expect(lastPayload()).toEqual(
      expect.objectContaining({
        hasRefund: true,
        status: 'FAILED_REFUND',
        sourceDomain: 'EWALLET'
      })
    )

    act(() => result.current.handleSearch({ hasRefund: 'false' }))
    expect(lastPayload()).toEqual(expect.objectContaining({ hasRefund: false }))
  })

  it('bỏ trống "Có hoàn tiền?" thì không gửi hasRefund', () => {
    const { result } = renderHook(() => useTransaction(), {
      wrapper: MemoryRouter
    })

    act(() => result.current.handleSearch({ hasRefund: '' }))

    expect(lastPayload().hasRefund).toBeUndefined()
  })
})
