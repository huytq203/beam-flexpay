import { useState } from 'react'
import {
  useChallengeWebhookDeleteOtpMutation,
  useDeleteSubMerchantWebhookMutation,
  type DeletedWebhook
} from '@/app/services/merchantWebhookApi'
import { DialogModal, TextArea, feedback } from '@components/index'
import { CredentialFormError } from '../../key-connection/components/CredentialFormError'
import { CredentialOtpDialog } from '../../key-connection/components/CredentialOtpDialog'
import { useCredentialOtp } from '../../key-connection/hooks/useCredentialOtp'
import { REASON_MAX } from '../constants/webhook.constants'

interface WebhookDeleteDialogProps {
  /** Master chứa Sub; BE nhận Master ở path và Sub ở body. */
  merchantId: string
  subMerchantId: string
  scopeLabel: string
  /** `rowRevision` hiện tại của dòng riêng, gửi làm `expectedRevision`. */
  rowRevision: number
  onClose: () => void
}

/** Xóa dòng webhook riêng của Sub (Sub quay về kế thừa Master); luôn cần lý do và OTP. */
export function WebhookDeleteDialog({
  merchantId,
  subMerchantId,
  scopeLabel,
  rowRevision,
  onClose
}: WebhookDeleteDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [challengeOtp] = useChallengeWebhookDeleteOtpMutation()
  const [deleteWebhook] = useDeleteSubMerchantWebhookMutation()
  const { otp, begin } = useCredentialOtp<DeletedWebhook>()

  const confirm = () => {
    const trimmedReason = reason.trim()
    const nextError = trimmedReason ? '' : 'Vui lòng nhập lý do xóa'
    setError(nextError)
    if (nextError) return
    const body = {
      merchantId,
      subMerchantId,
      expectedRevision: rowRevision,
      reason: trimmedReason
    }
    void begin({
      precheck: () => Promise.resolve({ otpRequired: true }),
      challenge: () => challengeOtp(body).unwrap(),
      submit: (sensitiveOtp) =>
        deleteWebhook({ ...body, sensitiveOtp }).unwrap(),
      onDone: () => {
        feedback.success('Đã xóa cấu hình riêng, Sub-merchant kế thừa Master')
        onClose()
      }
    })
  }

  return (
    <DialogModal
      open
      mode='DELETE'
      title='Xóa cấu hình webhook riêng'
      onCancel={onClose}
      onOk={confirm}
      okButtonProps={{ loading: otp.isPreparing }}
      okText='Xóa cấu hình riêng'
    >
      <div className='space-y-3'>
        <p className='text-sm'>
          Phạm vi: <strong>{scopeLabel}</strong>
        </p>
        <p className='rounded-lg border border-border bg-muted p-3 text-xs leading-relaxed text-muted-foreground'>
          Sau khi xóa, Sub-merchant quay về dùng URL và trạng thái của Master.
          Cấu hình của Master không bị ảnh hưởng.
        </p>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='webhook-delete-reason'
          >
            Lý do xóa <span className='text-danger-strong'>*</span>
          </label>
          <TextArea
            id='webhook-delete-reason'
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              if (error) setError('')
            }}
            rows={2}
            maxLength={REASON_MAX}
            placeholder='Nhập lý do xóa cấu hình webhook riêng'
          />
        </div>
        <CredentialFormError message={error || otp.formError} />
      </div>
      <CredentialOtpDialog otp={otp} />
    </DialogModal>
  )
}
