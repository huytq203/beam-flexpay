import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { FeeAssignType } from '@pages/fee-managerment-v3/FeeManagement.schema'
import { FeeAssignmentFormData } from '@pages/fee-managerment-v3/fee-assignment/hook/useFeeAssignmentForm'
import { usePostAssignMutation } from '@services/apiFeeAssignment'
import {
  bankCodeType,
  cardTypeType,
  customerGroupType,
  paymentMethodType,
  statusType
} from '@type/feeAssignment'
import { serviceType } from '@type/feePoliciesComponent'
import React, { useImperativeHandle } from 'react'
import { Control } from 'react-hook-form'
interface FormFieldAssign {
  control: Control<FeeAssignmentFormData>
}

const FormFieldAssign = ({ control }: FormFieldAssign) => {
  // hookform

  // api database

  return (
    <div>
      <div className='grid grid-cols-10 gap-3'>
        <FormInput
          control={control}
          name=''
          placeholder='Nhập tài khoản...'
          label='Tài khoản'
          className='col-span-2'
        />
        <FormSelect
          control={control}
          name=''
          label='Đối tượng áp dụng'
          className='col-span-2'
          options={[
            {
              label: 'Đối tượng riêng',
              value: '1'
            },
            {
              label: 'Nhóm khách hàng',
              value: '2'
            }
          ]}
        />
        <FormSelect
          control={control}
          name='serviceType'
          options={[
            { label: 'Chọn', value: '' },
            ...Object.entries(serviceType).map(([key, value]) => ({
              label: value,
              value: key
            }))
          ]}
          label='Loại giao dịch'
          className='col-span-2'
        />
        <FormSelect
          control={control}
          name='bankCode'
          options={[
            { label: 'Chọn', value: '' },
            ...Object.entries(bankCodeType).map(([key, value]) => ({
              label: value,
              value: key
            }))
          ]}
          label='Nhà cung cấp'
          className='col-span-2'
        />
        <FormSelect
          control={control}
          name='paymentMethod'
          options={[
            { label: 'Chọn', value: '' },
            ...Object.entries(paymentMethodType).map(([key, value]) => ({
              label: value,
              value: key
            }))
          ]}
          label='Phương thức giao dịch'
          className='col-span-2'
        />
        <FormSelect
          control={control}
          name='cardType'
          options={[
            { label: 'Chọn', value: '' },
            ...Object.entries(cardTypeType).map(([key, value]) => ({
              label: value,
              value: key
            }))
          ]}
          label='Loại thẻ'
          className='col-span-2'
        />
        <FormSelect
          control={control}
          name='customerGroup'
          options={[
            { label: 'Chọn', value: '' },
            ...Object.entries(customerGroupType).map(([key, value]) => ({
              label: value,
              value: key
            }))
          ]}
          label='Nhóm khách hàng'
          className='col-span-2'
        />
        <FormSelect
          control={control}
          name='status'
          options={[
            { label: 'Chọn', value: '' },
            ...Object.entries(statusType).map(([key, value]) => ({
              label: value,
              value: key
            }))
          ]}
          label='Trạng thái'
          className='col-span-2'
        />
        <FormDatePicker
          control={control}
          name=''
          label='Thời gian áp dụng'
          className='col-span-2 flex flex-col'
          showTime
        />
        <FormDatePicker
          control={control}
          name=''
          label='Thời gian tạo'
          className='col-span-2 flex flex-col'
          showTime
        />
      </div>
    </div>
  )
}

export default FormFieldAssign
