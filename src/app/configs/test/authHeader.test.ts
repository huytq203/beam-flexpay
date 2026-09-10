import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import Cookies from 'js-cookie'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import {
  baseQueryWalletCore,
  refreshAccessToken
} from '@configs/fetchBaseQueryCustom'
import { updateAccessToken } from '@slices/authActions'

const createApiStub = (accessToken: string | null): BaseQueryApi => ({
  signal: new AbortController().signal,
  abort: vi.fn(),
  dispatch: vi.fn(),
  getState: () => ({ auth: { accessToken } }),
  extra: undefined,
  endpoint: 'getUnified',
  type: 'query',
  forced: false
})

const sentAuthorizationHeader = async (
  api: BaseQueryApi
): Promise<string | null> => {
  const fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response('{}', { status: 200 }))

  await baseQueryWalletCore('/wallet/journal/unified', api, {})

  const request = fetchSpy.mock.calls[0]?.[0]
  return request instanceof Request ? request.headers.get('authorization') : null
}

describe('Authorization header của base query', () => {
  beforeEach(() => {
    Cookies.remove(CookieKey.ACCESS_TOKEN)
    Cookies.remove(CookieKey.REFRESH_TOKEN)
  })
  afterEach(() => {
    vi.restoreAllMocks()
    Cookies.remove(CookieKey.ACCESS_TOKEN)
    Cookies.remove(CookieKey.REFRESH_TOKEN)
  })

  it('lấy token từ cookie khi cookie còn', async () => {
    Cookies.set(CookieKey.ACCESS_TOKEN, 'token-cookie')

    const header = await sentAuthorizationHeader(createApiStub('token-store'))

    expect(header).toBe('Bearer token-cookie')
  })

  it('fallback sang token trong store khi cookie đã hết hạn', async () => {
    const header = await sentAuthorizationHeader(createApiStub('token-store'))

    expect(header).toBe('Bearer token-store')
  })

  it('không gắn header khi không còn token ở cả cookie lẫn store', async () => {
    const header = await sentAuthorizationHeader(createApiStub(null))

    expect(header).toBeNull()
  })

  it('đổi refresh token lấy access token mới và cập nhật Redux', async () => {
    Cookies.set(CookieKey.REFRESH_TOKEN, 'refresh-token')
    const dispatch = vi.fn()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            accessToken: 'new-access-token',
            expiresIn: 300,
            refreshToken: 'rotated-refresh-token',
            refreshExpiresIn: 7200
          }
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      )
    )

    await expect(refreshAccessToken(dispatch)).resolves.toBe('new-access-token')
    expect(dispatch).toHaveBeenCalledWith(
      updateAccessToken({
        token: 'new-access-token',
        expiresIn: 300,
        refreshExpiresIn: 7200
      })
    )
    expect(Cookies.get(CookieKey.REFRESH_TOKEN)).toBe('rotated-refresh-token')
  })
})
