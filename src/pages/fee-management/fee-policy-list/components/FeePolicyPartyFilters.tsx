import { FormLabelHint, FormSelect } from '@components/form'
import type { Control } from 'react-hook-form'
import {
  BENEFICIARY_TYPE_FILTER_OPTIONS,
  FEE_BEARER_FILTER_OPTIONS,
  PAYER_TYPE_FILTER_OPTIONS
} from '../constants/feePolicyFilterOptions'
import type { FeePolicyFilterValues } from './FeePolicyFilterBar'

interface FeePolicyPartyFiltersProps {
  control: Control<FeePolicyFilterValues>
  serviceType: string | undefined
}

/** Người chịu, người hưởng và bên chịu phí chuyển tiền; ba ô cùng một nhóm nên tách khỏi thanh lọc chính. */
export const FeePolicyPartyFilters = ({
  control,
  serviceType
}: FeePolicyPartyFiltersProps) => (
  <>
    <FormSelect
      name='payerType'
      control={control}
      label='Người chịu phí'
      placeholder='Mọi người chịu'
      allowClear
      options={[...PAYER_TYPE_FILTER_OPTIONS]}
      className='flex flex-col'
    />
    <FormSelect
      name='beneficiaryType'
      control={control}
      label='Người hưởng phí'
      placeholder='Mọi người hưởng'
      allowClear
      options={BENEFICIARY_TYPE_FILTER_OPTIONS}
      className='flex flex-col'
    />
    <FormSelect
      name='feeBearer'
      control={control}
      label={
        <FormLabelHint
          label='Bên chịu phí chuyển tiền'
          hint='Chỉ áp dụng cho chuyển tiền: chọn là chỉ còn chính sách chuyển tiền'
        />
      }
      placeholder='Mọi bên'
      allowClear
      disabled={
        Boolean(serviceType) && serviceType !== 'EWALLET_TRANSFER_INTERNAL'
      }
      options={[...FEE_BEARER_FILTER_OPTIONS]}
      className='flex flex-col'
    />
  </>
)
