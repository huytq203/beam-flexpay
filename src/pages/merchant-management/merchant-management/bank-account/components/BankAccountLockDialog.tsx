import { FormTextArea } from '@components/form'
import { LockFilled, LockKeyOpenIcon } from '@components/icons'
import { ButtonComponent, DialogModal } from '@components/index'
import { blockLeadingAndRepeatedSpace } from '@utils/inputHandlers'

import { useBankAccountLock } from '../hooks/useBankAccountLock'
import {
  maskAccountNumber,
  SCOPE_LABEL
} from '../constants/bank-account.constant'
import type {
  BankAccountLockMode,
  BankAccountRow
} from '../types/bank-account.type'
import { BankAccountNotice } from './BankAccountNotice'

const BANK_ACCOUNT_LOCK_FORM_ID = 'bank-account-lock-form'

interface BankAccountLockDialogProps {
  open: boolean
  mode: BankAccountLockMode
  row: BankAccountRow | null
  onConfirmed: () => void
  onCancel: () => void
}

const SummaryCell = ({ label, value }: { label: string; value: string }) => (
  <div className='flex-1 rounded-lg border border-border bg-muted/50 p-3'>
    <p className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
      {label}
    </p>
    <p className='mt-1 text-sm font-semibold text-foreground'>{value}</p>
  </div>
)

function BankAccountLockDialogContent({
  mode,
  row,
  onConfirmed,
  onCancel
}: Omit<BankAccountLockDialogProps, 'open' | 'row'> & { row: BankAccountRow }) {
  const { control, submit } = useBankAccountLock({ mode, onConfirmed })
  const isLock = mode === 'lock'

  return (
    <DialogModal
      open
      mode={isLock ? 'DELETE' : 'CONFIRM'}
      width={{ xs: '95%', md: 520 }}
      onOk={() => {}}
      onCancel={onCancel}
      title={
        <span className='flex items-center gap-2 text-secondary-foreground'>
          {isLock ? (
            <LockFilled aria-hidden />
          ) : (
            <LockKeyOpenIcon aria-hidden size={18} />
          )}
          {isLock
            ? 'Xác nhận khóa tài khoản ngân hàng'
            : 'Xác nhận mở khóa tài khoản ngân hàng'}
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
            danger={isLock}
            htmlType='submit'
            form={BANK_ACCOUNT_LOCK_FORM_ID}
            content={isLock ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            className='sm:w-auto!'
          />
        </div>
      }
    >
      <form
        id={BANK_ACCOUNT_LOCK_FORM_ID}
        noValidate
        className='flex flex-col gap-4'
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <BankAccountNotice tone={isLock ? 'danger' : 'info'}>
          {isLock
            ? 'Tài khoản bị khóa sẽ ngừng nhận quyết toán và rút tiền cho tới khi được mở lại. Thao tác được ghi Audit Log.'
            : 'Mở khóa sẽ cho phép tài khoản nhận quyết toán và rút tiền trở lại. Thao tác được ghi Audit Log.'}
        </BankAccountNotice>

        <div className='flex flex-col gap-3 sm:flex-row'>
          <SummaryCell
            label='Ngân hàng · Chủ TK'
            value={`${row.bankName} · ${row.accountName}`}
          />
          <SummaryCell
            label='Số tài khoản · Cấp'
            value={`${maskAccountNumber(row.accountNumber)} · ${SCOPE_LABEL[row.scope]}`}
          />
        </div>

        <FormTextArea
          control={control}
          name='reason'
          rows={4}
          label={
            <span>
              {isLock ? 'Lý do khóa' : 'Lý do mở khóa'}{' '}
              <span className='text-danger-strong'>*</span>
            </span>
          }
          placeholder={`Bắt buộc — nêu lý do ${isLock ? 'khóa' : 'mở khóa'} tài khoản (tối thiểu 10 ký tự)…`}
          className='flex flex-col gap-1.5'
          classNameLable='text-sm font-medium text-foreground'
          onKeyDown={blockLeadingAndRepeatedSpace}
        />

        <BankAccountNotice tone='warning'>
          Thao tác yêu cầu{' '}
          <strong className='font-semibold'>
            xác thực nhạy cảm (OTP hoặc mật khẩu)
          </strong>{' '}
          trước khi áp dụng.
        </BankAccountNotice>
      </form>
    </DialogModal>
  )
}

export function BankAccountLockDialog({
  open,
  row,
  ...rest
}: BankAccountLockDialogProps) {
  if (!open || !row) return null

  return <BankAccountLockDialogContent row={row} {...rest} />
}
