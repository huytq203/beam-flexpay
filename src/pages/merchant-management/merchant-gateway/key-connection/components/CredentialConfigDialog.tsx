import { useState } from 'react'
import {
  useChallengeCredentialChangeOtpMutation,
  useChangeGatewayCredentialConfigurationMutation,
  usePrecheckGatewayCredentialCommandMutation,
  type ApiCredential,
  type CredentialChangeBody,
  type CredentialSecret
} from '@/app/services/merchantGatewayApi'
import { DialogModal, TextArea, feedback } from '@components/index'
import { AUTH_MODE_LABEL, REASON_MAX } from '../constants/credential.constants'
import { useCredentialOtp } from '../hooks/useCredentialOtp'
import { isPemPublicKey, revisionOf } from '../utils/credential.utils'
import { CredentialFormError } from './CredentialFormError'
import { CredentialOtpDialog } from './CredentialOtpDialog'
import { PublicKeyField } from './PublicKeyField'

interface CredentialConfigDialogProps {
  kind: 'status' | 'convert'
  credential: ApiCredential
  onClose: () => void
  onSecret: (secret: CredentialSecret) => void
}

// PUT configuration chỉ nhận STATUS (Hoạt động <-> Tạm dừng) và CONVERT (đổi
// cơ chế xác thực). Đổi sang HMAC sinh Secret Key mới, chỉ hiện một lần.
export function CredentialConfigDialog({
  kind,
  credential,
  onClose,
  onSecret
}: CredentialConfigDialogProps) {
  const [reason, setReason] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [error, setError] = useState('')
  const [precheck] = usePrecheckGatewayCredentialCommandMutation()
  const [challengeOtp] = useChallengeCredentialChangeOtpMutation()
  const [changeConfig] = useChangeGatewayCredentialConfigurationMutation()
  const { otp, begin } = useCredentialOtp<CredentialSecret>()
  const isStatus = kind === 'status'
  const nextStatus = credential.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
  const nextMode =
    credential.authMode === 'RSA_SHA256' ? 'HMAC_SHA256' : 'RSA_SHA256'
  const needsPublicKey = !isStatus && nextMode === 'RSA_SHA256'
  const title = isStatus
    ? nextStatus === 'SUSPENDED'
      ? 'Tạm dừng key'
      : 'Kích hoạt lại key'
    : 'Đổi cơ chế xác thực'

  const confirm = () => {
    const trimmed = reason.trim()
    const pem = publicKey.trim()
    const nextError = !trimmed
      ? 'Vui lòng nhập lý do thay đổi'
      : needsPublicKey && !isPemPublicKey(pem)
        ? 'Vui lòng dán public key RSA dạng PEM'
        : ''
    setError(nextError)
    if (nextError) return
    const id = credential.id
    const body: CredentialChangeBody = isStatus
      ? {
          expectedRevision: revisionOf(credential),
          action: 'STATUS',
          status: nextStatus,
          reason: trimmed
        }
      : {
          expectedRevision: revisionOf(credential),
          action: 'CONVERT',
          authMode: nextMode,
          ...(needsPublicKey && { merchantPublicKey: pem }),
          reason: trimmed
        }
    void begin({
      precheck: () =>
        precheck({
          url: `/merchant-api-credentials/${id}/configuration`,
          method: 'PUT',
          body
        }).unwrap(),
      challenge: () => challengeOtp({ id, ...body }).unwrap(),
      submit: (sensitiveOtp) =>
        changeConfig({ id, ...body, sensitiveOtp }).unwrap(),
      onDone: (result) => {
        feedback.success('Đã cập nhật cấu hình key')
        if (result?.secretKey) onSecret(result)
        onClose()
      }
    })
  }

  return (
    <DialogModal
      open
      title={title}
      onCancel={onClose}
      onOk={confirm}
      okButtonProps={{ loading: otp.isPreparing }}
      okText='Xác nhận'
    >
      <div className='space-y-3'>
        <p className='text-sm'>
          Client ID:{' '}
          <strong className='font-mono'>{credential.clientId}</strong>
        </p>
        <p className='rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed text-warning-strong'>
          {isStatus
            ? nextStatus === 'SUSPENDED'
              ? 'Key tạm dừng sẽ bị từ chối khi gọi API cho đến khi được kích hoạt lại.'
              : 'Chỉ kích hoạt lại được khi Master Merchant đang hoạt động và phạm vi này chưa có key hoạt động khác.'
            : `Chuyển từ ${AUTH_MODE_LABEL[credential.authMode ?? 'HMAC_SHA256']} sang ${AUTH_MODE_LABEL[nextMode]}. Khóa hiện tại ngừng hiệu lực ngay.${nextMode === 'HMAC_SHA256' ? ' Secret Key mới chỉ hiển thị một lần.' : ''}`}
        </p>
        {needsPublicKey && (
          <PublicKeyField
            id='credential-convert-public-key'
            value={publicKey}
            onChange={(value) => {
              setPublicKey(value)
              setError('')
            }}
          />
        )}
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='credential-config-reason'
          >
            Lý do thay đổi <span className='text-danger-strong'>*</span>
          </label>
          <TextArea
            id='credential-config-reason'
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              if (error) setError('')
            }}
            rows={2}
            maxLength={REASON_MAX}
            placeholder='Nhập lý do thay đổi'
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
