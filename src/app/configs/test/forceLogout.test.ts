import { afterEach, describe, expect, it, vi } from 'vitest'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import { forceLogout } from '../fetchBaseQueryCustom'

afterEach(() => {
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe('forceLogout', () => {
  it('hết phiên thì xóa bản sao bộ lọc để người đăng nhập sau không thấy dữ liệu cũ', () => {
    vi.stubGlobal('location', { href: '/' })
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}/secure-panel/wallet-administration/confirm-eKYC`,
      JSON.stringify({ query: '', sensitive: { keyword: '001099012345' } })
    )
    forceLogout()
    expect(
      sessionStorage.getItem(
        `${LIST_STATE_PREFIX}/secure-panel/wallet-administration/confirm-eKYC`
      )
    ).toBeNull()
  })
})
