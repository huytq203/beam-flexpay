import {
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextArea
} from '@components/form'
import { PolicyType } from '../FeeManagement.schema'
import React from 'react'
import { Control, UseFormHandleSubmit } from 'react-hook-form'
import { feeDomain, serviceType } from '@type/feePoliciesComponent'

interface FormAddPolicyProps {
  control: Control<PolicyType>
  handleSubmit: UseFormHandleSubmit<PolicyType>
  id?: string
  handleUpdate?: (data: PolicyType) => Promise<void>
  onSubmit: (data: PolicyType) => Promise<void>

}

const FormAddPolicy = ({
  control,
  handleSubmit,
  id,
  handleUpdate,
  onSubmit
}: FormAddPolicyProps) => {
  return (
    <>
      <form
        id='policyForm'
        onSubmit={handleSubmit((data) => {
          if (id && handleUpdate) {
            return handleUpdate(data)
          }
          return onSubmit(data)
        })}
      >
        <div className='grid grid-cols-12 gap-2'>
          <FormInput
            name='name'
            control={control}
            label='Tên chính sách phí'
            placeholder='Nhập tên chính sách...'
          />
          <FormSelect
            name='priority'
            control={control}
            label='Mức độ ưu tiên'
            defaultValue={0}
            options={[
              { label: 'Cao', value: 0 },
              { label: 'Trung bình', value: 1 },
              { label: 'Thấp', value: 2 }
            ]}
          />

          <FormDatePicker
            name='validFrom'
            control={control}
            label='Hiệu lực từ'
          />
          <FormDatePicker
            name='validTo'
            control={control}
            label='Hiệu lực đến'
          />

          <FormSelect
            name='status'
            control={control}
            label='Trạng thái hoạt động'
            defaultValue=''
            options={[
              { label: 'Chọn', value: '' },
              { label: 'INIT', value: 'INIT' },
              { label: 'ACTIVE', value: 'ACTIVE' },
              { label: 'INACTIVE', value: 'INACTIVE' },
              { label: 'LOCKED', value: 'LOCKED' }
            ]}
          />

          <FormSelect
            name='serviceType'
            control={control}
            label='Loại dịch vụ'
            defaultValue=''
            options={[
              { label: 'Chọn tất cả', value: '' },
              ...Object.entries(serviceType).map(([key, value]) => ({
                label: value,     // hoặc value
                value: key
              }))
            ]}
          />
          <FormInput
            name='currency'
            control={control}
            label='Đơn vị thanh toán'
            placeholder='Nhập đơn vị thanh toán...'
          />

          <FormSelect
            name='feeDomain'
            control={control}
            label='Phí miền'
            defaultValue=''
            options={[
              { label: 'Chọn tất cả', value: '' },
              ...Object.entries(feeDomain).map(([key, value]) => ({
                label: value,     // hoặc value
                value: key
              }))
            ]}
          />

          <FormTextArea
            name='description'
            control={control}
            label='Mô tả'
            placeholder='Nhập mô tả chính sách...'
          />
        </div>
      </form>
    </>
  )
}

export default FormAddPolicy
