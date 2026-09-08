import { http, HttpResponse } from 'msw'

/** Body thành công của BE luôn bọc trong `{ data }` (xem fnTransformResponse). */
const ok = <T,>(data: T) => HttpResponse.json({ data })

export const handlers = [
  /*
   * Màn chi tiết giao dịch tự đọc trạng thái lệnh rút (WithdrawalDecisionPanel).
   * Mặc định trả bản ghi KHÔNG có `status` để panel render rỗng — test nào cần
   * trạng thái thật thì `server.use()` đè lên.
   */
  http.get('*/withdrawals', () =>
    ok({ id: 'withdrawal-default', transactionCode: 'TXN-000', beneficiary: null })
  ),
  http.post('*/auth/change-password', () => ok(null)),
  http.post('*/auth/forgot-password', () => ok(null)),
  http.get('*/auth/reset-password/validate', () =>
    ok({ valid: true, maskedEmail: 'a***@flexpay.vn' })
  ),
  http.post('*/auth/reset-password', () => ok(null)),
  http.post('*/auth/reset-password/verify-otp', () => ok(null)),
  http.post('*/auth/login/verify-otp', () =>
    ok({
      accessToken: 'token',
      expiresIn: 300,
      refreshToken: 'refresh',
      refreshExpiresIn: 1800
    })
  ),
  http.post('*/auth/otp/resend', () =>
    ok({
      requestId: 'request-1',
      maskedRecipient: 'a***@flexpay.vn',
      expiresIn: 180,
      canResendAfter: 60,
      resendRemaining: 2
    })
  ),
  http.get('*/v1/forecast', () =>
    HttpResponse.json({
      latitude: 21.03,
      longitude: 105.83,
      current: {
        time: '2026-07-29T09:30',
        weather_code: 61,
        temperature_2m: 28.4,
        precipitation: 1.2,
        cloud_cover: 87,
        is_day: 1
      }
    })
  ),
  http.get(
    'https://api.bigdatacloud.net/data/reverse-geocode-client',
    () =>
      HttpResponse.json({
        locality: 'Hải Châu',
        city: 'Đà Nẵng',
        principalSubdivision: 'Đà Nẵng'
      })
  )
]

/** Handler dùng lại trong từng test để mô phỏng nhánh lỗi. */
export const errorHandlers = {
  changePasswordCurrentIncorrect: http.post(
    '*/auth/change-password',
    () =>
      HttpResponse.json(
        {
          success: false,
          message: 'CURRENT_PASSWORD_INCORRECT',
          detail: 'Mật khẩu hiện tại không chính xác',
          status: '23010'
        },
        { status: 400 }
      )
  ),
  changePasswordOffline: http.post('*/auth/change-password', () =>
    HttpResponse.error()
  ),
  verifyTokenInvalid: http.get('*/auth/reset-password/validate', () =>
    HttpResponse.json(
      {
        success: false,
        message: 'RESET_TOKEN_INVALID',
        detail: 'Liên kết đặt lại mật khẩu không hợp lệ.',
        status: '23015'
      },
      { status: 400 }
    )
  ),
  verifyTokenOffline: http.get('*/auth/reset-password/validate', () =>
    HttpResponse.error()
  ),
  newPasswordExpired: http.post('*/auth/reset-password', () =>
    HttpResponse.json(
      {
        success: false,
        message: 'RESET_TOKEN_EXPIRED',
        detail: 'Liên kết đặt lại mật khẩu đã hết hạn.',
        status: '23016'
      },
      { status: 400 }
    )
  ),
  newPasswordFailed: http.post('*/auth/reset-password', () =>
    HttpResponse.json(
      {
        success: false,
        message: 'PASSWORD_REUSED',
        detail: 'Mật khẩu trùng mật khẩu cũ',
        status: '23014'
      },
      { status: 400 }
    )
  ),
  forgotPasswordRateLimited: http.post('*/auth/forgot-password', () =>
    HttpResponse.json(
      {
        success: false,
        message: 'RESET_REQUEST_RATE_LIMITED',
        detail: 'Bạn đã yêu cầu quá nhiều lần.',
        status: '23018'
      },
      { status: 429 }
    )
  ),
  forgotPasswordOffline: http.post('*/auth/forgot-password', () =>
    HttpResponse.error()
  ),
  weatherUnavailable: http.get('*/v1/forecast', () =>
    HttpResponse.json({ error: true, reason: 'busy' }, { status: 503 })
  ),
  weatherMalformed: http.get('*/v1/forecast', () =>
    HttpResponse.json({ latitude: 21.03 })
  ),
  weatherOffline: http.get('*/v1/forecast', () => HttpResponse.error())
}
