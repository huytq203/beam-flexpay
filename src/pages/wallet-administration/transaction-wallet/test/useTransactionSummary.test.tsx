import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUnified: vi.fn(),
  summary: {
    totalCount: 477,
    successCount: 412,
    processingCount: 62,
    pendingCount: 62,
    failedCount: 3
  }
}))

vi.mock('../../../../app/services/apiJournal', () => ({
  useGetUnifiedInlineErrorQuery: (params: Record<string, unknown>) => {
    mocks.getUnified(params)
    return {
      data: { content: [], totalElements: 477, summary: mocks.summary },
      isFetching: false,
      isLoading: false,
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

const lastPayload = () =>
  mocks.getUnified.mock.calls[mocks.getUnified.mock.calls.length - 1][0]

describe('useTransaction — dải tổng quan', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => sessionStorage.clear())

  it('xin khối summary và trả thẳng ra cho màn', () => {
    const { result } = renderHook(() => useTransaction(), {
      wrapper: MemoryRouter
    })

    expect(lastPayload()).toEqual(
      expect.objectContaining({ includeSummary: true })
    )
    expect(result.current.summary).toEqual(mocks.summary)
  })

  it('bấm một ô thì lọc theo status đó và giữ nguyên phần bộ lọc còn lại', () => {
    const { result } = renderHook(() => useTransaction(), {
      wrapper: MemoryRouter
    })

    act(() => result.current.handleSummaryStatusChange('FAILED'))

    expect(lastPayload()).toEqual(
      expect.objectContaining({
        status: 'FAILED',
        sourceDomain: 'EWALLET',
        page: 1
      })
    )
    expect(result.current.activeStatus).toBe('FAILED')
  })

  it('bỏ chọn thì gỡ hẳn status khỏi payload chứ không gửi chuỗi rỗng', () => {
    const { result } = renderHook(() => useTransaction(), {
      wrapper: MemoryRouter
    })

    act(() => result.current.handleSummaryStatusChange('PENDING'))
    act(() => result.current.handleSummaryStatusChange())

    expect(lastPayload()).toEqual(
      expect.not.objectContaining({ status: expect.anything() })
    )
    expect(result.current.activeStatus).toBeUndefined()
  })
})
