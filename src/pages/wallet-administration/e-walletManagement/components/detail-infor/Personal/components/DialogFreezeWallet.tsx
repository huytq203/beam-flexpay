import { FormDatePicker, FormRadio, FormTextArea } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogFreezeWallet = () => {
  const { control, watch } = useForm()
  const freezeType = watch('a')
  return (
    <div className='space-y-3'>
      <p className='text-gray-500 px-3'> Bạn có chắc chắn muốn phong tỏa tài khoản của <strong>Nguyễn Văn A</strong>? Người dùng sẽ bọ chặn toàn bộ giao dịch tài chính.</p>
      <FormRadio control={control} name='a' label='Hình thức phong tỏa' options={[
        { label: 'Vĩnh viễn', value: '1' },
        { label: 'Tạm thời', value: '2' },
      ]} />
      {
        freezeType === '2' && <div className="p-3 bg-gray-100 rounded-md border">
          <FormDatePicker
            getPopupContainer={(trigger: any) => trigger.parentElement!}

            control={control}
            name=''
            showTime
            label={<span>Thời gian hết phong tỏa <span className='text-red'>*</span></span>} />
        </div>
      }
      {/* <div className="text-gray-500 bg-gray-100 p-3 rounded-md border">
        <p className='font-medium'>Lý do bị phong tỏa:</p>
        <p className='italic'>Nghi ngờ làm bậy (15/12/2025)</p>
      </div> */}

      <FormTextArea control={control} name='' label={<span>Lý do thực hiện <span className='text-red'>*</span></span>} placeholder='Nhập lý do...' />
    </div>
  )
}

export default DialogFreezeWallet
