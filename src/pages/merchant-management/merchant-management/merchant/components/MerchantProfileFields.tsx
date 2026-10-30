import type { Control } from 'react-hook-form'
import type { UploadFile } from '@components/form'
import {
  FormInput,
  FormInputNumber,
  FormSelect,
  FormSwitch,
  FormTextArea,
  FormUploadCombined
} from '@components/form'
import type { CreateMerchantSchemaType } from '../schemas/Merchant.schema'
import { MerchantFormSection } from './MerchantFormSection'
import { requiredLabel, uploadFieldClassName } from './merchantForm.ui'

const mccOptions = [
  { label: 'F&B — Chuỗi cà phê (MCC 5814)', value: '5814' },
  { label: 'Nhà hàng (MCC 5812)', value: '5812' },
  { label: 'Bán lẻ tổng hợp (MCC 5399)', value: '5399' },
  { label: 'Thời trang (MCC 5691)', value: '5691' },
  { label: 'Dịch vụ phần mềm (MCC 5734)', value: '5734' }
]

const merchantTypeOptions = [
  { label: 'Doanh nghiệp', value: 'ENTERPRISE' },
  { label: 'Hộ kinh doanh', value: 'HOUSEHOLD' }
]

interface Props {
  control: Control<CreateMerchantSchemaType>
  signsAtSubMerchant: boolean
  isEditMode?: boolean
  resolveFileUrl: (file: UploadFile) => Promise<string>
}

export function MerchantProfileFields({
  control,
  signsAtSubMerchant,
  isEditMode = false,
  resolveFileUrl
}: Props) {
  return (
    <MerchantFormSection
      id='merchant-master-profile'
      step='II'
      title='Hồ sơ ĐVCNTT (cấp Master)'
    >
      <div className='space-y-5'>
        <FormSwitch
          control={control}
          name='signSeparateSubMerchantContract'
          label='Ký hợp đồng riêng với Sub-merchant'
          description='Mặc định tắt để ký hợp đồng ở cấp Master. Bật khi hợp đồng sẽ được ký riêng và bắt buộc tại từng Sub-merchant.'
        />

        <div>
          <FormUploadCombined
            control={control}
            name='merchantContract'
            label={
              signsAtSubMerchant
                ? 'Hợp đồng ĐVCNTT (đã ký)'
                : requiredLabel('Hợp đồng ĐVCNTT (đã ký)')
            }
            multiple={false}
            maxCount={1}
            maxFileSizeInMB={10}
            accept='.pdf,application/pdf'
            dragText='Kéo thả hoặc chọn tệp hợp đồng PDF'
            className={uploadFieldClassName}
            classNameLabel='text-sm font-medium text-foreground'
            resolveFileUrl={resolveFileUrl}
            allowRemoveStored={false}
          />
          <p className='mt-1.5 text-xs leading-5 text-muted-foreground'>
            Một PDF nhiều trang, tối đa 10MB. Bắt buộc khi ký ở cấp Master.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2'>
          <FormSelect
            control={control}
            name='mcc'
            className='flex flex-col'
            label={requiredLabel('Loại hình KD / Ngành nghề (MCC)')}
            placeholder='Chọn ngành nghề kinh doanh'
            showSearch
            optionFilterProp='label'
            options={mccOptions}
            classNameLable='text-sm font-medium text-foreground'
          />
          <FormSelect
            control={control}
            name='merchantType'
            className='flex flex-col'
            label={requiredLabel('Loại ĐVCNTT')}
            options={merchantTypeOptions}
            allowClear={false}
            classNameLable='text-sm font-medium text-foreground'
          />

          <div className='md:col-span-2'>
            <FormInput
              control={control}
              name='merchantName'
              className='flex flex-col'
              label={requiredLabel('Tên merchant (tên hiển thị)')}
              placeholder='Tên hiển thị khi thu/chi hộ'
              maxLength={200}
              showCount
              classNameLable='text-sm font-medium text-foreground'
            />
            <p className='mt-1.5 text-xs leading-5 text-muted-foreground'>
              Có thể khác tên pháp lý, tối đa 200 ký tự.
            </p>
          </div>

          {/* Ký quỹ chỉ nhập lúc tạo; khi sửa điều chỉnh ở màn Ký quỹ. */}
          {!isEditMode && (
            <div className='md:col-span-2'>
              <FormInputNumber
                control={control}
                name='escrowAmount'
                label={requiredLabel('Số tiền ký quỹ (VND)')}
                className='flex flex-col'
                classNameLable='text-sm font-medium text-foreground'
                allowEmpty
                thousandSeparator
                precision={0}
                min={0}
                placeholder='Nhập 0 nếu không phải ký quỹ'
                style={{ width: '100%' }}
              />
              <p className='mt-1.5 text-xs leading-5 text-muted-foreground'>
                Hạn nộp 30 ngày tính từ khi ĐVCNTT được duyệt. Nhập 0 nếu ĐVCNTT
                không phải ký quỹ. Điều chỉnh mức và điều khoản ở màn Ký quỹ.
              </p>
            </div>
          )}

          <div className='md:col-span-2'>
            <FormUploadCombined
              control={control}
              name='merchantLogo'
              label='Logo Merchant'
              multiple={false}
              maxCount={1}
              maxFileSizeInMB={2}
              accept='image/png,image/jpeg'
              dragText='Tải lên logo thương hiệu'
              className={uploadFieldClassName}
              classNameLabel='text-sm font-medium text-foreground'
              resolveFileUrl={resolveFileUrl}
              allowRemoveStored={false}
            />
            <p className='mt-1.5 text-xs text-muted-foreground'>
              PNG hoặc JPG, tối đa 2MB.
            </p>
          </div>

          <div className='md:col-span-2'>
            <FormUploadCombined
              control={control}
              name='productImages'
              label='Ảnh sản phẩm / dịch vụ'
              multiple
              maxFileSizeInMB={5}
              accept='image/png,image/jpeg'
              dragText='Kéo thả hoặc chọn nhiều ảnh sản phẩm'
              className={uploadFieldClassName}
              classNameLabel='text-sm font-medium text-foreground'
              resolveFileUrl={resolveFileUrl}
            />
            <p className='mt-1.5 text-xs text-muted-foreground'>
              PNG hoặc JPG, tối đa 5MB mỗi ảnh.
            </p>
          </div>

          <div className='md:col-span-2'>
            <FormInput
              control={control}
              name='website'
              className='flex flex-col'
              label='Địa chỉ website'
              placeholder='https://example.com'
              inputMode='url'
              classNameLable='text-sm font-medium text-foreground'
            />
          </div>

          <FormTextArea
            control={control}
            name='productDescription'
            label='Mô tả sản phẩm / dịch vụ'
            placeholder='Mô tả ngắn về sản phẩm hoặc dịch vụ cung cấp'
            rows={4}
            maxLength={1000}
            showCount
            className='flex flex-col md:col-span-2'
            classNameLable='text-sm font-medium text-foreground'
          />
        </div>
      </div>
    </MerchantFormSection>
  )
}
