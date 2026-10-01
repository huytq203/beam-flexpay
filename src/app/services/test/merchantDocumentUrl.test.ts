import { describe, expect, it } from 'vitest'
import { getLiveMerchantDocumentUrl } from '../merchantDocumentUrl'

describe('merchant document URL', () => {
  it('dùng URL trong response khi còn hạn và bỏ qua URL đã hết hạn', () => {
    expect(
      getLiveMerchantDocumentUrl({
        url: 'https://files.test/a',
        urlExpiresAt: '2099-01-01T00:00:00Z'
      })
    ).toBe('https://files.test/a')
    expect(
      getLiveMerchantDocumentUrl({
        url: 'https://files.test/a',
        urlExpiresAt: '2020-01-01T00:00:00Z'
      })
    ).toBeNull()
  })
})
