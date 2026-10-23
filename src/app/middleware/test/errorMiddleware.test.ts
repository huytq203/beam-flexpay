import { afterEach, describe, expect, it, vi } from 'vitest'
import { globalMessage } from '@hooks/useMessage'
import Cookies from 'js-cookie'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import { errorMiddleware } from '../errorMiddleware'

const rejectedAction = (
  endpointName: string,
  status: number | 'FETCH_ERROR' = 'FETCH_ERROR'
) => ({
  type: 'authApi/executeMutation/rejected',
  payload: { status, error: 'offline' },
  meta: {
    rejectedWithValue: true,
    requestId: 'request-1',
    requestStatus: 'rejected',
    arg: { endpointName }
  }
})

const runMiddleware = (
  endpointName: string,
  status?: number | 'FETCH_ERROR'
) => {
  const next = vi.fn()
  const dispatch = vi.fn()
  errorMiddleware({ dispatch, getState: vi.fn() })(next)(
    rejectedAction(endpointName, status)
  )
  return { next, dispatch }
}

describe('errorMiddleware', () => {
  afterEach(() => vi.restoreAllMocks())

  it.each([
    'adminChangePassword',
    'adminForgotPassword',
    'validateAdminResetToken',
    'resetAdminPassword',
    'getCurrentWeather',
    'getRefunds',
    'getRefundDetail',
    'approveRefund',
    'rejectRefund',
    'settleRefund',
    'refreshRefundPayout',
    'updateStuckTransactionStatus',
    'uploadStuckTransactionReceipt',
    'getStuckTransactionReceipt'
  ])('để endpoint %s tự hiển thị lỗi trong form', (endpointName) => {
    const showGlobalError = vi.spyOn(globalMessage, 'error')

    const { next } = runMiddleware(endpointName)

    expect(showGlobalError).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledOnce()
  })

  it.each([404, 429, 503])(
    'không hiện toast weather khi API trả status %i',
    (status) => {
      const showGlobalError = vi.spyOn(globalMessage, 'error')
      const showGlobalWarning = vi.spyOn(globalMessage, 'warning')

      runMiddleware('getCurrentWeather', status)

      expect(showGlobalError).not.toHaveBeenCalled()
      expect(showGlobalWarning).not.toHaveBeenCalled()
    }
  )

  it('vẫn hiển thị lỗi toàn cục cho endpoint thông thường', () => {
    const showGlobalError = vi.spyOn(globalMessage, 'error')

    runMiddleware('updateProfile')

    expect(showGlobalError).toHaveBeenCalledWith(
      'Có lỗi xảy ra, vui lòng thử lại'
    )
  })

  it('tự động chuyển sang màn forbidden khi API nghiệp vụ trả 403', () => {
    const previousPath = window.location.pathname
    Cookies.set(CookieKey.ACCESS_TOKEN, 'access-token')
    const replaceState = vi.spyOn(window.history, 'replaceState')
    const dispatchEvent = vi.spyOn(window, 'dispatchEvent')
    const showGlobalError = vi.spyOn(globalMessage, 'error')

    runMiddleware('getTransactions', 403)

    expect(replaceState).toHaveBeenCalledWith(
      expect.objectContaining({
        usr: expect.objectContaining({
          forbiddenFrom: previousPath,
          forbiddenEndpoint: 'getTransactions'
        })
      }),
      '',
      '/secure-panel/forbidden'
    )
    expect(dispatchEvent).toHaveBeenCalledWith(expect.any(PopStateEvent))
    expect(showGlobalError).not.toHaveBeenCalled()

    window.history.replaceState({}, '', previousPath)
    Cookies.remove(CookieKey.ACCESS_TOKEN)
  })

  it.each([
    'getRefunds',
    'getRefundDetail',
    'createRefund',
    'approveRefund',
    'rejectRefund',
    'settleRefund',
    'refreshRefundPayout',
    'refreshTransaction',
    'updateStuckTransactionStatus',
    'uploadStuckTransactionReceipt',
    'getStuckTransactionReceipt'
  ])(
    '403 của %s hiện tại chỗ, không đá sang /forbidden và không toast',
    (name) => {
      Cookies.set(CookieKey.ACCESS_TOKEN, 'access-token')
      const replaceState = vi.spyOn(window.history, 'replaceState')
      const showGlobalError = vi.spyOn(globalMessage, 'error')
      const { next } = runMiddleware(name, 403)

      expect(replaceState).not.toHaveBeenCalled()
      expect(showGlobalError).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
      Cookies.remove(CookieKey.ACCESS_TOKEN)
    }
  )

  it('getUnifiedInlineError tắt toast nhưng 403 vẫn đá sang /forbidden', () => {
    const previousPath = window.location.pathname
    Cookies.set(CookieKey.ACCESS_TOKEN, 'access-token')
    const showGlobalError = vi.spyOn(globalMessage, 'error')
    runMiddleware('getUnifiedInlineError', 500)
    expect(showGlobalError).not.toHaveBeenCalled()

    const replaceState = vi.spyOn(window.history, 'replaceState')
    runMiddleware('getUnifiedInlineError', 403)
    expect(replaceState).toHaveBeenCalled()

    window.history.replaceState({}, '', previousPath)
    Cookies.remove(CookieKey.ACCESS_TOKEN)
  })

  it('getUnified (màn khác chưa tự báo lỗi) vẫn hiện toast', () => {
    const showGlobalError = vi.spyOn(globalMessage, 'error')
    runMiddleware('getUnified', 500)
    expect(showGlobalError).toHaveBeenCalled()
  })
})
