import { useState } from 'react'
import { ButtonComponent, DialogModal } from '@components/index'
import { FEE_REASON_MAX_LENGTH } from '@type/feeApproval.type'
import { ReasonField } from './ReasonField'

interface ReasonFormProps {
  description?: string
  /** Sàn ký tự của endpoint. 0 nghĩa là chỉ cần khác rỗng. */
  minLength?: number
  maxLength?: number
  label?: string
  hint?: string
  placeholder?: string
  okText?: string
  danger?: boolean
  confirmLoading?: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export interface ReasonDialogProps extends ReasonFormProps {
  open: boolean
  title: string
}

const getReasonError = (
  reason: string,
  minLength: number,
  maxLength: number
): string => {
  if (!reason) return 'Vui lòng nhập lý do.'
  if (reason.length < minLength) {
    return `Lý do phải từ ${minLength} ký tự trở lên.`
  }
  if (reason.length > maxLength) {
    return `Lý do tối đa ${maxLength} ký tự.`
  }
  return ''
}

const ReasonForm = ({
  description,
  minLength = 0,
  maxLength = FEE_REASON_MAX_LENGTH,
  label = 'Lý do',
  hint,
  placeholder = 'Nhập lý do...',
  okText = 'Xác nhận',
  danger,
  confirmLoading,
  onConfirm,
  onCancel
}: ReasonFormProps) => {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  const trimmedReason = reason.trim()
  const error = getReasonError(trimmedReason, minLength, maxLength)

  const handleConfirm = () => {
    setTouched(true)
    if (error) return
    onConfirm(trimmedReason)
  }

  return (
    <div className='flex min-w-0 flex-col gap-3 pt-2'>
      {description && (
        <p className='m-0 min-w-0 text-[13px] leading-5 break-words text-muted-foreground'>
          {description}
        </p>
      )}
      <ReasonField
        label={label}
        hint={hint}
        maxLength={maxLength}
        placeholder={placeholder}
        value={reason}
        disabled={confirmLoading}
        error={touched ? error : ''}
        onChange={setReason}
      />
      <div className='grid grid-cols-1 gap-2 min-[400px]:grid-cols-2'>
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Hủy bỏ'
          className='w-full pointer-coarse:h-11!'
          disabled={confirmLoading}
          onClick={onCancel}
        />
        <ButtonComponent
          htmlType='button'
          type='primary'
          danger={danger}
          content={okText}
          className='w-full pointer-coarse:h-11!'
          loading={confirmLoading}
          disabled={!trimmedReason}
          onClick={handleConfirm}
        />
      </div>
    </div>
  )
}

/**
 * Modal thu lý do cho các hành động fee bắt buộc `reason`.
 * `DialogModal` bật `destroyOnHidden` nên form bên trong tự reset mỗi lần mở.
 */
export const ReasonDialog = ({ open, title, ...formProps }: ReasonDialogProps) => (
  <DialogModal
    open={open}
    title={title}
    footer={null}
    width={{ xs: '100%', sm: 440 }}
    closable={{ 'aria-label': 'Đóng' }}
    onOk={formProps.onCancel}
    onCancel={formProps.onCancel}
    content={<ReasonForm {...formProps} />}
  />
)
