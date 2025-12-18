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
import { statusType } from '@type/feePolicies'

interface FormAddPolicyProps {
  control: Control<PolicyType>
  handleSubmit: UseFormHandleSubmit<PolicyType>
  id?: string
  handleUpdate?: (data: PolicyType) => Promise<void>
  onSubmit: (data: PolicyType) => Promise<void>
  isCreate?: boolean
}

const FormAddPolicy = ({
  control,
  handleSubmit,
  id,
  handleUpdate,
  onSubmit,
  isCreate
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
            className='col-span-12 md:col-span-6'
          />
          <FormSelect
            className='col-span-12 md:col-span-6'
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
            className='col-span-12 md:col-span-6 flex flex-col'
            name='validFrom'
            control={control}
            label='Hiệu lực từ'
            showTime
          />
          <FormDatePicker
            className='col-span-12 md:col-span-6 flex flex-col'
            name='validTo'
            control={control}
            label='Hiệu lực đến'
            showTime
          />

          <FormSelect
            className='col-span-12 md:col-span-6'
            name='status'
            control={control}
            label='Trạng thái hoạt động'
            defaultValue=''
            options={
              isCreate ? [
                { label: 'Chọn', value: '' },
                ...Object.entries(statusType)
                  .slice(0, 1)
                  .map(([key, value]) => ({
                    label: value,
                    value: key
                  }))
              ] : [
                { label: 'Chọn', value: '' },
                ...Object.entries(statusType).map(([key, value]) => ({
                  label: value,
                  value: key
                }))
              ]

            }

          />

          <FormSelect
            className='col-span-12 md:col-span-6'
            name='serviceType'
            control={control}
            label='Loại dịch vụ'
            defaultValue=''
            options={[
              { label: 'Chọn', value: '' },
              ...Object.entries(serviceType).map(([key, value]) => ({
                label: value, // hoặc value
                value: key
              }))
            ]}
          />
          <FormInput
            className='col-span-12 md:col-span-6'
            name='currency'
            control={control}
            label='Đơn vị thanh toán'
            placeholder='Nhập đơn vị thanh toán...'
          />

          <FormSelect
            className='col-span-12 md:col-span-6'
            name='feeDomain'
            control={control}
            label='Phí miền'
            defaultValue=''
            options={[
              { label: 'Chọn tất cả', value: '' },
              ...Object.entries(feeDomain).map(([key, value]) => ({
                label: value, // hoặc value
                value: key
              }))
            ]}
          />

          <FormTextArea
            className='col-span-12 md:col-span-12'
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
