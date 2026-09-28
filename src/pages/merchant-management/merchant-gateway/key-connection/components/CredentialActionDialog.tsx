import { useState } from 'react'
import {
  useRevokeGatewayCredentialMutation,
  useRotateGatewayCredentialMutation,
  type ApiCredential,
  type CredentialSecret
} from '@/app/services/merchantGatewayApi'
import { DialogModal, TextArea, feedback } from '@components/index'

export interface CredentialAction {
  type: 'rotate' | 'revoke'
  credential: ApiCredential
}

interface CredentialActionDialogProps {
  action: CredentialAction
  onClose: () => void
  onRotated: (secret: CredentialSecret) => void
}

const validateReason = (
  type: CredentialAction['type'],
  reason: string
): string => {
  if (type === 'revoke' && reason.length < 10)
    return 'Lý do thu hồi cần tối thiểu 10 ký tự'
  if (type === 'rotate' && !reason) return 'Vui lòng nhập lý do xoay key'
  return ''
}

// Mount mỗi lần mở nên lý do và lỗi luôn bắt đầu trống.
export function CredentialActionDialog({
  action,
  onClose,
  onRotated
}: CredentialActionDialogProps) {
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [rotateCredential, rotateState] = useRotateGatewayCredentialMutation()
  const [revokeCredential, revokeState] = useRevokeGatewayCredentialMutation()

  const confirm = async () => {
    const trimmed = reason.trim()
    const error = validateReason(action.type, trimmed)
    setReasonError(error)
    if (error) return
    const args = { id: action.credential.id, reason: trimmed }
    try {
      if (action.type === 'rotate')
        onRotated(await rotateCredential(args).unwrap())
      else await revokeCredential(args).unwrap()
      feedback.success(
        action.type === 'rotate' ? 'Đã xoay key' : 'Đã thu hồi key'
      )
      onClose()
    } catch {
      feedback.error(
        action.type === 'rotate'
          ? 'Không thể xoay key'
          : 'Không thể thu hồi key. Vui lòng thử lại.'
      )
    }
  }

  return (
    <DialogModal
      open
      mode={action.type === 'revoke' ? 'DELETE' : 'CONFIRM'}
      title={action.type === 'rotate' ? 'Xoay key' : 'Thu hồi key'}
      onCancel={onClose}
      onOk={() => void confirm()}
      okButtonProps={{
        loading: rotateState.isLoading || revokeState.isLoading
      }}
      okText={
        action.type === 'revoke' ? 'Xác nhận thu hồi' : 'Xác nhận xoay key'
      }
    >
      <p className='mb-3 text-sm'>
        Client ID:{' '}
        <strong className='font-mono'>{action.credential.clientId}</strong>
      </p>
      {action.type === 'revoke' && (
        <p className='mb-3 text-sm text-danger-strong'>
          Thu hồi key là thao tác vĩnh viễn. Tích hợp đang dùng key này sẽ ngừng
          hoạt động.
        </p>
      )}
      <label
        className='mb-1 block text-sm font-medium'
        htmlFor='credential-action-reason'
      >
        {action.type === 'revoke' ? 'Lý do thu hồi' : 'Lý do xoay key'}{' '}
        <span className='text-danger-strong'>*</span>
      </label>
      <TextArea
        id='credential-action-reason'
        aria-label={
          action.type === 'revoke' ? 'Lý do thu hồi' : 'Lý do xoay key'
        }
        value={reason}
        onChange={(event) => {
          setReason(event.target.value)
          if (reasonError) setReasonError('')
        }}
        placeholder={
          action.type === 'revoke'
            ? 'Nhập tối thiểu 10 ký tự'
            : 'Nhập lý do xoay key'
        }
        rows={3}
        maxLength={500}
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
        action.type === 'revoke' && (
          <p className='mt-1 text-xs text-muted-foreground'>
            Bắt buộc từ 10 đến 500 ký tự để ghi nhật ký thu hồi.
          </p>
        )
      )}
    </DialogModal>
  )
}
