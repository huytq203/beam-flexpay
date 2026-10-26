import { useMemo, useState } from 'react'
import { useProposeHoldRuleMutation } from '@/app/services/merchantHoldRuleApi'
import { feedback } from '@components/index'
import type {
  HoldRuleKey,
  HoldRulePolicy,
  HoldRuleTarget
} from '../types/holdRule.types'
import {
  buildConfig,
  buildProposalBody,
  toDraft,
  validateActiveFrom,
  validateDraft,
  validateReason,
  type HoldRuleDraft,
  type HoldRuleValues
} from '../utils/holdRuleDraft.utils'
import { getHoldRuleErrorMessage } from '../utils/holdRuleError.utils'

/** Trạng thái form đề xuất: tham số cấp này tự đặt, lý do và ngày hiệu lực. */
export const useHoldRuleProposal = (
  target: HoldRuleTarget,
  policy: HoldRulePolicy | undefined,
  onDone: () => void
) => {
  const [propose, { isLoading }] = useProposeHoldRuleMutation()
  const [draft, setDraft] = useState<HoldRuleDraft>(() =>
    toDraft(policy, target.level)
  )
  const [reason, setReason] = useState('')
  const [activeFrom, setActiveFrom] = useState<string>()
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo(
    () => validateDraft(draft, target.level),
    [draft, target.level]
  )
  const reasonError = validateReason(reason)
  const activeFromError = validateActiveFrom(activeFrom)
  const hasError =
    Object.keys(errors).length > 0 || Boolean(reasonError || activeFromError)

  const setOwn = (key: HoldRuleKey, own: boolean) =>
    setDraft((current) => {
      const nextOwn = own
        ? [...current.own.filter((item) => item !== key), key]
        : current.own.filter((item) => item !== key)
      const known = current.values[key]
      // Bật "tự đặt" lần đầu thì lấy giá trị đang kế thừa làm điểm bắt đầu.
      const seed = known === undefined ? (policy?.[key] ?? null) : known
      return {
        own: nextOwn,
        values: { ...current.values, [key]: seed } as HoldRuleValues
      }
    })

  const setValue = (key: HoldRuleKey, value: unknown) =>
    setDraft((current) => ({
      ...current,
      values: { ...current.values, [key]: value } as HoldRuleValues
    }))

  const submit = async () => {
    setSubmitted(true)
    if (hasError) return
    try {
      await propose(
        buildProposalBody(target, buildConfig(draft), reason, activeFrom)
      ).unwrap()
      feedback.success(
        'Đã gửi đề xuất, chờ phê duyệt. Quy tắc đang áp dụng chưa thay đổi.'
      )
      onDone()
    } catch (error) {
      feedback.error(
        getHoldRuleErrorMessage(error, 'Không thể gửi đề xuất quy tắc tạm giữ')
      )
    }
  }

  return {
    draft,
    reason,
    activeFrom,
    setReason,
    setActiveFrom,
    setOwn,
    setValue,
    submit,
    isLoading,
    errors: submitted ? errors : {},
    reasonError: submitted ? reasonError : undefined,
    activeFromError: submitted ? activeFromError : undefined
  }
}
