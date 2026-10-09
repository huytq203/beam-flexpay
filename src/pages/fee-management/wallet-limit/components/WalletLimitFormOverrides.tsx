import { ButtonComponent } from '@components/index'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { WalletLimitFormValues } from '../schemas/walletLimitForm.schema'
import { buildEmptyOverride } from '../utils/walletLimit.formMapper'
import { WalletLimitFormOverrideRow } from './WalletLimitFormOverrideRow'
import { WalletLimitFormSection } from './WalletLimitFormSection'

/** `bankOverrides` là trọn bộ: danh sách này thay toàn bộ dòng cũ khi lưu. */
export function WalletLimitFormOverrides() {
  const { control, getValues } = useFormContext<WalletLimitFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bankOverrides'
  })

  return (
    <WalletLimitFormSection
      title='Theo ngân hàng / phương thức'
      description='Danh sách này thay toàn bộ dòng hiện có khi lưu. Dòng lỏng hơn mức chung vẫn lưu được nhưng giao dịch vẫn bị chặn ở mức chung.'
    >
      {fields.map((field, index) => (
        <WalletLimitFormOverrideRow
          key={field.id}
          index={index}
          onRemove={() => remove(index)}
        />
      ))}
      <div>
        <ButtonComponent
          type='default'
          htmlType='button'
          content='Thêm dòng ngân hàng / phương thức'
          onClick={() =>
            append(buildEmptyOverride(getValues('transactionType')))
          }
        />
      </div>
    </WalletLimitFormSection>
  )
}
