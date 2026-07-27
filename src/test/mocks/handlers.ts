import { http, HttpResponse } from 'msw'

/** Body thành công của BE luôn bọc trong `{ data }` (xem fnTransformResponse). */
const ok = <T,>(data: T) => HttpResponse.json({ data })

export const handlers = [
  http.post('*/user/verify-token', () => ok(true)),
  http.post('*/user/new-password', () => ok({ id: 'user-1' }))
]

/** Handler dùng lại trong từng test để mô phỏng nhánh lỗi. */
export const errorHandlers = {
  verifyTokenInvalid: http.post('*/user/verify-token', () =>
    HttpResponse.json({ message: 'Token không hợp lệ' }, { status: 400 })
  ),
  verifyTokenOffline: http.post('*/user/verify-token', () => HttpResponse.error()),
  newPasswordExpired: http.post('*/user/new-password', () =>
    HttpResponse.json({ message: 'Token đã hết hạn' }, { status: 401 })
  ),
  newPasswordFailed: http.post('*/user/new-password', () =>
    HttpResponse.json({ message: 'Mật khẩu trùng mật khẩu cũ' }, { status: 400 })
  )
}
