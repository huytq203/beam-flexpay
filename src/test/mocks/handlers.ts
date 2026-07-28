import { http, HttpResponse } from 'msw'

/** Body thành công của BE luôn bọc trong `{ data }` (xem fnTransformResponse). */
const ok = <T,>(data: T) => HttpResponse.json({ data })

export const handlers = [
  http.post('*/auth/change-password', () => ok(null)),
  http.post('*/auth/forgot-password', () => ok(null)),
  http.get('*/auth/reset-password/validate', () =>
    ok({ valid: true, maskedEmail: 'a***@flexpay.vn' })
  ),
  http.post('*/auth/reset-password', () => ok(null))
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
  )
}
