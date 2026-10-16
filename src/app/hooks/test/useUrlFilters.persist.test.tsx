import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearListStates, LIST_STATE_PREFIX } from '@utils/list-state-storage'
import { useUrlFilters } from '../useUrlFilters'

const KEYS = ['keyword', 'status', 'phone'] as const

const wrapperAt =
  (route: string) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  )

const setup = (route: string, sensitiveKeys: readonly 'phone'[] = []) =>
  renderHook(
    () => ({
      list: useUrlFilters({ keys: KEYS, sensitiveKeys }),
      location: useLocation()
    }),
    { wrapper: wrapperAt(route) }
  )

const saved = (path: string): unknown => {
  const raw = sessionStorage.getItem(`${LIST_STATE_PREFIX}${path}`)
  return raw ? JSON.parse(raw) : null
}

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('useUrlFilters — giữ trạng thái khi chuyển route', () => {
  it('đổi bộ lọc và trang thì lưu bản sao theo đường dẫn của màn', () => {
    const { result } = setup('/list')
    act(() => result.current.list.applyFilters({ status: 'ACTIVE' }))
    act(() => result.current.list.setPage(3))
    expect(saved('/list')).toEqual({
      query: 'status=ACTIVE&page=3',
      sensitive: {}
    })
  })

  it('vào lại màn với URL trống thì dùng ngay bản sao và ghi lại lên URL', () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}/list`,
      JSON.stringify({ query: 'status=ACTIVE&page=3', sensitive: {} })
    )
    const { result } = setup('/list')
    expect(result.current.list.filters).toEqual({ status: 'ACTIVE' })
    expect(result.current.list.page).toBe(3)
    expect(result.current.location.search).toBe('?status=ACTIVE&page=3')
  })

  it('URL đã có tham số thì URL thắng, không lấy bản sao', () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}/list`,
      JSON.stringify({ query: 'status=ACTIVE&page=3', sensitive: {} })
    )
    const { result } = setup('/list?keyword=abc')
    expect(result.current.list.filters).toEqual({ keyword: 'abc' })
    expect(result.current.list.page).toBe(1)
  })

  it('Xóa bộ lọc thì xóa luôn bản sao, lần sau vào không khôi phục', () => {
    const first = setup('/list')
    act(() => first.result.current.list.applyFilters({ status: 'ACTIVE' }))
    act(() => first.result.current.list.clearFilters())
    expect(saved('/list')).toBeNull()
    first.unmount()
    const again = setup('/list')
    expect(again.result.current.list.filters).toEqual({})
  })

  it('quay về trang 1 không bộ lọc thì bỏ bản sao, không khôi phục trang cũ', () => {
    const { result } = setup('/list')
    act(() => result.current.list.setPage(4))
    act(() => result.current.list.setPage(1))
    expect(saved('/list')).toBeNull()
  })

  it('mỗi màn một bản sao riêng', () => {
    const a = setup('/a')
    act(() => a.result.current.list.applyFilters({ status: 'ACTIVE' }))
    const b = setup('/b')
    expect(b.result.current.list.filters).toEqual({})
  })

  it('ô nhạy cảm không lên URL nhưng vẫn có trong bộ lọc và được khôi phục', () => {
    const first = setup('/list', ['phone'])
    act(() =>
      first.result.current.list.applyFilters({
        phone: '0912345678',
        status: 'ACTIVE'
      })
    )
    expect(first.result.current.location.search).toBe('?status=ACTIVE')
    expect(first.result.current.list.filters).toEqual({
      phone: '0912345678',
      status: 'ACTIVE'
    })
    first.unmount()
    const again = setup('/list', ['phone'])
    expect(again.result.current.list.filters).toEqual({
      phone: '0912345678',
      status: 'ACTIVE'
    })
  })

  it('ô nhạy cảm gõ thẳng trên URL bị bỏ qua', () => {
    const { result } = setup('/list?phone=0912345678', ['phone'])
    expect(result.current.list.filters).toEqual({})
  })

  it('sessionStorage lỗi thì hook vẫn chạy bình thường', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { result } = setup('/list?status=ACTIVE')
    expect(result.current.list.filters).toEqual({ status: 'ACTIVE' })
    act(() => result.current.list.setPage(2))
    expect(result.current.list.page).toBe(2)
  })

  it('clearListStates chỉ xóa bản sao danh sách, giữ khóa khác', () => {
    sessionStorage.setItem(`${LIST_STATE_PREFIX}/a`, '{}')
    sessionStorage.setItem('other', 'x')
    clearListStates()
    expect(sessionStorage.getItem(`${LIST_STATE_PREFIX}/a`)).toBeNull()
    expect(sessionStorage.getItem('other')).toBe('x')
  })

  it('filters giữ tham chiếu khi render lại mà URL không đổi', () => {
    const { result, rerender } = setup('/list?status=ACTIVE')
    const first = result.current.list.filters
    rerender()
    expect(result.current.list.filters).toBe(first)
  })

  it('đổi ô nhạy cảm không có lần render nào mang từ khóa mới với trang cũ', () => {
    const seen: string[] = []
    const { result } = renderHook(
      () => {
        const list = useUrlFilters({ keys: KEYS, sensitiveKeys: ['phone'] })
        seen.push(`${list.filters.phone ?? '-'}@${list.page}`)
        return list
      },
      { wrapper: wrapperAt('/list?page=3') }
    )
    act(() => result.current.applyFilters({ phone: '0912345678' }))
    expect(seen).not.toContain('0912345678@3')
    expect(seen.at(-1)).toBe('0912345678@1')
  })

  it('setPagination đổi cả trang và số dòng trong một lần', () => {
    const { result } = setup('/list')
    act(() => result.current.list.setPagination(3, 50))
    expect(result.current.list.page).toBe(3)
    expect(result.current.list.size).toBe(50)
    expect(result.current.location.search).toBe('?page=3&size=50')
  })

  it('mở link có tham số khác bản sao thì bỏ ô nhạy cảm cũ', () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}/list`,
      JSON.stringify({
        query: 'status=ACTIVE',
        sensitive: { phone: '0912345678' }
      })
    )
    const { result } = setup('/list?status=FAILED', ['phone'])
    expect(result.current.list.filters).toEqual({ status: 'FAILED' })
  })

  it('F5 đúng URL của bản sao thì vẫn giữ ô nhạy cảm', () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}/list`,
      JSON.stringify({
        query: 'status=ACTIVE',
        sensitive: { phone: '0912345678' }
      })
    )
    const { result } = setup('/list?status=ACTIVE', ['phone'])
    expect(result.current.list.filters).toEqual({
      status: 'ACTIVE',
      phone: '0912345678'
    })
  })

  it('khôi phục giữ lại tham số lạ đang có trên URL', () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}/list`,
      JSON.stringify({ query: 'status=ACTIVE&page=3', sensitive: {} })
    )
    const { result } = setup('/list?tab=history')
    expect(result.current.list.filters).toEqual({ status: 'ACTIVE' })
    expect(result.current.list.page).toBe(3)
    const params = new URLSearchParams(result.current.location.search)
    expect(params.get('tab')).toBe('history')
    expect(params.get('status')).toBe('ACTIVE')
  })
})
