import { BankFilled } from '@components/icons'
import { ButtonComponent, DialogModal } from '@components/index'

import { useBankAccountForm } from '../hooks/useBankAccountForm'
import type {
  BankAccountFormMode,
  BankAccountRow
} from '../types/bank-account.type'
import { BankAccountScopeSection } from './BankAccountScopeSection'
import { BankAccountSettlementSection } from './BankAccountSettlementSection'
import { BankAccountWithdrawSection } from './BankAccountWithdrawSection'

const BANK_ACCOUNT_FORM_ID = 'bank-account-form'

interface BankAccountFormDialogProps {
  open: boolean
  mode: BankAccountFormMode
  row: BankAccountRow | null
  onSaved: (row: BankAccountRow) => void
  onCancel: () => void
}

function BankAccountFormDialogContent({
  mode,
  row,
  onSaved,
  onCancel
}: Omit<BankAccountFormDialogProps, 'open'>) {
  const { control, setValue, withdrawMode, submit } = useBankAccountForm({
    row,
    mode,
    onSaved
  })
  const isEdit = mode === 'edit'

  return (
    <DialogModal
      open
      width={{ xs: '95%', md: 720 }}
      onOk={() => {}}
      onCancel={onCancel}
      title={
        <span className='flex items-center gap-2 text-secondary-foreground'>
          <BankFilled aria-hidden />
          {isEdit
            ? 'Cập nhật tài khoản ngân hàng'
            : 'Thêm mới tài khoản ngân hàng'}
        </span>
      }
      styles={{
        footer: {
          borderTop: '1px solid var(--border)',
          marginTop: 20,
          paddingTop: 16
        }
      }}
      footer={
        <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          <ButtonComponent
            block
            htmlType='button'
            type='default'
            content='Hủy'
            onClick={onCancel}
            className='sm:w-auto!'
          />
          <ButtonComponent
            block
            htmlType='submit'
            form={BANK_ACCOUNT_FORM_ID}
            content={isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
            className='sm:w-auto!'
          />
        </div>
      }
    >
      <form
        id={BANK_ACCOUNT_FORM_ID}
        noValidate
        className='grid grid-cols-1 gap-4 md:grid-cols-2'
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <BankAccountScopeSection control={control} />
        <BankAccountSettlementSection control={control} setValue={setValue} />
        <BankAccountWithdrawSection
          control={control}
          withdrawMode={withdrawMode}
        />
      </form>
    </DialogModal>
  )
}

/** Form chỉ mount khi hộp thoại mở, nhờ vậy state tự sạch sau mỗi lần đóng. */
export function BankAccountFormDialog({
  open,
  ...rest
}: BankAccountFormDialogProps) {
  if (!open) return null

  return <BankAccountFormDialogContent {...rest} />
}
