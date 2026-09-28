import type { Control } from 'react-hook-form'

import { FormSelect, FormSwitch } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface ClassificationSectionProps {
  control: Control<BusinessWalletFormValues>
}

export function ClassificationSection({ control }: ClassificationSectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-classification'
      step='V'
      title='Phân loại tài khoản'
    >
      <FormSelect
        name='businessType'
        control={control}
        label='Loại hình kinh doanh'
        options={[{ value: 'ENTERPRISE', label: 'Doanh nghiệp' }, { value: 'HOUSEHOLD', label: 'Hộ kinh doanh' }]}
        className='col-span-12 flex flex-col md:col-span-6'
      />
      <FormSwitch
        name='isInternalWallet'
        control={control}
        label='Đánh dấu Ví nội bộ'
        description='Nhãn phân loại nội bộ để lọc và tra cứu — không thay đổi phí, KYB hay báo cáo doanh thu.'
        className='col-span-12 flex flex-col'
      />
    </BusinessWalletFormSection>
  )
}
