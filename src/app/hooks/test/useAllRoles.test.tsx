import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { http, HttpResponse } from 'msw'
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { ROLE_FIRST_PAGE_SIZE, useAllRoles } from '../useAllRoles'

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createAppStore()}>{children}</Provider>
)

const makeRoles = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${index}`,
    name: `ROLE_${index}`,
    description: ''
  }))

/** Ghi lại `size` của từng lần gọi để kiểm tra hook có gọi thừa hay không. */
const mockRoles = (totalElements: number): number[] => {
  const requestedSizes: number[] = []
  server.use(
    http.get('*/roles', ({ request }) => {
      const size = Number(new URL(request.url).searchParams.get('size'))
      requestedSizes.push(size)
      return HttpResponse.json({
        data: {
          content: makeRoles(Math.min(size, totalElements)),
          totalElements
        }
      })
    })
  )
  return requestedSizes
}

describe('useAllRoles', () => {
  it('chỉ gọi một lần khi tổng role không vượt trang đầu', async () => {
    const requestedSizes = mockRoles(5)

    const { result } = renderHook(() => useAllRoles(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.roles).toHaveLength(5)
    expect(result.current.totalRoles).toBe(5)
    expect(requestedSizes).toEqual([ROLE_FIRST_PAGE_SIZE])
  })

  it('gọi lại đúng bằng totalElements khi vượt trang đầu', async () => {
    const total = ROLE_FIRST_PAGE_SIZE + 20
    const requestedSizes = mockRoles(total)

    const { result } = renderHook(() => useAllRoles(), { wrapper })

    await waitFor(() => expect(result.current.roles).toHaveLength(total))
    expect(requestedSizes).toEqual([ROLE_FIRST_PAGE_SIZE, total])
  })
})
