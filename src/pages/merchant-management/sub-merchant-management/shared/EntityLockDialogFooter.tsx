import { ButtonComponent } from '@components/index'

interface EntityLockDialogFooterProps {
  blocked: boolean
  formId: string
  isLock: boolean
  onCancel: () => void
}

export function EntityLockDialogFooter({
  blocked,
  formId,
  isLock,
  onCancel
}: EntityLockDialogFooterProps) {
  const actionLabel = isLock ? 'Khóa' : 'Mở khóa'

  return (
    <div className='flex flex-col gap-2 md:flex-row md:justify-end'>
      <ButtonComponent
        block
        className='md:w-auto!'
        content='Hủy'
        htmlType='button'
        onClick={onCancel}
        type='default'
      />
      <ButtonComponent
        block
        className='md:w-auto!'
        content={actionLabel}
        danger={isLock}
        disabled={blocked}
        form={formId}
        htmlType='submit'
      />
    </div>
  )
}
