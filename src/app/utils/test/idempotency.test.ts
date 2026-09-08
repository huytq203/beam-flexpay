import { describe, expect, it } from 'vitest'

import { createIdempotencyKey } from '../idempotency'

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('createIdempotencyKey', () => {
  it('trả về UUID v4 hợp lệ', () => {
    expect(createIdempotencyKey()).toMatch(UUID_V4)
  })

  it('mỗi lần gọi là một khoá khác nhau', () => {
    const keys = new Set(Array.from({ length: 200 }, createIdempotencyKey))
    expect(keys.size).toBe(200)
  })

  it('vẫn dựng được UUID v4 khi ngữ cảnh không có crypto.randomUUID', () => {
    const original = globalThis.crypto.randomUUID
    Reflect.deleteProperty(globalThis.crypto, 'randomUUID')

    try {
      expect(createIdempotencyKey()).toMatch(UUID_V4)
    } finally {
      Object.defineProperty(globalThis.crypto, 'randomUUID', {
        value: original,
        configurable: true,
        writable: true
      })
    }
  })
})
