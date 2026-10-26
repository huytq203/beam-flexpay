import { useGetBankAccountQuery } from '@/app/services/merchantBankAccountApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, DialogModal } from '@components/index'
import { BankAccountChangeSummary } from './BankAccountChangeSummary'
import { BankAccountDetailFields } from './BankAccountDetailFields'

interface BankAccountDetailDialogProps {
  id: string
  merchantName: (id?: string) => string
  onClose: () => void
}

/** Mỗi lần mở đều tải lại chi tiết để thấy trạng thái tạm giữ, liên kết mới nhất. */
export function BankAccountDetailDialog({
  id,
  merchantName,
  onClose
}: BankAccountDetailDialogProps) {
  const query = useGetBankAccountQuery(id, { refetchOnMountOrArgChange: true })
  const account = query.data

  const body = () => {
    if (query.isLoading) {
      return (
        <p
          role='status'
          className='py-8 text-center text-sm text-muted-foreground'
        >
          Đang tải chi tiết tài khoản…
        </p>
      )
    }
    if (query.isError || !account) {
      return (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 text-sm text-danger-strong'
        >
          {getApiErrorDetail(
            query.error,
            'Không thể tải chi tiết tài khoản ngân hàng.'
          )}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )
    }
    return (
      <div className='flex flex-col gap-3'>
        <BankAccountDetailFields
          account={account}
          merchantName={merchantName}
        />
        {account.pendingChangeRequest && (
          <BankAccountChangeSummary
            row={account}
            change={account.pendingChangeRequest}
          />
        )}
      </div>
    )
  }

  return (
    <DialogModal
      open
      width={{ xs: '95%', md: 640 }}
      title='Chi tiết tài khoản ngân hàng'
      onCancel={onClose}
      onOk={onClose}
      footer={
        <ButtonComponent
          type='default'
          content='Đóng'
          onClick={onClose}
        />
      }
    >
      {body()}
    </DialogModal>
  )
}
