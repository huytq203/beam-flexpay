import { FormSelect } from '@components/form'
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
  /** Phí đầu vào: người chịu luôn là Hệ thống và không có bên chịu phí chuyển tiền. */
  inputCost?: boolean
}

/** Người chịu, người hưởng và bên chịu phí chuyển tiền; ba ô cùng một nhóm nên tách khỏi thanh lọc chính. */
export const FeePolicyPartyFilters = ({
  control,
  serviceType,
  inputCost = false
}: FeePolicyPartyFiltersProps) => (
  <>
    {!inputCost && (
      <FormSelect
        name='payerType'
        control={control}
        label='Người chịu phí'
        placeholder='Tất cả người chịu'
        allowClear
        options={[...PAYER_TYPE_FILTER_OPTIONS]}
        className='flex flex-col'
      />
    )}
    <FormSelect
      name='beneficiaryType'
      control={control}
      label='Người hưởng phí'
      placeholder='Tất cả người hưởng'
      allowClear
      options={BENEFICIARY_TYPE_FILTER_OPTIONS}
      className='flex flex-col'
    />
    {!inputCost && (
      <FormSelect
        name='feeBearer'
        control={control}
        label={'Bên chịu phí'}
        placeholder='Tất cả'
        allowClear
        disabled={
          Boolean(serviceType) && serviceType !== 'EWALLET_TRANSFER_INTERNAL'
        }
        options={[...FEE_BEARER_FILTER_OPTIONS]}
        className='flex flex-col'
      />
    )}
  </>
)
