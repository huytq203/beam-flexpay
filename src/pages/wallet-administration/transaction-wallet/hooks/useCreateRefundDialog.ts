import { useState } from 'react'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'

/** Giao dịch đang mở form tạo yêu cầu hoàn tiền; `null` là đóng. */
export const useCreateRefundDialog = () => {
  const [target, setTarget] = useState<UnifiedContentJournal | null>(null)
  return {
    target,
    open: setTarget,
    close: () => setTarget(null)
  }
}
