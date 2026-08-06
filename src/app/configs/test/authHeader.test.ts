import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import Cookies from 'js-cookie'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import { baseQueryWalletCore } from '@configs/fetchBaseQueryCustom'

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
  beforeEach(() => Cookies.remove(CookieKey.ACCESS_TOKEN))
  afterEach(() => {
    vi.restoreAllMocks()
    Cookies.remove(CookieKey.ACCESS_TOKEN)
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
})
