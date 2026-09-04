import type { Control } from 'react-hook-form'

import { FormUploadCombined } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface LegalDocsSectionProps {
  control: Control<BusinessWalletFormValues>
}

const uploadClassName = 'col-span-12 flex flex-col md:col-span-6'

export function LegalDocsSection({ control }: LegalDocsSectionProps) {
  return (
    <BusinessWalletFormSection
      id='business-wallet-legal-docs'
      step='IV'
      title='Hồ sơ pháp lý (đính kèm)'
    >
      <FormUploadCombined
        name='businessLicense'
        control={control}
        label='Giấy phép ĐKKD'
        multiple={false}
        maxCount={1}
        accept='.pdf,.jpg,.jpeg,.png'
        dragText='Tải lên tệp · PDF / JPG / PNG · tối đa 5MB'
        className={uploadClassName}
      />
      <FormUploadCombined
        name='authorizationLetter'
        control={control}
        label='Giấy ủy quyền'
        multiple={false}
        maxCount={1}
        accept='.pdf,.jpg,.jpeg,.png'
        dragText='Tải lên tệp · Bắt buộc nếu quản lý ví khác ĐDPL'
        className={uploadClassName}
      />
      <FormUploadCombined
        name='idCardFront'
        control={control}
        label='CCCD — Mặt trước'
        multiple={false}
        maxCount={1}
        accept='.jpg,.jpeg,.png'
        dragText='Tải lên tệp · JPG / PNG · tối đa 5MB'
        className={uploadClassName}
      />
      <FormUploadCombined
        name='idCardBack'
        control={control}
        label='CCCD — Mặt sau'
        multiple={false}
        maxCount={1}
        accept='.jpg,.jpeg,.png'
        dragText='Tải lên tệp · JPG / PNG · tối đa 5MB'
        className={uploadClassName}
      />
    </BusinessWalletFormSection>
  )
}
