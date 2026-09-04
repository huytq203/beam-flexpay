import type { Control } from 'react-hook-form'

import { FormDatePicker, FormInput } from '@components/form'
import { ButtonComponent } from '@components/index'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface WalletManagerSectionProps {
  control: Control<BusinessWalletFormValues>
  onCopyContactPhone: () => void
}

const fieldClassName = 'col-span-12 flex flex-col md:col-span-6'

export function WalletManagerSection({
  control,
  onCopyContactPhone
}: WalletManagerSectionProps) {
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

      <div className='col-span-12 flex flex-col'>
        <label
          htmlFor='otpPhone'
          className='inline-flex items-center font-medium'
        >
          SĐT nhận OTP
          <span className='ml-1 text-red-600'>*</span>
        </label>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
          <FormInput
            name='otpPhone'
            control={control}
            required
            placeholder='SĐT nhận OTP của tài khoản Master'
            className='flex min-w-0 flex-1 flex-col'
          />
          <ButtonComponent
            htmlType='button'
            type='default'
            content='Sao chép từ số liên hệ'
            className='w-full shrink-0 sm:w-auto'
            onClick={onCopyContactPhone}
          />
        </div>
        <span className='mt-1 text-xs text-muted-foreground'>
          Đồng thời là SĐT nhận OTP của tài khoản Master (Người đại diện)
        </span>
      </div>
    </BusinessWalletFormSection>
  )
}
