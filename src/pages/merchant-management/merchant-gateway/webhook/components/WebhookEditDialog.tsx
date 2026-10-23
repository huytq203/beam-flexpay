import { useState } from 'react'
import {
  useChallengeWebhookOtpMutation,
  useUpdateMerchantWebhookMutation,
  type MerchantWebhook,
  type WebhookScope
} from '@/app/services/merchantWebhookApi'
import {
  DialogModal,
  Input,
  Switch,
  TextArea,
  feedback
} from '@components/index'
import { CredentialFormError } from '../../key-connection/components/CredentialFormError'
import { CredentialOtpDialog } from '../../key-connection/components/CredentialOtpDialog'
import { useCredentialOtp } from '../../key-connection/hooks/useCredentialOtp'
import { REASON_MAX, WEBHOOK_URL_MAX } from '../constants/webhook.constants'
import { validateWebhookUrl } from '../utils/webhook.utils'

interface WebhookEditDialogProps {
  scope: WebhookScope
  scopeLabel: string
  webhook: MerchantWebhook
  onClose: () => void
}

// Luôn cần OTP: otp-challenge đã kiểm revision và URL nên lỗi hình thức hiện
// ngay ở bước xin mã, trước khi tốn SMS. Mọi ô đổi sau khi xin mã thì phải xin lại.
export function WebhookEditDialog({
  scope,
  scopeLabel,
  webhook,
  onClose
}: WebhookEditDialogProps) {
  const [url, setUrl] = useState(webhook.url ?? '')
  const [enabled, setEnabled] = useState(webhook.enabled)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [challengeOtp] = useChallengeWebhookOtpMutation()
  const [updateWebhook] = useUpdateMerchantWebhookMutation()
  const { otp, begin } = useCredentialOtp<MerchantWebhook>()

  const confirm = () => {
    const trimmedUrl = url.trim()
    const trimmedReason = reason.trim()
    const nextError =
      validateWebhookUrl(trimmedUrl) ||
      (trimmedReason ? '' : 'Vui lòng nhập lý do thay đổi')
    setError(nextError)
    if (nextError) return
    const body = {
      ...scope,
      url: trimmedUrl,
      enabled,
      reason: trimmedReason,
      expectedRevision: webhook.rowRevision
    }
    void begin({
      precheck: () => Promise.resolve({ otpRequired: true }),
      challenge: () => challengeOtp(body).unwrap(),
      submit: (sensitiveOtp) =>
        updateWebhook({ ...body, sensitiveOtp }).unwrap(),
      onDone: () => {
        feedback.success('Đã cập nhật cấu hình webhook')
        onClose()
      }
    })
  }

  return (
    <DialogModal
      open
      title='Sửa cấu hình webhook'
      onCancel={onClose}
      onOk={confirm}
      okButtonProps={{ loading: otp.isPreparing }}
      okText='Lưu cấu hình'
    >
      <div className='space-y-3'>
        <p className='text-sm'>
          Phạm vi: <strong>{scopeLabel}</strong>
        </p>
        {webhook.inherited && (
          <p className='rounded-lg border border-border bg-muted p-3 text-xs leading-relaxed text-muted-foreground'>
            Sub-merchant này đang dùng cấu hình của Master. Lưu sẽ tạo cấu hình
            riêng cho Sub; từ đó Sub không còn kế thừa Master.
          </p>
        )}
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='webhook-url'
          >
            URL nhận IPN <span className='text-danger-strong'>*</span>
          </label>
          <Input
            id='webhook-url'
            value={url}
            onChange={(event) => {
              setUrl(event.target.value)
              if (error) setError('')
            }}
            maxLength={WEBHOOK_URL_MAX}
            placeholder='https://api.merchant.vn/flexpay/ipn'
          />
          <p className='mt-1 text-xs text-muted-foreground'>
            Chỉ https, cổng 443, không chứa tài khoản hoặc dấu #. Khi gửi, hệ
            thống còn kiểm tra tên miền phải trỏ tới IP công khai.
          </p>
        </div>
        <div className='flex items-start gap-3 rounded-lg border border-border p-3'>
          <Switch
            id='webhook-enabled'
            checked={enabled}
            onChange={setEnabled}
            aria-label='Bật gửi IPN'
          />
          <label
            htmlFor='webhook-enabled'
            className='min-w-0 flex-1 cursor-pointer text-sm'
          >
            <span className='font-medium'>Bật gửi IPN</span>
            <span className='mt-1 block text-xs text-muted-foreground'>
              {enabled
                ? 'Đơn phát sinh sau khi lưu được gửi tới URL này.'
                : 'Tắt là tắt: không gửi IPN và không lùi về URL của Master. Sự kiện đang chờ vẫn nằm hàng đợi tới khi bật lại hoặc hết hạn (30 ngày).'}
            </span>
          </label>
        </div>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='webhook-reason'
          >
            Lý do thay đổi <span className='text-danger-strong'>*</span>
          </label>
          <TextArea
            id='webhook-reason'
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              if (error) setError('')
            }}
            rows={2}
            maxLength={REASON_MAX}
            placeholder='Nhập lý do thay đổi cấu hình webhook'
          />
        </div>
        <CredentialFormError message={error || otp.formError} />
      </div>
      <CredentialOtpDialog otp={otp} />
    </DialogModal>
  )
}
