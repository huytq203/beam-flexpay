import { describe, expect, it, vi } from 'vitest'
import {
  getLiveMerchantDocumentUrl,
  resolveLiveDocumentUrl
} from '../merchantDocumentUrl'

const LIVE = {
  url: 'https://files.test/a',
  urlExpiresAt: '2099-01-01T00:00:00Z'
}
const EXPIRED = {
  url: 'https://files.test/old',
  urlExpiresAt: '2020-01-01T00:00:00Z'
}

describe('merchant document URL', () => {
  it('dùng URL trong response khi còn hạn và bỏ qua URL đã hết hạn', () => {
    expect(getLiveMerchantDocumentUrl(LIVE)).toBe('https://files.test/a')
    expect(getLiveMerchantDocumentUrl(EXPIRED)).toBeNull()
  })

  it('không làm mới response khi URL hiện tại còn hạn', async () => {
    const refresh = vi.fn()
    await expect(resolveLiveDocumentUrl(LIVE, refresh)).resolves.toBe(
      'https://files.test/a'
    )
    expect(refresh).not.toHaveBeenCalled()
  })

  it('làm mới response một lần khi URL đã hết hạn', async () => {
    const refresh = vi.fn().mockResolvedValue(LIVE)
    await expect(resolveLiveDocumentUrl(EXPIRED, refresh)).resolves.toBe(
      'https://files.test/a'
    )
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('báo lỗi khi sau khi làm mới vẫn không có URL còn hạn', async () => {
    await expect(
      resolveLiveDocumentUrl(EXPIRED, async () => EXPIRED)
    ).rejects.toThrow('Document read link is unavailable')
    await expect(
      resolveLiveDocumentUrl(undefined, async () => undefined)
    ).rejects.toThrow('Document read link is unavailable')
  })
})
