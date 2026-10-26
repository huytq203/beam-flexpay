import { useState } from 'react'
import {
  useChallengeCredentialChangeOtpMutation,
  usePrecheckGatewayCredentialCommandMutation,
  useUpdateGatewayIpWhitelistMutation,
  type ApiCredential
} from '@/app/services/merchantGatewayApi'
import { DialogModal, TextArea, feedback } from '@components/index'
import { IP_WHITELIST_MAX, REASON_MAX } from '../constants/credential.constants'
import { useCredentialOtp } from '../hooks/useCredentialOtp'
import { parseIps, revisionOf } from '../utils/credential.utils'
import { CredentialFormError } from './CredentialFormError'
import { CredentialOtpDialog } from './CredentialOtpDialog'

interface IpWhitelistDialogProps {
  credential: ApiCredential
  onClose: () => void
}

// PUT ip-whitelist thay TOÀN BỘ danh sách: form bắt đầu từ danh sách hiện tại,
// để trống nghĩa là bỏ giới hạn IP.
export function IpWhitelistDialog({
  credential,
  onClose
}: IpWhitelistDialogProps) {
  const [ips, setIps] = useState(() => credential.ipWhitelist.join('\n'))
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [precheck] = usePrecheckGatewayCredentialCommandMutation()
  const [challengeOtp] = useChallengeCredentialChangeOtpMutation()
  const [updateIps] = useUpdateGatewayIpWhitelistMutation()
  const { otp, begin } = useCredentialOtp<ApiCredential>()

  const confirm = () => {
    const trimmed = reason.trim()
    const ipWhitelist = parseIps(ips)
    const nextError = !trimmed
      ? 'Vui lòng nhập lý do thay đổi'
      : ipWhitelist.length > IP_WHITELIST_MAX
        ? `Tối đa ${IP_WHITELIST_MAX} IP / dải CIDR`
        : ''
    setError(nextError)
    if (nextError) return
    const id = credential.id
    const body = {
      ipWhitelist,
      reason: trimmed,
      expectedRevision: revisionOf(credential)
    }
    void begin({
      precheck: () =>
        precheck({
          url: `/merchant-api-credentials/${id}/ip-whitelist`,
          method: 'PUT',
          body
        }).unwrap(),
      challenge: () =>
        challengeOtp({ id, action: 'IP_WHITELIST', ...body }).unwrap(),
      submit: (sensitiveOtp) =>
        updateIps({ id, ...body, sensitiveOtp }).unwrap(),
      onDone: () => {
        feedback.success('Đã cập nhật IP Whitelist')
        onClose()
      }
    })
  }

  return (
    <DialogModal
      open
      title='Sửa IP Whitelist'
      onCancel={onClose}
      onOk={confirm}
      okButtonProps={{ loading: otp.isPreparing }}
      okText='Lưu IP Whitelist'
    >
      <div className='space-y-3'>
        <p className='text-sm'>
          Client ID:{' '}
          <strong className='font-mono'>{credential.clientId}</strong>
        </p>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='credential-ip-list'
          >
            Danh sách IP / dải CIDR
          </label>
          <TextArea
            id='credential-ip-list'
            value={ips}
            onChange={(event) => setIps(event.target.value)}
            rows={5}
            placeholder='Mỗi IP hoặc dải CIDR một dòng'
          />
          <p className='mt-1 text-xs text-muted-foreground'>
            Danh sách này thay thế toàn bộ danh sách cũ. Để trống để không giới
            hạn IP. Tối đa {IP_WHITELIST_MAX} mục, không dùng số 0 ở đầu.
          </p>
        </div>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='credential-ip-reason'
          >
            Lý do thay đổi <span className='text-danger-strong'>*</span>
          </label>
          <TextArea
            id='credential-ip-reason'
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              if (error) setError('')
            }}
            rows={2}
            maxLength={REASON_MAX}
            placeholder='Nhập lý do thay đổi IP Whitelist'
          />
        </div>
        {error && (
          <p
            role='alert'
            className='text-xs text-danger-strong'
          >
            {error}
          </p>
        )}
        <CredentialFormError message={otp.formError} />
      </div>
      <CredentialOtpDialog otp={otp} />
    </DialogModal>
  )
}
