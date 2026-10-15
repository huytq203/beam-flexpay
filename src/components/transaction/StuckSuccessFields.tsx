import type { Control } from 'react-hook-form'
import { FormInput } from '@components/form'
import { STUCK_UPDATE_CODE_MAX_LENGTH } from '@type/stuckTransaction.type'
import { StuckReceiptField } from './StuckReceiptField'
import type { StuckTransactionUpdateFormValues } from './StuckTransaction.schema'

interface StuckSuccessFieldsProps {
  control: Control<StuckTransactionUpdateFormValues>
  transactionCode: string
  /** `optionalFields` của action POSTED: chỉ trường có trong đây mới hiển thị. */
  optionalFields: readonly string[]
  isSubmitting?: boolean
}

const CODE_FIELDS = [
  { name: 'authCode', label: 'Auth Code', placeholder: 'VD: AUTH123456' },
  {
    name: 'settlementId',
    label: 'Settlement ID',
    placeholder: 'VD: STL20260825001'
  },
  {
    name: 'bankReference',
    label: 'Mã tham chiếu',
    placeholder: 'VD: FT26282ABCDE'
  }
] as const

/** Nhóm thông tin đối soát khi chốt Thành công; không trường nào bắt buộc. */
export const StuckSuccessFields = ({
  control,
  transactionCode,
  optionalFields,
  isSubmitting
}: StuckSuccessFieldsProps) => {
  const codeFields = CODE_FIELDS.filter(({ name }) =>
    optionalFields.includes(name)
  )
  const hasReceipt = optionalFields.includes('receiptKey')
  if (codeFields.length === 0 && !hasReceipt) return null

  return (
    <fieldset className='min-w-0 rounded-lg border border-border p-3'>
      <legend className='px-1 text-sm font-semibold text-foreground'>
        Thông tin đối soát (không bắt buộc)
      </legend>
      <div className='grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3'>
        {codeFields.map(({ name, label, placeholder }) => (
          <FormInput
            key={name}
            control={control}
            name={name}
            label={label}
            className='flex flex-col gap-1'
            placeholder={placeholder}
            maxLength={STUCK_UPDATE_CODE_MAX_LENGTH}
          />
        ))}
        {hasReceipt && (
          <StuckReceiptField
            transactionCode={transactionCode}
            disabled={isSubmitting}
          />
        )}
      </div>
    </fieldset>
  )
}
