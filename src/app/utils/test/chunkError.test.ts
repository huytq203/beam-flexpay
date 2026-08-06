import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  installChunkReloadGuard,
  isChunkLoadError,
  reloadForChunkError
} from '../chunkError'

const reload = vi.fn()

beforeEach(() => {
  sessionStorage.clear()
  reload.mockClear()
  vi.useRealTimers()
  Object.defineProperty(window, 'location', {
    value: { ...window.location, reload },
    writable: true,
    configurable: true
  })
})

describe('isChunkLoadError', () => {
  it('nhận diện lỗi import động thất bại', () => {
    const error = new Error(
      'Failed to fetch dynamically imported module: https://app/assets/DetailUser-abc.js'
    )

    expect(isChunkLoadError(error)).toBe(true)
  })

  it('nhận diện lỗi MIME khi SPA fallback trả index.html cho file .js', () => {
    const error = new Error(
      'Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html".'
    )

    expect(isChunkLoadError(error)).toBe(true)
  })

  it('không nhận nhầm lỗi nghiệp vụ thường', () => {
    expect(isChunkLoadError(new Error('Không tìm thấy dữ liệu'))).toBe(false)
    expect(isChunkLoadError({ status: 404 })).toBe(false)
    expect(isChunkLoadError(undefined)).toBe(false)
  })
})

describe('reloadForChunkError', () => {
  it('reload trang ở lần gọi đầu tiên', () => {
    expect(reloadForChunkError()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('chặn reload lần hai trong cooldown để không lặp vô hạn', () => {
    reloadForChunkError()

    expect(reloadForChunkError()).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('cho reload lại sau khi hết cooldown', () => {
    vi.useFakeTimers()
    reloadForChunkError()

    vi.advanceTimersByTime(10_001)

    expect(reloadForChunkError()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(2)
  })
})

describe('installChunkReloadGuard', () => {
  it('reload và chặn lỗi lan ra khi Vite phát vite:preloadError', () => {
    const cleanup = installChunkReloadGuard()
    const event = new Event('vite:preloadError', { cancelable: true })

    window.dispatchEvent(event)

    expect(reload).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
    cleanup()
  })

  it('để lỗi đi tiếp tới error boundary khi cooldown chặn reload', () => {
    const cleanup = installChunkReloadGuard()
    window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }))

    const second = new Event('vite:preloadError', { cancelable: true })
    window.dispatchEvent(second)

    expect(reload).toHaveBeenCalledTimes(1)
    expect(second.defaultPrevented).toBe(false)
    cleanup()
  })

  it('gỡ listener sau khi cleanup', () => {
    const cleanup = installChunkReloadGuard()
    cleanup()

    window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }))

    expect(reload).not.toHaveBeenCalled()
  })
})
