import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { useGetBankQuery } from '@services/apiFeeBank'
import {
  cardTypeType,
  customerGroupType,
  paymentMethodType,
  statusType
} from '@pages/fee-management-v4/fee-assignment/constants/feeAssignment'
import { serviceType } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import React, { useEffect, useState } from 'react'
import { Control, UseFormSetValue, useWatch } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { FeeAssignType } from '../schemas/feeAssign.schema'

interface FormFieldAssign {
  control: Control<FeeAssignType>
  setValue?: UseFormSetValue<FeeAssignType>
  isCreate?: boolean
}

const FormFieldAssign = React.memo(({ control, setValue, isCreate }: FormFieldAssign) => {
  // api database
  const { data: dataBank } = useGetBankQuery({})

  // const applyType = useWatch({ control, name: 'applyType' })
  // const customerGroup = useWatch({ control, name: 'customerGroup' })

  // // logic sync applyType when data is filled
  // useEffect(() => {
  //   if (!setValue) return
  //   if (customerGroup && applyType !== '1') {
  //     setValue('applyType', '1')
  //   } 
  // }, [customerGroup, setValue])

  // // logic clear field when applyType change
  // useEffect(() => {
  //   if (!setValue) return

  // if (applyType === '0') {
  //     setValue('customerGroup', undefined)
  //   }
  // }, [applyType, setValue])

  // const handleChangeApplyType = (val: string) => {
  //   setValue?.('applyType', val)
  // }
  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-5 gap-2'>

        {/* <FormSelect
          control={control}
          name='applyType'
          label={<span>Đối tượng áp dụng <span className='text-red-500'>*</span></span>}
          className={isCreate ? 'col-span-12' : 'col-span-12'}
          allowClear={false}
          defaultValue={"0"}
          options={[
            { label: 'Hệ thống', value: "0" },
            {
              label: 'Đối tượng khách hàng',
              value: '1'
            },
          
          ]}
          onChange={handleChangeApplyType}
        /> */}


        {/* <FormInput
          type='text'
          control={control}
          name='customerGroup'
          placeholder='Nhập tài khoản/nhóm khách hàng...'
          label={<span>Tài khoản/Nhóm khách hàng {applyType == '1' && <span className='text-red-500'>*</span>}</span>}
          className={isCreate ? 'col-span-6' : 'col-span-12'}
          disabled={applyType == '0' || !applyType ? true : false}
        /> */}

        {/* 
        <FormSelect
          control={control}
          name='customerGroup'
          options={mapEnumToSelectOptions(customerGroupType)}
          label='Nhóm khách hàng'
          className={isCreate ? 'col-span-6' : 'col-span-12'}
          disabled={applyType == '1' || applyType == '0' || !applyType ? true : false}
        /> */}

        <FormSelect
          control={control}
          name='bankCode'
          options={[
            ...(dataBank?.data?.content || []).map((item: any) => ({
              label: item.name,
              value: item.code
            }))
          ]}
          label={<span>Ngân hàng <span className='text-red-500'>*</span></span>}
          className={'col-span-1'}
        />

        <>
          <FormSelect
            control={control}
            name='serviceType'
            options={mapEnumToSelectOptions(serviceType)}
            label={<span>Loại giao dịch <span className='text-red-500'>*</span></span>}
            className={'col-span-1'}
          />
          <FormSelect
            control={control}
            name='paymentMethod'
            options={mapEnumToSelectOptions(paymentMethodType)}
            label={<span>Phương thức giao dịch </span>}
            className={'col-span-1'}
          />
          <FormSelect
            control={control}
            name='cardType'
            options={mapEnumToSelectOptions(cardTypeType)}
            label={<span>Loại thẻ </span>}
            className={'col-span-1'}
            hidden={isCreate}
            classNameLable={isCreate ? 'hidden' : 'font-medium'}
          />
        </>



        <FormSelect
          control={control}
          name='status'
          options={mapEnumToSelectOptions(statusType)}
          label={<span>Trạng thái <span className='text-red-500'>*</span></span>}
          className={'col-span-1'}
        />
        {/* <FormDatePicker
          control={control}
          name='applyDate'
          label='Thời gian áp dụng'
          className='col-span-2 flex flex-col '
          showTime
        />
        <FormDatePicker
          control={control}
          name='createDate'
          label='Thời gian tạo'
          className='col-span-2 flex flex-col '
          showTime
        /> */}
      </div>
    </div>
  )
})

FormFieldAssign.displayName = 'FormFieldAssign'

export default FormFieldAssign
