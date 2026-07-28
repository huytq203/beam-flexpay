import { afterEach, describe, expect, it, vi } from 'vitest'
import { globalMessage } from '@hooks/useMessage'
import { errorMiddleware } from '../errorMiddleware'

const rejectedAction = (endpointName: string) => ({
  type: 'authApi/executeMutation/rejected',
  payload: { status: 'FETCH_ERROR', error: 'offline' },
  meta: {
    rejectedWithValue: true,
    requestId: 'request-1',
    requestStatus: 'rejected',
    arg: { endpointName }
  }
})

const runMiddleware = (endpointName: string) => {
  const next = vi.fn()
  const dispatch = vi.fn()
  errorMiddleware({ dispatch, getState: vi.fn() })(next)(
    rejectedAction(endpointName)
  )
  return { next, dispatch }
}

describe('errorMiddleware', () => {
  afterEach(() => vi.restoreAllMocks())

  it.each([
    'adminChangePassword',
    'adminForgotPassword',
    'validateAdminResetToken',
    'resetAdminPassword'
  ])('để endpoint %s tự hiển thị lỗi trong form', (endpointName) => {
    const showGlobalError = vi.spyOn(globalMessage, 'error')

    const { next } = runMiddleware(endpointName)

    expect(showGlobalError).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledOnce()
  })

  it('vẫn hiển thị lỗi toàn cục cho endpoint thông thường', () => {
    const showGlobalError = vi.spyOn(globalMessage, 'error')

    runMiddleware('updateProfile')

    expect(showGlobalError).toHaveBeenCalledWith(
      'Có lỗi xảy ra, vui lòng thử lại'
    )
  })
})
