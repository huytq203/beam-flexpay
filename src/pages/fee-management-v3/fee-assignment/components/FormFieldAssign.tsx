import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { FeeAssignType } from '@pages/fee-management-v3/fee-assignment/schemas/feeAssign.schema'
import { useGetBankQuery } from '@services/apiFeeBank'
import {
  bankCodeType,
  cardTypeType,
  customerGroupType,
  paymentMethodType,
  statusType
} from '@pages/fee-management-v3/constants/feeAssignment'
import { serviceType } from '@pages/fee-management-v3/constants/feePoliciesComponent'
import React, { useEffect, useState } from 'react'
import { Control, UseFormSetValue } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'

interface FormFieldAssign {
  control: Control<FeeAssignType>
  setValue?: UseFormSetValue<FeeAssignType>
  isCreate?: boolean
}

const FormFieldAssign = React.memo(({ control, setValue, isCreate }: FormFieldAssign) => {
  const [disable, setDisable] = useState('')

  // api database
  const { data: dataBank } = useGetBankQuery({})
  // logic
  useEffect(() => {
    if (!setValue) return

    if (disable === '1') {
      setValue('customerGroup', undefined)
    } else if (disable === '2') {
      setValue('account', undefined)
    } else {
      setValue('account', undefined)
      setValue('customerGroup', undefined)
    }
  }, [disable, setValue])

  const handleChangeApplyType = (val: string) => {
    setDisable(val)
  }
  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
        {!isCreate && (
          <FormSelect
            control={control}
            name='applyType'
            label='Đối tượng áp dụng'
            className={isCreate ? 'col-span-12' : 'col-span-3'}
            allowClear={false}
            defaultValue={''}
            options={[
              { label: 'Hệ thống', value: '' },
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
        )}
        {!isCreate && (
          <FormInput
            type='text'
            control={control}
            name='account'
            placeholder='Nhập tài khoản...'
            label='Tài khoản'
            className={isCreate ? 'col-span-6' : 'col-span-3'}
            disabled={disable == '2' || disable == '' ? true : false}
          />
        )}
        {!isCreate && (
          <FormSelect
            control={control}
            name='customerGroup'
            options={mapEnumToSelectOptions(customerGroupType)}
            label='Nhóm khách hàng'
            className={isCreate ? 'col-span-6' : 'col-span-3'}
            disabled={disable == '1' || disable == '' ? true : false}
          />
        )}
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
        {!isCreate && (
          <>
            <FormSelect
              control={control}
              name='serviceType'
              options={mapEnumToSelectOptions(serviceType)}
              label='Loại giao dịch'
              className={isCreate ? 'col-span-6' : 'col-span-3'}
            />
            <FormSelect
              control={control}
              name='paymentMethod'
              options={mapEnumToSelectOptions(paymentMethodType)}
              label='Phương thức giao dịch'
              className={isCreate ? 'col-span-6' : 'col-span-3'}
            />
            <FormSelect
            control={control}
            name='cardType'
            options={mapEnumToSelectOptions(cardTypeType)}
            label='Loại thẻ'
            className={isCreate ? 'col-span-6' : 'col-span-3'}
            hidden={isCreate}
            classNameLable={isCreate ? 'hidden' : 'font-medium'}
          />
          </>
        )}

       
        <FormSelect
          control={control}
          name='status'
          options={mapEnumToSelectOptions(statusType)}
          label='Trạng thái'
          className={isCreate ? 'col-span-6' : 'col-span-3'}
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
