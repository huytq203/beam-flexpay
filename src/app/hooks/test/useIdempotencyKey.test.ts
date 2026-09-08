import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useIdempotencyKey } from '../useIdempotencyKey'

describe('useIdempotencyKey', () => {
  it('giữ nguyên khoá cho mọi lần lấy trong cùng một thao tác', () => {
    const { result } = renderHook(() => useIdempotencyKey())

    const first = result.current.take()
    expect(result.current.take()).toBe(first)
  })

  it('giữ nguyên khoá qua các lần render lại — bấm gửi lại vẫn là một lệnh', () => {
    const { result, rerender } = renderHook(() => useIdempotencyKey())

    const first = result.current.take()
    rerender()

    expect(result.current.take()).toBe(first)
  })

  it('sinh khoá mới sau khi reset', () => {
    const { result } = renderHook(() => useIdempotencyKey())

    const first = result.current.take()
    act(() => result.current.reset())

    expect(result.current.take()).not.toBe(first)
  })
})
