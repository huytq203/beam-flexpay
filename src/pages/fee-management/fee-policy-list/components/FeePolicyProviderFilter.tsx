import { FormSelect } from '@components/form'
import { toProviderOptions } from '@pages/fee-management/fee-config/constants/feeProvider'
import { useGetPaymentPartnersQuery } from '@services/apiFeePartner'
import type { Control } from 'react-hook-form'
import type { FeePolicyFilterValues } from './FeePolicyFilterBar'

interface FeePolicyProviderFilterProps {
  control: Control<FeePolicyFilterValues>
}

/** Lọc theo nhà cung cấp (NAPAS, VIETQR) của bản gán; danh mục nhỏ nên lấy trọn một lần. */
export const FeePolicyProviderFilter = ({
  control
}: FeePolicyProviderFilterProps) => {
  const { data: partners, isFetching } = useGetPaymentPartnersQuery()

  return (
    <FormSelect
      name='providerCode'
      control={control}
      label='Nhà cung cấp  '
      placeholder='Mọi nhà cung cấp'
      allowClear
      showSearch
      optionFilterProp='label'
      loading={isFetching}
      options={toProviderOptions(partners)}
      className='flex flex-col'
    />
  )
}
