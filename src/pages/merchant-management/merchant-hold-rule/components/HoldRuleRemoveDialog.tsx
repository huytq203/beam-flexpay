import { useState } from 'react'
import { useProposeHoldRuleMutation } from '@/app/services/merchantHoldRuleApi'
import { DialogModal, TextArea, feedback } from '@components/index'
import { MAX_REASON_LENGTH } from '../constants/holdRule.constants'
import type { HoldRuleTarget } from '../types/holdRule.types'
import { buildProposalBody, validateReason } from '../utils/holdRuleDraft.utils'
import { getHoldRuleErrorMessage } from '../utils/holdRuleError.utils'

interface HoldRuleRemoveDialogProps {
  target: HoldRuleTarget
  onClose: () => void
}

/** "Gỡ quy tắc riêng" = đề xuất `config` rỗng ở Master/Sub; vẫn cần được duyệt. */
export function HoldRuleRemoveDialog({
  target,
  onClose
}: HoldRuleRemoveDialogProps) {
  const [propose, { isLoading }] = useProposeHoldRuleMutation()
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const reasonError = touched ? validateReason(reason) : undefined

  const confirm = async () => {
    setTouched(true)
    if (validateReason(reason)) return
    try {
      await propose(buildProposalBody(target, {}, reason)).unwrap()
      feedback.success(
        'Đã gửi đề xuất gỡ quy tắc riêng, chờ phê duyệt. Quy tắc đang áp dụng chưa thay đổi.'
      )
      onClose()
    } catch (error) {
      feedback.error(
        getHoldRuleErrorMessage(error, 'Không thể gửi đề xuất gỡ quy tắc riêng')
      )
    }
  }

  return (
    <DialogModal
      open
      title='Gỡ quy tắc tạm giữ riêng'
      okText='Gửi đề xuất gỡ'
      okButtonProps={{ danger: true, loading: isLoading }}
      onCancel={onClose}
      onOk={() => void confirm()}
    >
      <div className='flex flex-col gap-3'>
        <p className='text-sm'>
          Sau khi được duyệt, đối tượng này kế thừa lại toàn bộ quy tắc cấp
          trên. Đề xuất gỡ cũng phải chờ duyệt như mọi thay đổi khác.
        </p>
        <TextArea
          aria-label='Lý do gỡ'
          maxLength={MAX_REASON_LENGTH}
          onChange={(event) => setReason(event.target.value)}
          placeholder='Lý do gỡ (tối thiểu 10 ký tự)'
          rows={3}
          status={reasonError ? 'error' : undefined}
          value={reason}
        />
        {reasonError && (
          <p
            className='text-xs text-danger-strong'
            role='alert'
          >
            {reasonError}
          </p>
        )}
      </div>
    </DialogModal>
  )
}
