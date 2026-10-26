import { useState } from 'react'
import {
  useChallengeCredentialChangeOtpMutation,
  usePrecheckGatewayCredentialCommandMutation,
  useRevokeGatewayCredentialMutation,
  useRotateGatewayCredentialMutation,
  type ApiCredential,
  type CredentialSecret
} from '@/app/services/merchantGatewayApi'
import { DialogModal, TextArea, feedback } from '@components/index'
import {
  REASON_MAX,
  REVOKE_REASON_MIN
} from '../constants/credential.constants'
import { useCredentialOtp } from '../hooks/useCredentialOtp'
import { isPemPublicKey, revisionOf } from '../utils/credential.utils'
import { CredentialFormError } from './CredentialFormError'
import { CredentialOtpDialog } from './CredentialOtpDialog'
import { PublicKeyField } from './PublicKeyField'

interface CredentialRotateRevokeDialogProps {
  type: 'rotate' | 'revoke'
  credential: ApiCredential
  onClose: () => void
  onRotated: (secret: CredentialSecret) => void
}

const validateReason = (type: 'rotate' | 'revoke', reason: string): string => {
  if (type === 'rotate') return reason ? '' : 'Vui lòng nhập lý do xoay key'
  if (!reason) return 'Vui lòng nhập lý do thu hồi'
  return reason.length < REVOKE_REASON_MIN
    ? `Lý do thu hồi tối thiểu ${REVOKE_REASON_MIN} ký tự`
    : ''
}

// Mount mỗi lần mở nên lý do và lỗi luôn bắt đầu trống. Xoay key đổi khóa
// ngay, không có thời gian ân hạn cho khóa cũ.
export function CredentialActionDialog({
  type,
  credential,
  onClose,
  onRotated
}: CredentialRotateRevokeDialogProps) {
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [publicKeyError, setPublicKeyError] = useState('')
  const [precheck] = usePrecheckGatewayCredentialCommandMutation()
  const [challengeOtp] = useChallengeCredentialChangeOtpMutation()
  const [rotateCredential] = useRotateGatewayCredentialMutation()
  const [revokeCredential] = useRevokeGatewayCredentialMutation()
  const { otp, begin } = useCredentialOtp<CredentialSecret | ApiCredential>()
  const isRotate = type === 'rotate'
  const needsPublicKey = isRotate && credential.authMode === 'RSA_SHA256'
  const reasonLabel = isRotate ? 'Lý do xoay key' : 'Lý do thu hồi'

  const confirm = () => {
    // Cùng một chuỗi lý do cho bước xin OTP và lệnh chính, nếu lệch BE báo 5732.
    const trimmed = reason.trim()
    const error = validateReason(type, trimmed)
    setReasonError(error)
    const pem = publicKey.trim()
    const pemError =
      needsPublicKey && !isPemPublicKey(pem)
        ? 'Vui lòng dán public key RSA mới dạng PEM'
        : ''
    setPublicKeyError(pemError)
    if (error || pemError) return
    const id = credential.id
    const body = {
      reason: trimmed,
      expectedRevision: revisionOf(credential),
      ...(needsPublicKey && { merchantPublicKey: pem })
    }
    void begin({
      precheck: () =>
        precheck({
          url: `/merchant-api-credentials/${id}/${type}`,
          method: 'POST',
          body
        }).unwrap(),
      challenge: () =>
        challengeOtp({
          id,
          action: isRotate ? 'ROTATE' : 'REVOKE',
          ...body
        }).unwrap(),
      submit: (sensitiveOtp) =>
        isRotate
          ? rotateCredential({ id, ...body, sensitiveOtp }).unwrap()
          : revokeCredential({ id, ...body, sensitiveOtp }).unwrap(),
      onDone: (result) => {
        feedback.success(isRotate ? 'Đã xoay key' : 'Đã thu hồi key')
        if (isRotate && 'credential' in result) onRotated(result)
        onClose()
      }
    })
  }

  return (
    <DialogModal
      open
      mode={isRotate ? 'CONFIRM' : 'DELETE'}
      title={isRotate ? 'Xoay key' : 'Thu hồi key'}
      onCancel={onClose}
      onOk={confirm}
      okButtonProps={{ loading: otp.isPreparing }}
      okText={isRotate ? 'Xác nhận xoay key' : 'Xác nhận thu hồi'}
    >
      <p className='mb-3 text-sm'>
        Client ID: <strong className='font-mono'>{credential.clientId}</strong>
      </p>
      <p
        className={
          isRotate
            ? 'mb-3 text-sm text-warning-strong'
            : 'mb-3 text-sm text-danger-strong'
        }
      >
        {isRotate
          ? 'Khóa cũ ngừng hiệu lực ngay sau khi xoay, không có thời gian ân hạn.'
          : 'Thu hồi key là thao tác vĩnh viễn. Tích hợp đang dùng key này sẽ ngừng hoạt động.'}
      </p>
      {needsPublicKey && (
        <div className='mb-3'>
          <PublicKeyField
            id='credential-rotate-public-key'
            value={publicKey}
            error={publicKeyError}
            onChange={(value) => {
              setPublicKey(value)
              setPublicKeyError('')
            }}
          />
        </div>
      )}
      <label
        className='mb-1 block text-sm font-medium'
        htmlFor='credential-action-reason'
      >
        {reasonLabel} <span className='text-danger-strong'>*</span>
      </label>
      <TextArea
        id='credential-action-reason'
        aria-label={reasonLabel}
        value={reason}
        onChange={(event) => {
          setReason(event.target.value)
          if (reasonError) setReasonError('')
        }}
        placeholder={isRotate ? 'Nhập lý do xoay key' : 'Nhập lý do thu hồi'}
        rows={3}
        maxLength={REASON_MAX}
        status={reasonError ? 'error' : undefined}
      />
      {reasonError ? (
        <p
          role='alert'
          className='mt-1 text-xs text-danger-strong'
        >
          {reasonError}
        </p>
      ) : (
        !isRotate && (
          <p className='mt-1 text-xs text-muted-foreground'>
            Bắt buộc từ 10 đến 500 ký tự để ghi nhật ký thu hồi.
          </p>
        )
      )}
      <div className='mt-3 empty:hidden'>
        <CredentialFormError message={otp.formError} />
      </div>
      <CredentialOtpDialog otp={otp} />
    </DialogModal>
  )
}
