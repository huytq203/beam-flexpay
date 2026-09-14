import { FormSelect } from '@components/form'
import { useGetBankQuery } from '@services/apiFeeBank'
import { useGetCustomerSegmentsQuery } from '@services/apiCustomerSegment'
import {
  cardTypeType,
  FeeBank,
  paymentMethodType,
  statusType
} from '@pages/fee-management-v4/fee-assignment/constants/feeAssignment'
import { serviceType } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import React, { useMemo } from 'react'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { FeeAssignType } from '../schemas/feeAssign.schema'

interface FormFieldAssign {
  control: Control<FeeAssignType>
  setValue?: UseFormSetValue<FeeAssignType>
  isCreate?: boolean
  feeDomain: string
  watch: UseFormWatch<FeeAssignType>
}

const FormFieldAssign = React.memo(({ control, isCreate, feeDomain, watch }: FormFieldAssign) => {
  // api database
  const { data: dataBank } = useGetBankQuery({})
  const { data: customerSegments, isLoading: isLoadingCustomerSegments } =
    useGetCustomerSegmentsQuery()
  const customerGroup = watch('customerGroup')
  const customerSegmentOptions = useMemo(() => {
    const options = (customerSegments ?? []).map((segment) => ({
      label: segment.name,
      value: segment.code
    }))

    if (customerGroup && !options.some((option) => option.value === customerGroup)) {
      options.push({ label: customerGroup, value: customerGroup })
    }

    return options
  }, [customerGroup, customerSegments])



  // useEffect(() => {
  //   if (feeDomain === 'MERCHANT' && setValue) {
  //     setValue('bankCode', '')
  //   }
  // }, [feeDomain, setValue])

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
          className={'col-span-1'}
          allowClear={false}
          defaultValue={"0"}
          options={[
            { label: 'Hệ thống', value: "0" },
          ]}
          disabled={true}
        /> */}

        <FormSelect
          control={control}
          name='customerGroup'
          options={customerSegmentOptions}
          label={<span>Phân khúc khách hàng</span>}
          placeholder='Tất cả phân khúc'
          className={'col-span-1'}
          loading={isLoadingCustomerSegments}
          allowClear
        />


        {/* <FormSelect
          control={control}
          name='domain'
          defaultValue={"EWALLET"}
          disabled={true}
          options={[
            { label: 'Ví', value: "EWALLET" },
            { label: 'Ngân hàng', value: "BANK" },
            { label: 'Merchant', value: "MERCHANT" },
          ]}
          label={<span>Domain <span className='text-red-500'>*</span></span>}
          className={'col-span-1'}
        /> */}

        <FormSelect
          control={control}
          name='bankCode'
          options={[
            ...(dataBank?.content || []).map((item: FeeBank) => ({
              label: item.name,
              value: item.code
            }))
          ]}
          label={<span>Ngân hàng <span className='text-red-500'>*</span></span>}
          className={'col-span-1'}
          disabled={feeDomain === 'MERCHANT'}
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
