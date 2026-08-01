import type { PropsWithChildren } from 'react'
import { act, renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/app/store'
import { OtpFlowStatus } from './types'
import { useOtpChallenge } from './useOtpChallenge'

const challenge = {
  requestId: 'request-1',
  maskedRecipient: 'a***@flexpay.vn',
  expiresIn: 180,
  canResendAfter: 0,
  resendRemaining: 3
}

const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={createAppStore()}>{children}</Provider>
)

describe('useOtpChallenge', () => {
  it('xóa mã, báo lỗi và tăng nonce khi OTP sai', async () => {
    const verifyOtp = vi.fn().mockRejectedValue({
      status: 400,
      data: {
        status: '22101',
        detail: 'Mã OTP không chính xác. Bạn còn 4 lần thử.'
      }
    })
    const { result } = renderHook(
      () =>
        useOtpChallenge({
          initialChallenge: challenge,
          verifyOtp,
          onVerified: vi.fn()
        }),
      { wrapper }
    )

    await act(() => result.current.verify('123456'))

    expect(result.current.otp).toBe('')
    expect(result.current.error).toContain('còn 4 lần thử')
    expect(result.current.errorNonce).toBe(1)
  })

  it('chuyển sang trạng thái khóa theo Retry-After', async () => {
    const verifyOtp = vi.fn().mockRejectedValue({
      status: 429,
      data: { status: '22112', retryAfter: 900 }
    })
    const { result } = renderHook(
      () =>
        useOtpChallenge({
          initialChallenge: challenge,
          verifyOtp,
          onVerified: vi.fn()
        }),
      { wrapper }
    )

    await act(() => result.current.verify('123456'))

    expect(result.current.status).toBe(OtpFlowStatus.LOCKED)
    expect(result.current.lockedFor).toBe(900)
  })

  it('giữ nguyên mã khi mất mạng để người dùng bấm lại', async () => {
    const verifyOtp = vi.fn().mockRejectedValue({
      status: 'FETCH_ERROR',
      error: 'offline'
    })
    const { result } = renderHook(
      () =>
        useOtpChallenge({
          initialChallenge: challenge,
          verifyOtp,
          onVerified: vi.fn()
        }),
      { wrapper }
    )

    act(() => result.current.setOtp('123456'))
    await act(() => result.current.verify())

    expect(result.current.otp).toBe('123456')
    expect(result.current.error).toContain('Không kết nối được máy chủ')
  })

  it('cập nhật TTL và số lượt từ response gửi lại', async () => {
    const { result } = renderHook(
      () =>
        useOtpChallenge({
          initialChallenge: challenge,
          verifyOtp: vi.fn(),
          onVerified: vi.fn()
        }),
      { wrapper }
    )

    await act(() => result.current.resend())

    expect(result.current.challenge.resendRemaining).toBe(2)
    expect(result.current.cooldown).toBe(60)
  })
})
