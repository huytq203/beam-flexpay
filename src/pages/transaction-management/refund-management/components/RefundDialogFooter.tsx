import { ButtonComponent } from '@components/index'

interface RefundDialogFooterProps {
  okText: string
  loading: boolean
  danger?: boolean
  cancelText?: string
  formId?: string
  onOk?: () => void
  onCancel: () => void
}

export function RefundDialogFooter({
  okText,
  loading,
  danger,
  cancelText = 'Đóng',
  formId,
  onOk,
  onCancel
}: RefundDialogFooterProps) {
  return (
    <div className='mt-4 flex justify-end gap-2'>
      <ButtonComponent
        type='default'
        htmlType='button'
        content={cancelText}
        disabled={loading}
        onClick={onCancel}
      />
      <ButtonComponent
        danger={danger}
        form={formId}
        htmlType={formId ? 'submit' : 'button'}
        loading={loading}
        content={okText}
        onClick={onOk}
      />
    </div>
  )
}
