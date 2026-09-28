import type { Control } from 'react-hook-form'

import { FormInput } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface AccountInfoSectionProps {
  control: Control<BusinessWalletFormValues>
  isEditMode: boolean
}

const fieldClassName = 'col-span-12 flex flex-col md:col-span-6'

export function AccountInfoSection({
  control,
  isEditMode
}: AccountInfoSectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-account-info'
      step='I'
      title='Thông tin tài khoản'
    >
      <div className={fieldClassName}>
        <FormInput
          name='email'
          control={control}
          required
          label='Email đăng ký (Username)'
          placeholder='abc@domain.com'
          disabled={isEditMode}
          className='flex flex-col'
        />
        <span className='mt-1 text-xs text-muted-foreground'>
          {isEditMode
            ? 'Không cho phép sửa — định danh đăng nhập'
            : 'Dùng làm Username của tài khoản Master'}
        </span>
      </div>
    </BusinessWalletFormSection>
  )
}
