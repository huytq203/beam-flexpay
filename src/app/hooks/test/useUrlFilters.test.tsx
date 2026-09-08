import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useUrlFilters } from '../useUrlFilters'

const KEYS = ['keyword', 'serviceType', 'status'] as const

const wrapperAt = (route: string) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  )

const setup = (route: string) =>
  renderHook(
    () => useUrlFilters({ keys: KEYS, extraClearKeys: ['direction'] }),
    { wrapper: wrapperAt(route) }
  )

describe('useUrlFilters', () => {
  it('đọc bộ lọc từ URL nên F5 không mất', () => {
    const { result } = setup('/fee?keyword=rut&serviceType=EWALLET_WITHDRAWAL')
    expect(result.current.filters).toEqual({
      keyword: 'rut',
      serviceType: 'EWALLET_WITHDRAWAL'
    })
  })

  it('bỏ qua tham số lạ thay vì đẩy thẳng xuống API', () => {
    const { result } = setup('/fee?keyword=rut&dropTable=1')
    expect(result.current.filters).toEqual({ keyword: 'rut' })
  })

  it('đọc trang và số dòng từ URL', () => {
    const { result } = setup('/fee?page=3&size=50')
    expect(result.current.page).toBe(3)
    expect(result.current.size).toBe(50)
  })

  it('rơi về mặc định khi trang trên URL không hợp lệ', () => {
    const { result } = setup('/fee?page=abc&size=-2')
    expect(result.current.page).toBe(1)
    expect(result.current.size).toBe(10)
  })

  it('ghi bộ lọc lên URL và đưa về trang 1', () => {
    const { result } = setup('/fee?page=4')

    act(() => result.current.applyFilters({ keyword: 'nap' }))

    expect(result.current.filters).toEqual({ keyword: 'nap' })
    expect(result.current.page).toBe(1)
  })

  it('bỏ khoá khỏi URL khi giá trị rỗng thay vì gửi chuỗi rỗng', () => {
    const { result } = setup('/fee?keyword=rut&status=ACTIVE')

    act(() => result.current.applyFilters({ keyword: '', status: 'ACTIVE' }))

    expect(result.current.filters).toEqual({ status: 'ACTIVE' })
  })

  it('xoá bộ lọc dọn cả phân trang và khoá phụ như chiều tiền', () => {
    const { result } = setup(
      '/fee?keyword=rut&status=ACTIVE&direction=OUT&page=3&size=50'
    )

    act(() => result.current.clearFilters())

    expect(result.current.filters).toEqual({})
    expect(result.current.page).toBe(1)
    expect(result.current.size).toBe(10)
  })

  it('đổi số dòng mỗi trang thì đưa về trang 1', () => {
    const { result } = setup('/fee?page=5')

    act(() => result.current.setPageSize(20))

    expect(result.current.size).toBe(20)
    expect(result.current.page).toBe(1)
  })

  it('giữ bộ lọc khi chỉ đổi trang', () => {
    const { result } = setup('/fee?keyword=rut')

    act(() => result.current.setPage(2))

    expect(result.current.page).toBe(2)
    expect(result.current.filters).toEqual({ keyword: 'rut' })
  })
})
