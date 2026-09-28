import type { UseFormReturn } from 'react-hook-form'
import type { ApiParentMerchant } from '@/app/services/merchantHierarchyApi'
import { FormInput, FormSwitch, FormTextArea } from '@components/form'
import { Input, TextArea } from '@components/index'
import type { SubMerchantApiDraft } from '../schemas/subMerchantApi.schema'

interface InheritableContactFieldsProps {
  form: UseFormReturn<SubMerchantApiDraft>
  parent?: ApiParentMerchant
  inheritPhone: boolean
  inheritAddress: boolean
}

const fieldClass = 'flex min-w-0 flex-col gap-1.5'
const labelClass = 'text-sm font-medium text-foreground'

const inheritedPlaceholder = (parent?: ApiParentMerchant): string =>
  parent ? 'Merchant cha chưa có thông tin' : 'Chọn Merchant cha trước'

// Giá trị kế thừa hiện ngay trong ô bị khóa, để người tạo thấy đúng thứ sẽ được
// áp dụng thay vì chỉ thấy một công tắc "kế thừa" không rõ kế thừa gì.
export function InheritableContactFields({
  form,
  parent,
  inheritPhone,
  inheritAddress
}: InheritableContactFieldsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <div className='flex flex-col gap-3'>
        <FormSwitch
          control={form.control}
          name='inheritPhone'
          label='Kế thừa số điện thoại Merchant cha'
          description='Tắt để nhập số điện thoại riêng cho Sub-merchant.'
        />
        {inheritPhone ? (
          <div className={fieldClass}>
            <label
              htmlFor='inherited-phone'
              className={`${labelClass} inline-flex items-center`}
            >
              Số điện thoại
            </label>
            <Input
              id='inherited-phone'
              disabled
              value={parent?.contactPhone ?? ''}
              placeholder={inheritedPlaceholder(parent)}
            />
          </div>
        ) : (
          <FormInput
            control={form.control}
            name='phone'
            label='Số điện thoại'
            placeholder='Nhập số điện thoại'
            maxLength={15}
            required
            className={fieldClass}
            classNameLable={labelClass}
          />
        )}
      </div>
      <div className='flex flex-col gap-3'>
        <FormSwitch
          control={form.control}
          name='inheritAddress'
          label='Kế thừa địa chỉ Merchant cha'
          description='Tắt để nhập địa chỉ riêng cho Sub-merchant.'
        />
        {inheritAddress ? (
          <div className={fieldClass}>
            <label
              htmlFor='inherited-address'
              className={`${labelClass} inline-flex items-center`}
            >
              Địa chỉ
            </label>
            <TextArea
              id='inherited-address'
              disabled
              rows={3}
              value={parent?.address ?? ''}
              placeholder={inheritedPlaceholder(parent)}
            />
          </div>
        ) : (
          <FormTextArea
            control={form.control}
            name='address'
            label='Địa chỉ'
            placeholder='Nhập địa chỉ'
            maxLength={500}
            rows={3}
            className={fieldClass}
            classNameLable={labelClass}
          />
        )}
      </div>
    </div>
  )
}
