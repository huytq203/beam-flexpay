import type { Control } from 'react-hook-form'
import type { UploadFile } from 'antd'

import { FormUploadCombined } from '@components/form'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { BusinessWalletFormSection } from './BusinessWalletFormSection'

interface LegalDocsSectionProps {
  control: Control<BusinessWalletFormValues>
  resolveFileUrl: (file: UploadFile) => Promise<string>
}

const uploadClassName = 'col-span-12 flex flex-col md:col-span-6'

export function LegalDocsSection({
  control,
  resolveFileUrl
}: LegalDocsSectionProps) {
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
        resolveFileUrl={resolveFileUrl}
        allowRemoveStored={false}
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
        resolveFileUrl={resolveFileUrl}
        allowRemoveStored={false}
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
        resolveFileUrl={resolveFileUrl}
        allowRemoveStored={false}
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
        resolveFileUrl={resolveFileUrl}
        allowRemoveStored={false}
      />
    </BusinessWalletFormSection>
  )
}
