import { describe, expect, it } from 'vitest'
import { buildWalletSearchFilters } from '../../utils/wallet-search'

describe('buildWalletSearchFilters', () => {
  it('chuyển trạng thái đã eKYC thành boolean true', () => {
    expect(buildWalletSearchFilters({ verifyEKYC: 'true' })).toEqual({
      verifyEKYC: true
    })
  })

  it('chuyển trạng thái chưa eKYC thành boolean false', () => {
    expect(buildWalletSearchFilters({ verifyEKYC: 'false' })).toEqual({
      verifyEKYC: false
    })
  })

  it('không gửi verifyEKYC khi người dùng chưa chọn bộ lọc', () => {
    expect(buildWalletSearchFilters({ username: 'flexpay-user' })).toEqual({
      username: 'flexpay-user'
    })
  })
})
