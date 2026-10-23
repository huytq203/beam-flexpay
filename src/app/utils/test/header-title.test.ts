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

describe('tiêu đề màn Báo cáo phí đầu vào', () => {
  it('có trong headerTitle.json', async () => {
    const titles = (await import('@/app/languages/vi/headerTitle.json')).default as Record<string, unknown>
    const flat = JSON.stringify(titles)
    expect(flat).toContain('"/secure-panel/fee-v4/fee-input-cost-report":"Báo cáo phí đầu vào"')
  })
})
