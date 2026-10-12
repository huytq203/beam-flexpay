import { describe, expect, it } from 'vitest'
import { resolveHeaderTitleKey } from '../header-title'

const TITLES = new Set([
  '/fee-v4/wallet-limit',
  '/fee-v4/wallet-limit/*/edit',
  '/fee-v4/wallet-limit/*/history',
  '/fee-v4/wallet-limit/*'
])
const has = (key: string) => TITLES.has(key)

describe('resolveHeaderTitleKey', () => {
  it('khớp đường dẫn nguyên văn', () => {
    expect(resolveHeaderTitleKey('/fee-v4/wallet-limit', has)).toBe(
      '/fee-v4/wallet-limit'
    )
  })

  it('khớp wildcard ở segment cuối', () => {
    expect(resolveHeaderTitleKey('/fee-v4/wallet-limit/abc', has)).toBe(
      '/fee-v4/wallet-limit/*'
    )
  })

  it('khớp wildcard ở giữa đường dẫn', () => {
    expect(resolveHeaderTitleKey('/fee-v4/wallet-limit/abc/edit', has)).toBe(
      '/fee-v4/wallet-limit/*/edit'
    )
  })

  it('trả null khi không có key nào khớp', () => {
    expect(resolveHeaderTitleKey('/khong/co', has)).toBeNull()
  })
})
