import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// App phát sự kiện qua `window.events` (xem src/main.tsx) — test không boot main.tsx.
class TestEventEmitter {
  emit(): boolean {
    return true
  }
  on(): this {
    return this
  }
  off(): this {
    return this
  }
}

beforeAll(() => {
  Object.defineProperty(window, 'events', {
    value: new TestEventEmitter(),
    writable: true
  })

  // jsdom chưa có matchMedia — antd đọc giá trị này khi render.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    })
  })

  // jsdom cấp `AbortSignal` của riêng nó, còn `Request` là bản của Node nên từ
  // chối signal "lạ" ngay khi RTK Query dựng request. Test không cần huỷ request
  // giữa chừng nên bỏ signal đi; phần còn lại của `Request` giữ nguyên.
  const NativeRequest = globalThis.Request
  class RequestWithoutForeignSignal extends NativeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      if (init && 'signal' in init) {
        const { signal: _ignored, ...rest } = init
        super(input, rest)
        return
      }
      super(input, init)
    }
  }
  globalThis.Request = RequestWithoutForeignSignal

  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())
