import { FieldBinaryOutlined } from '@ant-design/icons'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { FeeAssignType } from '@pages/fee-managerment-v3/fee-assignment/feeAssign.schema'
import { useGetBankQuery } from '@services/apiFeeBank'
import {
  bankCodeType,
  cardTypeType,
  customerGroupType,
  paymentMethodType,
  statusType
} from '@type/feeAssignment'
import { serviceType } from '@type/feePoliciesComponent'
import React, { useEffect, useImperativeHandle, useState } from 'react'
import { Control, UseFormSetValue } from 'react-hook-form'

interface FormFieldAssign {
  control: Control<FeeAssignType>
  setValue?: UseFormSetValue<FeeAssignType>
  isCreate?: boolean
}

const FormFieldAssign = ({ control, setValue, isCreate }: FormFieldAssign) => {
  const [disable, setDisable] = useState('')

  // api database
  const { data: dataBank } = useGetBankQuery({})
  // logic
  useEffect(() => {
    if (!setValue) return

    if (disable === "1") {
      setValue("customerGroup", "")
    }
    else if (disable === "2") {
      setValue('account', '')
    }
    else {
      setValue('account', '')
      setValue("customerGroup", "")
    }
  }, [disable, setValue])

  return (
    <div>
      <div className='grid grid-cols-12 gap-3'>
        <FormSelect
          control={control}
          name='applyType'
          label='Đối tượng áp dụng'
          className={isCreate ? 'col-span-12' : 'col-span-3'}
          allowClear={false}
          defaultValue={""}
          hidden={isCreate}
          classNameLable={isCreate ? 'hidden' : 'font-medium'}
          options={[
            { label: 'Hệ thống', value: "" },
            {
              label: 'Đối tượng riêng',
              value: '1'
            },
            {
              label: 'Nhóm khách hàng',
              value: '2'
            }
          ]}
          onChange={(val: any) => setDisable(val)}
        />
        <FormInput
          type='text'
          control={control}
          name='account'
          placeholder='Nhập tài khoản...'
          label='Tài khoản'
          className={isCreate ? 'col-span-6' : 'col-span-3'}
          disabled={disable == "2" || disable == '' ? true : false}
          hidden={isCreate}
          classNameLable={isCreate ? 'hidden' : 'font-medium'}
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
          className={isCreate ? 'col-span-6' : 'col-span-3'}
          disabled={disable == "1" || disable == '' ? true : false}
          hidden={isCreate}
          classNameLable={isCreate ? 'hidden' : 'font-medium'}
        />
        <FormSelect
          control={control}
          name='bankCode'
          options={[
            { label: 'Chọn', value: '' },
            ...(dataBank?.data?.content || []).map((item: any) => ({
              label: item.name,
              value: item.code
            }))
          ]}
          label='Ngân hàng'
          className={isCreate ? 'col-span-6' : 'col-span-3'}
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
          className={isCreate ? 'col-span-6' : 'col-span-3'}
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
          className={isCreate ? 'col-span-6' : 'col-span-3'}
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
          className={isCreate ? 'col-span-6' : 'col-span-3'}
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
          className={isCreate ? 'col-span-12' : 'col-span-3'}
        />
        <FormDatePicker
          control={control}
          name='applyDate'
          label='Thời gian áp dụng'
          className='col-span-2 flex flex-col hidden'
          showTime
        />
        <FormDatePicker
          control={control}
          name='createDate'
          label='Thời gian tạo'
          className='col-span-2 flex flex-col hidden'
          showTime
        />
      </div>
    </div>
  )
}

export default FormFieldAssign
