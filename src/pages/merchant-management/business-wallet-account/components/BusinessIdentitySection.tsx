import type { Control } from 'react-hook-form'

import { FormInput, FormTextArea } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface BusinessIdentitySectionProps {
  control: Control<BusinessWalletFormValues>
}

const fieldClassName = 'col-span-12 flex flex-col md:col-span-6'

export function BusinessIdentitySection({
  control
}: BusinessIdentitySectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-identity'
      step='II'
      title='Định danh doanh nghiệp'
    >
      <FormInput
        name='businessName'
        control={control}
        required
        label='Tên doanh nghiệp'
        placeholder='Tên pháp lý theo Giấy chứng nhận ĐKKD'
        className={fieldClassName}
      />

      <div className={fieldClassName}>
        <FormInput
          name='taxCode'
          control={control}
          required
          label='Mã số thuế'
          placeholder='10 hoặc 13 ký tự'
          className='flex flex-col'
        />
        <span className='mt-1 text-xs text-muted-foreground'>
          Thay đổi mã số thuế sẽ kích hoạt lại KYB
        </span>
      </div>

      <FormTextArea
        name='headOfficeAddress'
        control={control}
        label='Địa chỉ trụ sở'
        rows={2}
        placeholder='Tỉnh/TP · Quận/Huyện · Phường/Xã · Số nhà/Tên đường'
        className='col-span-12 flex flex-col'
      />

      <FormInput
        name='legalRepName'
        control={control}
        required
        label='Người đại diện pháp luật'
        placeholder='Họ tên theo Giấy chứng nhận ĐKKD'
        className={fieldClassName}
      />

      <FormInput
        name='legalRepIdNumber'
        control={control}
        required
        label='Số CCCD / Hộ chiếu (ĐDPL)'
        placeholder='Số định danh người đại diện'
        className={fieldClassName}
      />
    </BusinessWalletFormSection>
  )
}
