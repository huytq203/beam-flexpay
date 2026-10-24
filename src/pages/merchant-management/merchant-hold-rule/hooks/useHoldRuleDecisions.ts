import { useState } from 'react'
import {
  useApproveHoldRuleMutation,
  useRejectHoldRuleMutation
} from '@/app/services/merchantHoldRuleApi'
import { feedback } from '@components/index'
import type { HoldRuleChange } from '../types/holdRule.types'
import { getHoldRuleErrorMessage } from '../utils/holdRuleError.utils'

export type HoldRuleDecisionKind = 'approve' | 'reject'

export interface HoldRuleDecision {
  row: HoldRuleChange
  kind: HoldRuleDecisionKind
}

/** Duyệt hoặc từ chối một đề xuất; lý do từ chối không bắt buộc. */
export const useHoldRuleDecisions = () => {
  const [approve, approveState] = useApproveHoldRuleMutation()
  const [reject, rejectState] = useRejectHoldRuleMutation()
  const [decision, setDecision] = useState<HoldRuleDecision | null>(null)
  const [reason, setReason] = useState('')

  const close = () => {
    setDecision(null)
    setReason('')
  }

  const confirm = async () => {
    if (!decision) return
    const { id } = decision.row
    try {
      if (decision.kind === 'approve') {
        await approve(id).unwrap()
        feedback.success('Đã phê duyệt quy tắc tạm giữ')
      } else {
        const text = reason.trim()
        await reject({ id, reason: text || undefined }).unwrap()
        feedback.success('Đã từ chối đề xuất quy tắc tạm giữ')
      }
      close()
    } catch (error) {
      // Danh sách đã được làm mới qua invalidatesTags; đóng hộp để không duyệt lại bản cũ.
      feedback.error(
        getHoldRuleErrorMessage(
          error,
          'Không thể xử lý đề xuất quy tắc tạm giữ'
        )
      )
      close()
    }
  }

  return {
    decision,
    reason,
    setReason,
    open: (row: HoldRuleChange, kind: HoldRuleDecisionKind) =>
      setDecision({ row, kind }),
    close,
    confirm,
    isLoading: approveState.isLoading || rejectState.isLoading
  }
}
