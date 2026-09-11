import { FormSelect } from '@components/form'
import { PAYMENT_METHOD_LABELS, getFeeLabel } from '@constants/feeLabels'
import { useGetBankQuery } from '@services/apiFeeBank'
import type { Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import {
  PAYMENT_METHOD_VALUES,
  getDomainFieldRules
} from '../constants/feeConfigFields'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { MerchantPickerField } from './MerchantPickerField'
import { SectionHeading } from './SectionHeading'

interface AssignmentSectionProps {
  control: Control<FeeConfigFormValues>
}

const PAYMENT_METHOD_OPTIONS = PAYMENT_METHOD_VALUES.map((value) => ({
  value,
  label: getFeeLabel(value, PAYMENT_METHOD_LABELS)
}))

/**
 * Tiêu chí khớp lệnh của bản gán.
 *
 * Ô để trống mang nghĩa "áp cho tất cả", nên placeholder phải nói ra điều đó —
 * người vận hành đọc ô rỗng là "chưa điền" chứ không phải "mọi ngân hàng".
 */
export const AssignmentSection = ({ control }: AssignmentSectionProps) => {
  const feeDomain = useWatch({ control, name: 'feeDomain' })
  const rules = getDomainFieldRules(feeDomain)

  // `PaginationRequest` của service phí chặn size trên 100; gửi hơn là ăn 400.
  const { data: bankData } = useGetBankQuery({ page: 1, size: 100 })

  const bankOptions = (bankData?.content ?? []).map((bank) => ({
    value: bank.code,
    label: `${bank.name} (${bank.code})`
  }))

  return (
    <section>
      <SectionHeading hint='Bỏ trống một tiêu chí nghĩa là chính sách áp cho mọi giá trị của tiêu chí đó.'>
        Gán đối tượng
      </SectionHeading>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
        <FormSelect
          name='bankCode'
          control={control}
          required={rules.bankRequired}
          label='Ngân hàng'
          placeholder={
            rules.bankRequired ? 'Chọn ngân hàng' : 'Mọi ngân hàng'
          }
          showSearch
          optionFilterProp='label'
          options={bankOptions}
          className='col-span-12 flex flex-col md:col-span-4'
        />
        <FormSelect
          name='paymentMethod'
          control={control}
          label='Phương thức giao dịch'
          placeholder='Mọi phương thức'
          options={PAYMENT_METHOD_OPTIONS}
          className='col-span-12 flex flex-col md:col-span-4'
        />
        {rules.showMerchant && (
          <MerchantPickerField
            control={control}
            className='col-span-12 flex flex-col'
          />
        )}
      </div>

    </section>
  )
}
