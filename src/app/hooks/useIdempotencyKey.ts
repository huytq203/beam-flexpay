import { useRef } from 'react'

import { createIdempotencyKey } from '@utils/idempotency'

export interface IdempotencyKeyApi {
  /** Khoá của lần thao tác đang mở; gọi lại vẫn trả đúng khoá cũ. */
  take: () => string
  /** Kết thúc lần thao tác — lần `take()` sau sẽ sinh khoá mới. */
  reset: () => void
}

/**
 * Giữ một khoá idempotency cho suốt một lần thao tác tiền.
 *
 * Người dùng bấm lại sau khi lệnh lỗi hoặc timeout thì `take()` trả về đúng khoá
 * cũ, nên wallet-core hiểu đây vẫn là một lệnh và không tạo bản ghi thứ hai —
 * sinh khoá mới mỗi lần bấm thì khoá chỉ để qua validate chứ không chống trùng
 * được gì. Gọi `reset()` sau khi lệnh đã đi thành công.
 */
export function useIdempotencyKey(): IdempotencyKeyApi {
  const keyRef = useRef<string | null>(null)

  const take = (): string => {
    keyRef.current ??= createIdempotencyKey()
    return keyRef.current
  }

  const reset = (): void => {
    keyRef.current = null
  }

  return { take, reset }
}
