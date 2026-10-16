import Cookies from 'js-cookie'
import Swal from 'sweetalert2'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieKey } from '@configs/fetchBaseQuery.types'

const tokenWithExp = (secondsFromNow: number, sub = 'u1'): string => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=+$/, '')
  const exp = Math.floor(Date.now() / 1000) + secondsFromNow
  return `${encode({ alg: 'none' })}.${encode({ exp, sub })}.sig`
}

const loadModule = async () => {
  vi.resetModules()
  return import('../fetchBaseQueryCustom')
}

beforeEach(() => {
  Cookies.remove(CookieKey.ACCESS_TOKEN)
  Cookies.remove(CookieKey.REFRESH_TOKEN)
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('nhiều tab dùng chung một phiên', () => {
  it('access token trong cookie còn hạn (tab khác vừa lấy) thì dùng lại, không gọi refresh', async () => {
    const { refreshAccessToken } = await loadModule()
    const fresh = tokenWithExp(300)
    Cookies.set(CookieKey.ACCESS_TOKEN, fresh)
    Cookies.set(CookieKey.REFRESH_TOKEN, 'rt-1')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const dispatch = vi.fn()

    await expect(refreshAccessToken(dispatch, 'token-cu-bi-401')).resolves.toBe(
      fresh
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('cookie vẫn là chính token vừa bị 401 thì mới gọi refresh', async () => {
    const { refreshAccessToken } = await loadModule()
    const stale = tokenWithExp(300)
    const renewed = tokenWithExp(300, 'u2')
    Cookies.set(CookieKey.ACCESS_TOKEN, stale)
    Cookies.set(CookieKey.REFRESH_TOKEN, 'rt-1')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { accessToken: renewed } }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    )

    await expect(refreshAccessToken(vi.fn(), stale)).resolves.toBe(renewed)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('refresh chạy trong khóa dùng chung giữa các tab (Web Locks)', async () => {
    const { refreshAccessToken } = await loadModule()
    const request = vi.fn((_name: string, task: () => Promise<unknown>) =>
      task()
    )
    vi.stubGlobal('navigator', { ...navigator, locks: { request } })
    Cookies.set(CookieKey.ACCESS_TOKEN, tokenWithExp(300))

    await refreshAccessToken(vi.fn())
    expect(request).toHaveBeenCalledWith(
      'flexpay-auth-refresh',
      expect.any(Function)
    )
  })

  it('tab khác vào trang đăng nhập (xóa last_activity_time) không bật popup hết phiên', async () => {
    const { initInactivityTracker } = await loadModule()
    const fire = vi.spyOn(Swal, 'fire')
    initInactivityTracker()
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'last_activity_time', newValue: null })
    )
    expect(fire).not.toHaveBeenCalled()
  })

  it('tab khác đăng xuất thật thì tab này bật popup hết phiên', async () => {
    const { initInactivityTracker, LOGOUT_SIGNAL_KEY } = await loadModule()
    const fire = vi
      .spyOn(Swal, 'fire')
      .mockReturnValue(new Promise(() => {}) as ReturnType<typeof Swal.fire>)
    initInactivityTracker()
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LOGOUT_SIGNAL_KEY,
        newValue: String(Date.now())
      })
    )
    // vi.resetModules giữ lại listener của bản module ở test trước trên window,
    // nên chỉ khẳng định là có bật popup.
    expect(fire).toHaveBeenCalled()
  })
})
