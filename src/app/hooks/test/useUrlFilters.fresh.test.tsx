import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { FRESH_LIST_STATE, LIST_STATE_PREFIX } from '@utils/list-state-storage'
import { useUrlFilters } from '../useUrlFilters'

const KEYS = ['keyword', 'status', 'phone'] as const
const SAVED = { query: 'status=ACTIVE&page=3', sensitive: { phone: '0912' } }

type Entry = string | { pathname: string; state?: unknown }

const setup = (entry: Entry) =>
  renderHook(
    () => ({
      list: useUrlFilters({ keys: KEYS, sensitiveKeys: ['phone'] }),
      location: useLocation(),
      navigate: useNavigate()
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
      )
    }
  )

const save = (path: string): void =>
  sessionStorage.setItem(`${LIST_STATE_PREFIX}${path}`, JSON.stringify(SAVED))

const saved = (path: string): string | null =>
  sessionStorage.getItem(`${LIST_STATE_PREFIX}${path}`)

afterEach(() => sessionStorage.clear())

describe('useUrlFilters — bấm menu sidebar thì mở màn từ đầu', () => {
  it('vào màn bằng link sidebar thì không khôi phục và xoá bản sao', () => {
    save('/list')
    const { result } = setup({ pathname: '/list', state: FRESH_LIST_STATE })

    expect(result.current.list.filters).toEqual({})
    expect(result.current.list.page).toBe(1)
    expect(result.current.location.search).toBe('')
    expect(saved('/list')).toBeNull()
  })

  it('bấm lại menu của chính màn đang mở thì bỏ bộ lọc đang áp', () => {
    save('/list')
    const { result } = setup('/list')
    expect(result.current.list.filters).toEqual({
      status: 'ACTIVE',
      phone: '0912'
    })

    act(() => result.current.navigate('/list', { state: FRESH_LIST_STATE }))

    expect(result.current.list.filters).toEqual({})
    expect(result.current.list.page).toBe(1)
    expect(saved('/list')).toBeNull()
  })

  it('lọc sau khi vào từ sidebar vẫn được lưu và khôi phục khi quay lại', () => {
    const { result } = setup({ pathname: '/list', state: FRESH_LIST_STATE })

    act(() => result.current.list.applyFilters({ keyword: 'abc' }))
    act(() => result.current.navigate('/other'))
    act(() => result.current.navigate('/list'))

    expect(result.current.list.filters).toEqual({ keyword: 'abc' })
  })

  it('đường đi thường (Back, breadcrumb) vẫn khôi phục bản sao', () => {
    save('/list')
    const { result } = setup('/list')

    expect(result.current.list.page).toBe(3)
    expect(result.current.list.filters).toEqual({
      status: 'ACTIVE',
      phone: '0912'
    })
  })
})
