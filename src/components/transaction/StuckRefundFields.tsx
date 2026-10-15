import { useWatch, type Control } from 'react-hook-form'
import { FormCheckbox, FormInput } from '@components/form'
import { STUCK_UPDATE_CODE_MAX_LENGTH } from '@type/stuckTransaction.type'
import type { StuckTransactionUpdateFormValues } from './StuckTransaction.schema'

interface StuckRefundFieldsProps {
  control: Control<StuckTransactionUpdateFormValues>
  /** `optionalFields` của action FAILED: checkbox chỉ có khi chứa `refund` (chỉ lệnh nạp). */
  optionalFields: readonly string[]
}

const REFUND_CODE_FIELDS = [
  {
    name: 'refundAuthCode',
    label: 'Mã chuẩn chi (hoàn)',
    placeholder: 'VD: AUTH123456'
  },
  {
    name: 'refundSettlementId',
    label: 'Mã đối soát (hoàn)',
    placeholder: 'VD: STL20260825001'
  },
  {
    name: 'refundBankReference',
    label: 'Mã tham chiếu (hoàn)',
    placeholder: 'VD: FT26282ABCDE'
  }
] as const

/**
 * Chi tiền thật về tài khoản ngân hàng khách đã dùng để nạp, không cộng số dư ví. Các
 * mã hoàn đều không bắt buộc.
 */
export const StuckRefundFields = ({
  control,
  optionalFields
}: StuckRefundFieldsProps) => {
  const refund = useWatch({ control, name: 'refund' })
  if (!optionalFields.includes('refund')) return null

  const codeFields = REFUND_CODE_FIELDS.filter(({ name }) =>
    optionalFields.includes(name)
  )

  return (
    <div className='flex flex-col gap-3 rounded-lg border border-border p-3'>
      <FormCheckbox
        control={control}
        name='refund'
        label={
          <span>
            Hoàn tiền cho khách hàng (chi tiền về tài khoản ngân hàng đã nạp)
            <span className='block text-xs text-muted-foreground'>
              Hệ thống sẽ chi tiền về tài khoản ngân hàng khách đã dùng để nạp.
              Không cộng số dư ví. Chỉ nên chọn khi đã xác nhận ngân hàng đã trừ
              tiền khách.
            </span>
          </span>
        }
      />
      {refund && codeFields.length > 0 && (
        <div className='grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3'>
          {codeFields.map(({ name, label, placeholder }) => (
            <FormInput
              key={name}
              control={control}
              name={name}
              label={label}
              placeholder={placeholder}
              className='flex flex-col gap-1'
              maxLength={STUCK_UPDATE_CODE_MAX_LENGTH}
            />
          ))}
        </div>
      )}
    </div>
  )
}
