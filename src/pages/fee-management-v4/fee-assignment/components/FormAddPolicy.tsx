import {
  FormDatePicker,
  FormInput,
  FormInputNumber,
  FormSelect,
  FormTextArea
} from '@components/form'
import React from 'react'
import { Control, UseFormHandleSubmit } from 'react-hook-form'
import { Currency, feeDomain, serviceType } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import dayjs, { Dayjs } from 'dayjs'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { statusType } from '../constants/feeAssignment'
import { PolicyType } from '../schemas/FeeManagement.schema'

interface FormAddPolicyProps {
  control: Control<PolicyType>
  handleSubmit: UseFormHandleSubmit<PolicyType>
  id?: string
  handleUpdate?: (data: PolicyType) => Promise<void>
  onSubmit: (data: PolicyType) => Promise<void>
  isCreate?: boolean
  data?: PolicyType
}

const FormAddPolicy = ({
  control,
  handleSubmit,
  id,
  handleUpdate,
  onSubmit,
  isCreate,
  data
}: FormAddPolicyProps) => {


  const status = data?.status
  console.log(status)

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
            trim
            trimOn="blur"
            name='name'
            control={control}
            label={!isCreate ? 'Tên chính sách phí' : <span>Tên chính sách phí <span className='text-red'>*</span> </span>}
            placeholder='Nhập tên chính sách...'
            className='col-span-12 md:col-span-6'
            disabled={!isCreate}
          />
          <FormInputNumber
            className='col-span-12 md:col-span-6'
            name='priority'
            control={control}
            label={!isCreate ? 'Mức độ ưu tiên' : <span>Mức độ ưu tiên <span className='text-red'>*</span></span>}
            placeholder='Nhập mức độ ưu tiên'

          />

          <FormDatePicker
            className='col-span-12 md:col-span-6 flex flex-col'
            name='validFrom'
            control={control}
            label={!isCreate ? 'Hiệu lực từ' : <span>Hiệu lực từ <span className='text-red'>*</span></span>}
            showTime
            disabledDate={(current: Dayjs) =>
              current && current < dayjs().startOf('day')
            }
            disabled={!isCreate && status !== 'INIT'}
          />
          <FormDatePicker
            className='col-span-12 md:col-span-6 flex flex-col'
            name='validTo'
            control={control}
            label={!isCreate ? 'Hiệu lực đến' : <span>Hiệu lực đến </span>}
            showTime
          />

          <FormSelect
            className='col-span-12 md:col-span-6'
            name='status'
            control={control}
            label={!isCreate ? 'Trạng thái hoạt động' : <span>Trạng thái hoạt động <span className='text-red'>*</span></span>}
            options={
              isCreate ? mapEnumToSelectOptions(statusType).slice(0, 1) :
                mapEnumToSelectOptions(statusType)

            }
            disabled={!isCreate && status !== 'INIT'}
          />

          <FormSelect
            className='col-span-12 md:col-span-6'
            name='serviceType'
            control={control}
            label={!isCreate ? "Loại dịch vụ" : <span>Loại dịch vụ <span className='text-red'>*</span></span>}
            options={mapEnumToSelectOptions(serviceType)}
            disabled={!isCreate && status !== 'INIT'}
          />
          <FormSelect
            className='col-span-12 md:col-span-6'
            name='currency'
            control={control}
            options={mapEnumToSelectOptions(Currency)}
            label={!isCreate ? "Đơn vị thanh toán" : <span>Đơn vị thanh toán <span className='text-red'>*</span></span>}
            placeholder='Nhập đơn vị thanh toán...'
            disabled={!isCreate && status !== 'INIT'}
          />

          <FormSelect
            className='col-span-12 md:col-span-6'
            name='feeDomain'
            control={control}
            label={!isCreate ? "Phí miền" : <span>Phí miền <span className='text-red'>*</span></span>}
            options={mapEnumToSelectOptions(feeDomain)}
            disabled={!isCreate && status !== 'INIT'}
          />

          <FormTextArea
            className='col-span-12 md:col-span-12'
            name='description'
            control={control}
            label={!isCreate ? 'Mô tả' : <span>Mô tả </span>}
            placeholder='Nhập mô tả chính sách...'
          />
        </div>
      </form>
    </>
  )
}

export default FormAddPolicy
