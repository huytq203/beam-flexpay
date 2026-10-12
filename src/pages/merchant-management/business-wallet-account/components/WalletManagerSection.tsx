import type { Control } from 'react-hook-form'

import { FormDatePicker, FormInput } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface WalletManagerSectionProps {
  control: Control<BusinessWalletFormValues>
}

const fieldClassName = 'col-span-12 flex flex-col md:col-span-6'

export function WalletManagerSection({ control }: WalletManagerSectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-manager'
      step='III'
      title='Người quản lý tài khoản ví'
    >
      <FormInput
        name='managerName'
        control={control}
        required
        label='Họ và tên người quản lý ví'
        placeholder='ĐDPL hoặc người được ủy quyền'
        className={fieldClassName}
      />
      <FormInput
        name='managerPosition'
        control={control}
        required
        label='Chức vụ'
        placeholder='VD: Giám đốc / Kế toán trưởng'
        className={fieldClassName}
      />
      <FormInput
        name='managerIdNumber'
        control={control}
        required
        label='Số CCCD / Hộ chiếu'
        placeholder='9 hoặc 12 ký tự'
        className={fieldClassName}
      />
      <FormDatePicker
        name='managerIdExpiry'
        control={control}
        label='Ngày hết hạn CCCD'
        placeholder='DD/MM/YYYY'
        className={fieldClassName}
      />
    </BusinessWalletFormSection>
  )
}
