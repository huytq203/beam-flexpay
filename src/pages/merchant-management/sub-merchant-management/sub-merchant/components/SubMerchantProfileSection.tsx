import { useEffect } from 'react'
import type { Control, UseFormSetValue } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { FormCheckbox, FormInput, FormSelect, FormTextArea } from '@components/form'
import { CardComponent } from '@components/index'

import type { SubMerchantFormValue } from '../schemas/subMerchant.schema'
import type { ParentMerchantSource } from '../types/subMerchant.type'

interface SubMerchantProfileSectionProps {
  control: Control<SubMerchantFormValue>
  parent?: ParentMerchantSource
  setValue: UseFormSetValue<SubMerchantFormValue>
}

const BUSINESS_OPTIONS = ['F&B', 'Bán lẻ', 'Dược phẩm', 'Dịch vụ'].map((value) => ({
  label: value,
  value
}))
const FIELD_CLASS = 'flex flex-col'

export function SubMerchantProfileSection({
  control,
  parent,
  setValue
}: SubMerchantProfileSectionProps) {
  const phoneInherited = useWatch({ control, name: 'phoneInherited' })
  const addressInherited = useWatch({ control, name: 'addressInherited' })

  useEffect(() => {
    if (phoneInherited) setValue('phone', parent?.phone ?? '')
  }, [parent?.phone, phoneInherited, setValue])

  useEffect(() => {
    if (addressInherited) setValue('address', parent?.address ?? '')
  }, [addressInherited, parent?.address, setValue])

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='sub-merchant-profile-title' className='space-y-4'>
        <header className='border-b border-border pb-3'>
          <h2 className='font-display text-base font-semibold text-foreground' id='sub-merchant-profile-title'>Thông tin Sub-merchant</h2>
          <p className='mt-1 text-xs text-muted-foreground'>Thông tin nhận diện và liên hệ của điểm kinh doanh.</p>
        </header>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormInput className={FIELD_CLASS} control={control} label='Tên Sub-merchant' name='name' placeholder='Nhập tên điểm kinh doanh' required />
          <FormSelect className={FIELD_CLASS} control={control} label='Lĩnh vực kinh doanh' name='businessField' options={BUSINESS_OPTIONS} placeholder='Chọn lĩnh vực' required />
          <div className='space-y-2'>
            <FormCheckbox control={control} label='Kế thừa số điện thoại từ Merchant cha' name='phoneInherited' />
            <FormInput className={FIELD_CLASS} control={control} disabled={phoneInherited} label='Số điện thoại' name='phone' placeholder='Nhập số điện thoại' required={!phoneInherited} />
          </div>
          <div className='space-y-2 md:col-span-2'>
            <FormCheckbox control={control} label='Kế thừa địa chỉ từ Merchant cha' name='addressInherited' />
            <FormTextArea className={FIELD_CLASS} control={control} disabled={addressInherited} label='Địa chỉ' name='address' placeholder='Nhập địa chỉ điểm kinh doanh' required={!addressInherited} rows={3} />
          </div>
        </div>
      </section>
    </CardComponent>
  )
}
