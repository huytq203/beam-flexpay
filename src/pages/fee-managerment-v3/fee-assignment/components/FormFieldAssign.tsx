import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { FeeAssignType } from '@pages/fee-managerment-v3/fee-assignment/schemas/feeAssign.schema'
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
      setValue("customerGroup", undefined)
    }
    else if (disable === "2") {
      setValue('account', undefined)
    }
    else {
      setValue('account', undefined)
      setValue("customerGroup",undefined)
    }
  }, [disable, setValue])

  const handleChangeApplyType = (val: string) => {
    setDisable(val)
  }
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
          onChange={handleChangeApplyType}
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
