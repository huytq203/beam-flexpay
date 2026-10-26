import { FormSelect } from '@components/form'
import { ButtonComponent } from '@components/index'
import {
  WalletLimitPaymentMethod,
  WalletLimitTransactionType
} from '@type/walletLimit.type'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  BANK_OPTIONS,
  LIMIT_FIELD_LABELS,
  OVERRIDE_TRANSACTION_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS
} from '../constants/walletLimit.constants'
import type { WalletLimitFormValues } from '../schemas/walletLimitForm.schema'
import { WalletLimitFormNumberField } from './WalletLimitFormNumberField'

interface WalletLimitFormOverrideRowProps {
  index: number
  onRemove: () => void
}

const FIELD_CLASS = 'flex min-w-0 flex-col gap-1.5'
const LABEL_CLASS = 'text-sm font-medium'
const REQUIRED_PLACEHOLDER = 'Nhập số tiền'
const OPTIONAL_PLACEHOLDER = 'Không giới hạn'

/** Chuyển tiền chỉ trừ số dư ví; nạp/rút đi qua tài khoản ngân hàng liên kết. */
const methodOptionsFor = (isTransfer: boolean) =>
  PAYMENT_METHOD_OPTIONS.filter(
    (option) =>
      option.value ===
      (isTransfer
        ? WalletLimitPaymentMethod.WALLET_BALANCE
        : WalletLimitPaymentMethod.LINKED_ACCOUNT)
  )

export function WalletLimitFormOverrideRow({
  index,
  onRemove
}: WalletLimitFormOverrideRowProps) {
  const { control, setValue } = useFormContext<WalletLimitFormValues>()
  const row = `bankOverrides.${index}` as const
  const transactionType = useWatch({ control, name: `${row}.transactionType` })
  const isTransfer = transactionType === WalletLimitTransactionType.TRANSFER

  const handleTransactionTypeChange = (next: string | number) => {
    setValue(`${row}.paymentMethod`, '')
    if (next === WalletLimitTransactionType.TRANSFER) {
      setValue(`${row}.bankCode`, '')
    }
  }

  return (
    <div className='grid grid-cols-1 gap-3 rounded-xl border border-border p-4 md:grid-cols-2 xl:grid-cols-4'>
      <div className='col-span-full flex items-center justify-between gap-2'>
        <b className='text-sm text-foreground'>Dòng {index + 1}</b>
        <ButtonComponent
          type='default'
          size='small'
          htmlType='button'
          content='Xóa dòng'
          aria-label={`Xóa dòng ${index + 1}`}
          onClick={onRemove}
        />
      </div>
      <FormSelect<WalletLimitFormValues>
        control={control}
        name={`${row}.transactionType`}
        label='Loại giao dịch'
        options={OVERRIDE_TRANSACTION_TYPE_OPTIONS}
        allowClear={false}
        onChange={handleTransactionTypeChange}
        className={FIELD_CLASS}
        classNameLable={LABEL_CLASS}
      />
      <FormSelect<WalletLimitFormValues>
        control={control}
        name={`${row}.bankCode`}
        label='Ngân hàng'
        options={BANK_OPTIONS}
        disabled={isTransfer}
        placeholder={isTransfer ? 'Không áp dụng' : 'Chọn ngân hàng'}
        className={FIELD_CLASS}
        classNameLable={LABEL_CLASS}
      />
      <FormSelect<WalletLimitFormValues>
        control={control}
        name={`${row}.paymentMethod`}
        label='Phương thức'
        options={methodOptionsFor(isTransfer)}
        placeholder='Chọn phương thức'
        className={FIELD_CLASS}
        classNameLable={LABEL_CLASS}
      />
      <WalletLimitFormNumberField
        name={`${row}.minPerTransaction`}
        label={LIMIT_FIELD_LABELS.minPerTransaction}
        placeholder={REQUIRED_PLACEHOLDER}
        required
      />
      <WalletLimitFormNumberField
        name={`${row}.maxPerTransaction`}
        label={LIMIT_FIELD_LABELS.maxPerTransaction}
        placeholder={REQUIRED_PLACEHOLDER}
        required
      />
      <WalletLimitFormNumberField
        name={`${row}.dailyMaximum`}
        label={LIMIT_FIELD_LABELS.dailyMaximum}
        placeholder={REQUIRED_PLACEHOLDER}
        required
      />
    </div>
  )
}
