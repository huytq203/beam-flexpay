import type { Control } from 'react-hook-form'

import { FormSwitch } from '@components/form'

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
