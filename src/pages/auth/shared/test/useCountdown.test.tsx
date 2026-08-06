import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from '../otp/useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-02T00:00:00Z'))
  })

  afterEach(() => vi.useRealTimers())

  it('tính theo deadline tuyệt đối khi thời gian hệ thống nhảy', () => {
    const { result } = renderHook(() => useCountdown(180))
    expect(result.current.secondsLeft).toBe(180)

    act(() => {
      vi.setSystemTime(new Date('2026-08-02T00:02:31Z'))
      vi.advanceTimersByTime(250)
    })

    expect(result.current.secondsLeft).toBe(29)
  })

  it('restart bằng TTL mới từ response', () => {
    const { result } = renderHook(() => useCountdown(30))

    act(() => result.current.restart(75))

    expect(result.current.secondsLeft).toBe(75)
  })

  it('dọn interval khi unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    const { unmount } = renderHook(() => useCountdown(30))

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
