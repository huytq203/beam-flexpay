import { Can } from '@/app/permissions'
import { ButtonComponent, CardComponent } from '@components/index'
import { useNavigate } from 'react-router-dom'

interface WalletLimitFormActionsProps {
  isEdit: boolean
  isSaving: boolean
  cancelTo: string
}

export function WalletLimitFormActions({
  isEdit,
  isSaving,
  cancelTo
}: WalletLimitFormActionsProps) {
  const navigate = useNavigate()
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent
          type='default'
          htmlType='button'
          content='Hủy'
          onClick={() => navigate(cancelTo)}
        />
        <Can
          screen='WALLET_LIMIT'
          action={isEdit ? 'edit' : 'create'}
        >
          <ButtonComponent
            htmlType='submit'
            loading={isSaving}
            content={isEdit ? 'Lưu thay đổi' : 'Lưu hạn mức'}
          />
        </Can>
      </div>
    </CardComponent>
  )
}
