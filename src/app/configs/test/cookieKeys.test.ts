import Cookies from 'js-cookie'
import { afterEach, describe, expect, it } from 'vitest'
import {
  CookieKey,
  persistAccessTokenCookie,
  setRefreshTokenCookie
} from '../fetchBaseQuery.types'

// Cookie chỉ tách theo host, không tách theo port. merchant-cms-web (localhost:3000)
// ghi cookie HttpOnly tên `access_token` / `refresh_token` trên cùng host `localhost`,
// nên CMS này đọc không thấy và ghi không đè được → F5 là mất phiên.
const SHARED_GENERIC_NAMES = ['access_token', 'refresh_token']

describe('tên cookie phiên của CMS', () => {
  afterEach(() => {
    Cookies.remove(CookieKey.ACCESS_TOKEN, { path: '/' })
    Cookies.remove(CookieKey.REFRESH_TOKEN, { path: '/' })
  })

  it('không dùng tên chung dễ đụng với ứng dụng khác trên cùng localhost', () => {
    expect(SHARED_GENERIC_NAMES).not.toContain(CookieKey.ACCESS_TOKEN)
    expect(SHARED_GENERIC_NAMES).not.toContain(CookieKey.REFRESH_TOKEN)
  })

  it('ghi rồi đọc lại được cả hai token', () => {
    persistAccessTokenCookie('access-value')
    setRefreshTokenCookie('refresh-value')

    expect(Cookies.get(CookieKey.ACCESS_TOKEN)).toBe('access-value')
    expect(Cookies.get(CookieKey.REFRESH_TOKEN)).toBe('refresh-value')
  })
})
