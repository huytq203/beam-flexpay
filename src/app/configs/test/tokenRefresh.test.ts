import Cookies from 'js-cookie'
import Swal from 'sweetalert2'
import { notification } from 'antd'
import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CookieKey,
  persistAccessTokenCookie
} from '@configs/fetchBaseQuery.types'
import {
  REFRESH_TIMEOUT_MS,
  fetchBaseQueryMerchant,
  requestTokenRefresh
} from '@configs/fetchBaseQueryCustom'

// i18n chưa khởi tạo trong test: trả nguyên key để khẳng định được nội dung thông báo.
vi.mock('i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('i18next')>()),
  t: (key: string) => key
}))

const jsonResponse = (status: number, body: object = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  })

const apiStub: BaseQueryApi = {
  signal: new AbortController().signal,
  abort: vi.fn(),
  dispatch: vi.fn(),
  getState: () => ({ auth: { accessToken: null } }),
  extra: undefined,
  endpoint: 'getMerchants',
  type: 'query',
  forced: false
}

const REQUEST = { url: '/merchants', method: 'GET' }

beforeEach(() => {
  Cookies.remove(CookieKey.ACCESS_TOKEN)
  Cookies.set(CookieKey.REFRESH_TOKEN, 'rt-1')
  vi.spyOn(console, 'error').mockImplementation(vi.fn())
})

afterEach(() => {
  Cookies.remove(CookieKey.REFRESH_TOKEN)
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('requestTokenRefresh phân loại lỗi', () => {
  it('BE từ chối refresh token (401) → expired', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(401))

    await expect(requestTokenRefresh(vi.fn())).resolves.toEqual({
      status: 'expired'
    })
  })

  it('BE auth lỗi 5xx → unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(503))

    await expect(requestTokenRefresh(vi.fn())).resolves.toEqual({
      status: 'unavailable'
    })
  })

  it('lỗi mạng → unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('Failed to fetch')
    )

    await expect(requestTokenRefresh(vi.fn())).resolves.toEqual({
      status: 'unavailable'
    })
  })

  it('request refresh treo quá thời gian chờ → hủy và trả unavailable', async () => {
    vi.useFakeTimers()
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          )
        })
    )

    const pending = requestTokenRefresh(vi.fn())
    await vi.advanceTimersByTimeAsync(REFRESH_TIMEOUT_MS)

    await expect(pending).resolves.toEqual({ status: 'unavailable' })
  })
})

describe('base query khi gặp 401', () => {
  it('refresh lỗi tạm thời → báo lỗi, không bật popup hết phiên', async () => {
    const fire = vi.spyOn(Swal, 'fire')
    const errorSpy = vi.spyOn(notification, 'error').mockImplementation(vi.fn())
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(jsonResponse(502))

    const result = await fetchBaseQueryMerchant(REQUEST, apiStub, {})

    expect(result.error?.status).toBe(401)
    expect(fire).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('session-refresh-unavailable')
      })
    )
  })

  it('refresh thành công nhưng retry lỗi 500 → vẫn hiện thông báo lỗi', async () => {
    const errorSpy = vi.spyOn(notification, 'error').mockImplementation(vi.fn())
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(
        jsonResponse(200, { data: { accessToken: 'at-moi' } })
      )
      .mockResolvedValueOnce(jsonResponse(500, { message: 'Lỗi hệ thống' }))

    const result = await fetchBaseQueryMerchant(REQUEST, apiStub, {})

    expect(result.error?.status).toBe(500)
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Lỗi hệ thống' })
    )
  })
})

describe('persistAccessTokenCookie', () => {
  it('ghi cookie kèm sameSite strict', () => {
    const setSpy = vi.spyOn(Cookies, 'set')

    persistAccessTokenCookie('at-1', 1800)

    expect(setSpy).toHaveBeenCalledWith(
      CookieKey.ACCESS_TOKEN,
      'at-1',
      expect.objectContaining({ sameSite: 'strict', secure: false })
    )
  })
})
