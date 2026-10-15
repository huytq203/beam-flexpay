import { useState } from 'react'
import {
  useApproveLimitChangeMutation,
  useDeactivateLimitChangeMutation,
  useRejectLimitChangeMutation
} from '@/app/services/merchantLimitApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { feedback } from '@components/index'
import type { LimitChangeDto } from '../types/withdrawalLimit.types'

export type DecisionKind = 'approve' | 'reject' | 'deactivate'
export interface LimitDecision {
  row: LimitChangeDto
  kind: DecisionKind
}

const SUCCESS: Record<DecisionKind, string> = {
  approve: 'Đã phê duyệt thay đổi hạn mức',
  reject: 'Đã từ chối đề xuất hạn mức',
  deactivate: 'Đã gỡ hạn mức'
}

export const useLimitDecisions = () => {
  const [approve, approveState] = useApproveLimitChangeMutation()
  const [reject, rejectState] = useRejectLimitChangeMutation()
  const [deactivate, deactivateState] = useDeactivateLimitChangeMutation()
  const [decision, setDecision] = useState<LimitDecision | null>(null)
  const [reason, setReason] = useState('')

  const close = () => {
    setDecision(null)
    setReason('')
  }

  const confirm = async () => {
    if (!decision) return
    const text = reason.trim()
    if (decision.kind !== 'approve' && !text) {
      feedback.warning('Vui lòng nhập lý do')
      return
    }
    const { id } = decision.row
    try {
      if (decision.kind === 'approve') await approve(id).unwrap()
      else if (decision.kind === 'reject')
        await reject({ id, reason: text }).unwrap()
      else await deactivate({ id, reason: text }).unwrap()
      feedback.success(SUCCESS[decision.kind])
      close()
    } catch (error) {
      feedback.error(
        getApiErrorDetail(error, 'Không thể xử lý thay đổi hạn mức')
      )
    }
  }

  return {
    decision,
    reason,
    setReason,
    open: (row: LimitChangeDto, kind: DecisionKind) =>
      setDecision({ row, kind }),
    close,
    confirm,
    isLoading:
      approveState.isLoading ||
      rejectState.isLoading ||
      deactivateState.isLoading
  }
}
