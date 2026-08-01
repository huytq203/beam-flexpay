import { describe, expect, it } from 'vitest'
import { OtpErrorKind, parseOtpError } from './otp-error'

const apiError = (status: string, detail = '', retryAfter?: number) => ({
  status: 400,
  data: { status, detail, retryAfter }
})

describe('parseOtpError', () => {
  it.each([
    ['22101', OtpErrorKind.INVALID],
    ['22105', OtpErrorKind.SESSION_EXPIRED],
    ['22111', OtpErrorKind.FLOW_EXPIRED],
    ['22112', OtpErrorKind.LOCKED],
    ['22108', OtpErrorKind.RESEND_COOLDOWN],
    ['22109', OtpErrorKind.MAX_RESEND],
    ['22114', OtpErrorKind.VERIFY_IN_PROGRESS],
    ['22107', OtpErrorKind.NOTIFICATION_FAILED],
    ['22113', OtpErrorKind.RECIPIENT_UNAVAILABLE],
    ['23015', OtpErrorKind.RESET_TOKEN_INVALID],
    ['23016', OtpErrorKind.RESET_TOKEN_INVALID],
    ['23017', OtpErrorKind.RESET_TOKEN_INVALID]
  ])('map mã %s sang đúng hành động', (code, expectedKind) => {
    expect(parseOtpError(apiError(code)).kind).toBe(expectedKind)
  })

  it('ưu tiên detail và Retry-After từ backend', () => {
    const parsed = parseOtpError(
      apiError('22112', 'Bạn còn phải chờ.', 900)
    )

    expect(parsed.message).toBe('Bạn còn phải chờ.')
    expect(parsed.retryAfter).toBe(900)
  })

  it('dùng thông báo mạng dùng chung khi fetch lỗi', () => {
    expect(parseOtpError({ status: 'FETCH_ERROR', error: 'offline' })).toMatchObject({
      kind: OtpErrorKind.NETWORK,
      retryAfter: null
    })
  })
})
