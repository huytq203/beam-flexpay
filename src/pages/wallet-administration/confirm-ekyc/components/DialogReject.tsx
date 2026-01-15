import { FormSelect, FormTextArea } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogReject = () => {
  const formDialog = useForm()
  return (
    <div>
      <form>
        <div className='flex flex-col gap-3 '>
          <FormSelect
          
            control={formDialog.control}
            name=''
            options={[]}
            label='Lý do từ chối'
            placeholder='Chọn lý do từ chối mẫu'
          />
          <FormTextArea
            control={formDialog.control}
            name=''
            placeholder='Nhập lý do từ chối'
            rows={4}
          />
        </div>
      </form>
    </div>
  )
}

export default DialogReject
