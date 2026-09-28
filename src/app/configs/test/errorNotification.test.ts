import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import { notification } from 'antd'
import { fetchBaseQueryMerchant } from '@configs/fetchBaseQueryCustom'

const apiStub: BaseQueryApi = {
  signal: new AbortController().signal,
  abort: vi.fn(),
  dispatch: vi.fn(),
  getState: () => ({ auth: { accessToken: null } }),
  extra: undefined,
  endpoint: 'resetMerchantUserPassword',
  type: 'mutation',
  forced: false
}

const REQUEST = { url: '/merchant-users/user-1/reset-password', method: 'POST' }

describe('notification lỗi tập trung của base query', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ message: 'Merchant user must be active' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' }
        }
      )
    )
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('hiện notification khi không truyền option', async () => {
    const errorSpy = vi.spyOn(notification, 'error').mockImplementation(vi.fn())

    await fetchBaseQueryMerchant(REQUEST, apiStub, {})

    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('không hiện notification khi suppressErrorNotification = true', async () => {
    const errorSpy = vi.spyOn(notification, 'error').mockImplementation(vi.fn())

    const result = await fetchBaseQueryMerchant(REQUEST, apiStub, {
      suppressErrorNotification: true
    })

    expect(errorSpy).not.toHaveBeenCalled()
    expect(result.error?.status).toBe(400)
  })
})
