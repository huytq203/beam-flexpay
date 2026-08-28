import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useFetchData from '../hooks/useFetchDataHistory'

const mocks = vi.hoisted(() => ({
  useGetUnifiedQuery: vi.fn()
}))

vi.mock('@hooks/usePagination', () => ({
  default: () => ({
    page: 1,
    size: 10,
    setPage: vi.fn(),
    setPageSize: vi.fn()
  })
}))

vi.mock('@services/apiJournal', () => ({
  useGetUnifiedQuery: mocks.useGetUnifiedQuery
}))

describe('useFetchDataHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useGetUnifiedQuery.mockReturnValue({
      data: { content: [] },
      isLoading: false
    })
  })

  it('lọc journal bằng partyId và giữ các filter của lưới', () => {
    renderHook(() => useFetchData({
      partyId: 'party-1',
      searchParams: {
        paymentMethod: 'LINKED_ACCOUNT',
        status: 'SETTLED'
      }
    }))

    expect(mocks.useGetUnifiedQuery).toHaveBeenCalledWith({
      partyId: 'party-1',
      page: 1,
      size: 10,
      paymentMethod: 'LINKED_ACCOUNT',
      status: 'SETTLED'
    })
  })
})
