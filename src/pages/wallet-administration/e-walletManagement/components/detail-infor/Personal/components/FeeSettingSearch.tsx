import type { ApplicableFeeRuleFilter } from '@/app/schemas/applicable-fee-rule.schema'
import { FormSelect } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import {
  CARD_TYPE_LABELS,
  EFFECTIVE_STATUS_CONFIG,
  PAYMENT_METHOD_LABELS,
  SERVICE_TYPE_LABELS
} from '@constants/feeLabels'
import { useGetBankQuery } from '@services/apiFeeBank'
import { useForm } from 'react-hook-form'

interface FeeSettingSearchProps {
  policyOptions: { value: string; label: string }[]
  onSearch: (filter: ApplicableFeeRuleFilter) => void
}
interface Bank {
  code: string;
  name: string;
}

const DEFAULT_VALUES: ApplicableFeeRuleFilter = {
  feePolicyId: undefined,
  effectiveStatus: undefined,
  serviceType: undefined,
  paymentMethod: undefined,
  bankCode: undefined,
  cardType: undefined
}

const toOptions = (labels: Readonly<Record<string, string>>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

const STATUS_OPTIONS = Object.entries(EFFECTIVE_STATUS_CONFIG).map(
  ([value, config]) => ({ value, label: config.label })
)

const FIELD_CLASS = 'col-span-1 flex flex-col'

/**
 * Hai nhóm ô lọc có ngữ nghĩa khác hẳn nhau, nên chúng được tách bằng bố cục
 * chứ không chỉ bằng một dòng chú thích: nhóm trên thu hẹp theo bản thân quy
 * tắc, nhóm dưới thu hẹp theo điều kiện áp dụng — và một bản gán để trống điều
 * kiện vẫn phải hiện ra vì nó đang thực sự có hiệu lực.
 */
export const FeeSettingSearch = ({
  policyOptions,
  onSearch
}: FeeSettingSearchProps) => {
  const { control, handleSubmit, reset } = useForm<ApplicableFeeRuleFilter>({
    defaultValues: DEFAULT_VALUES
  })
  const { data: dataBank } = useGetBankQuery({})

  const bankOptions = (dataBank?.content ?? []).map((bank: Bank) => ({
    value: bank.code,
    label: bank.name
  }))

  const handleReset = () => {
    reset(DEFAULT_VALUES)
    onSearch({})
  }

  return (
    <form onSubmit={handleSubmit(onSearch)}>
      {/* Cùng lưới 4 cột với nhóm điều kiện bên dưới để hai nhóm thẳng cột. */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
        <FormSelect
          control={control}
          name='feePolicyId'
          label='Chính sách phí'
          options={policyOptions}
          placeholder='Mọi chính sách đang áp'
          className='flex flex-col md:col-span-2'
        />
        <FormSelect
          control={control}
          name='effectiveStatus'
          label='Trạng thái hiệu lực'
          options={STATUS_OPTIONS}
          placeholder='Tất cả'
          className={FIELD_CLASS}
        />
      </div>

      <fieldset className='mt-4  pt-3'>
      
        <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <FormSelect
            control={control}
            name='serviceType'
            label='Loại dịch vụ'
            options={toOptions(SERVICE_TYPE_LABELS)}
            placeholder='Tất cả'
            className={FIELD_CLASS}
          />
          <FormSelect
            control={control}
            name='paymentMethod'
            label='Phương thức thanh toán'
            options={toOptions(PAYMENT_METHOD_LABELS)}
            placeholder='Tất cả'
            className={FIELD_CLASS}
          />
          <FormSelect
            control={control}
            name='bankCode'
            label='Ngân hàng'
            options={bankOptions}
            placeholder='Tất cả'
            className={FIELD_CLASS}
          />
          <FormSelect
            control={control}
            name='cardType'
            label='Loại thẻ'
            options={toOptions(CARD_TYPE_LABELS)}
            placeholder='Tất cả'
            className={FIELD_CLASS}
          />
        </div>
      </fieldset>

      <div className='mt-3 flex justify-end gap-1'>
        <ButtonComponent
          htmlType='submit'
          icon={<MagnifyingGlassIcon size={18} />}
          content='Tìm kiếm'
        />
        <ButtonComponent
          onClick={handleReset}
          type='default'
          icon={<BroomIcon size={18} />}
          content='Xóa lọc'
        />
      </div>
    </form>
  )
}
