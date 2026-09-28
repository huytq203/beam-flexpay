import { useState } from 'react'
import {
  useInheritMerchantNotificationMutation,
  type NotificationListItem
} from '@/app/services/merchantNotificationApi'
import { DialogModal, TextArea, feedback } from '@components/index'

interface NotificationInheritDialogProps {
  row: NotificationListItem
  onClose: () => void
}

// Xóa cấu hình riêng của Sub: phạm vi quay về dùng cấu hình Master (hoặc mặc định).
export function NotificationInheritDialog({
  row,
  onClose
}: NotificationInheritDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const [inherit, { isLoading }] = useInheritMerchantNotificationMutation()

  const confirm = async () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do')
      return
    }
    try {
      await inherit({
        configId: row.configId ?? '',
        version: row.version ?? 0,
        reason: reason.trim()
      }).unwrap()
      feedback.success('Sub-merchant đã quay về kế thừa cấu hình Master')
      onClose()
    } catch {
      feedback.error('Không thể chuyển về kế thừa')
    }
  }

  return (
    <DialogModal
      open
      mode='DELETE'
      title='Kế thừa cấu hình Master'
      okText='Xác nhận kế thừa'
      okButtonProps={{ loading: isLoading }}
      onCancel={onClose}
      onOk={() => void confirm()}
    >
      <p className='mb-3 text-sm'>
        Xóa cấu hình riêng của <strong>{row.merchantName}</strong>. Phạm vi này
        sẽ dùng lại cấu hình của Master, hoặc mặc định hệ thống nếu Master chưa
        cấu hình.
      </p>
      <label
        className='mb-1 block text-sm font-medium'
        htmlFor='notification-inherit-reason'
      >
        Lý do <span className='text-red-600'>*</span>
      </label>
      <TextArea
        id='notification-inherit-reason'
        rows={3}
        maxLength={500}
        value={reason}
        onChange={(event) => {
          setReason(event.target.value)
          setError(undefined)
        }}
      />
      {error && (
        <p
          role='alert'
          className='mt-1 text-sm text-danger-strong'
        >
          {error}
        </p>
      )}
    </DialogModal>
  )
}
