import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import {
  PaymentMethod,
  StatusType,
  TransactionType
} from '../constants/Transaction.constant'
import { FormSearchValues } from '../types/Transaction.type'
import {
  REFUND_TRANSACTION_TYPE,
  type TransactionUrlFilters
} from '../constants/transactionFilter.constants'
import { toTransactionFormValues } from '../utils/transactionUrlFilters'
import * as Icons from '@components/icons'
interface props {
  /** Bộ lọc đang áp dụng (URL/bản sao) để ô nhập hiện lại khi quay về màn. */
  filters: TransactionUrlFilters
  handleSearch: (value: Partial<FormSearchValues>) => void
  onReset: () => void
  /** Trạng thái đang lọc từ dải tổng quan, đổ ngược vào ô select bên dưới. */
  status?: string
}

const FormSearch = ({ filters, handleSearch, onReset, status }: props) => {
  const formSearch = useForm<FormSearchValues>({
    defaultValues: toTransactionFormValues(filters)
  })
  React.useEffect(() => {
    formSearch.setValue('status', status ?? '')
  }, [formSearch, status])

  const onSubmit: SubmitHandler<FormSearchValues> = (data) => {
    // Chọn loại "Hoàn tiền" thì lọc theo hasRefund=true và bỏ transactionType: kết hợp
    // transactionType=REVERSAL với hasRefund=true cho kết quả rỗng.
    const isRefund = data.transactionType === REFUND_TRANSACTION_TYPE
    handleSearch({
      ...data,
      transactionType: isRefund ? '' : data.transactionType,
      hasRefund: isRefund ? 'true' : ''
    })
  }

  const handleReset = () => {
    formSearch.reset(toTransactionFormValues({}))
    onReset()
  }
  return (
    <div>
      <form onSubmit={formSearch.handleSubmit(onSubmit)}>
        <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'>
          {' '}
          <Icons.FunnelIcon /> Bộ lọc tìm kiếm
        </p>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
          <FormInput
            control={formSearch.control}
            name='transactionCode'
            label='Mã giao dịch'
            className='col-span-2'
            placeholder='Nhập mã giao dịch...'
          />
          <FormSelect
            control={formSearch.control}
            name='transactionType'
            label='Loại giao dịch'
            className='col-span-1'
            options={mapEnumToSelectOptions(TransactionType)}
          />
          <FormSelect
            control={formSearch.control}
            name='status'
            label='Trạng thái'
            className='col-span-1'
            options={mapEnumToSelectOptions(StatusType)}
          />
          <FormInput
            control={formSearch.control}
            name='partyUsername'
            label='Tài khoản'
            className='col-span-1'
            placeholder='Username tài khoản...'
          />
          {/* <FormInput control={formSearch.control} name='bankCode' label='Mã ngân hàng' className='col-span-1' placeholder='Nhập mã ngân hàng...' /> */}
          <FormSelect
            control={formSearch.control}
            name='paymentMethod'
            label='Phương thức'
            className='col-span-1'
            options={mapEnumToSelectOptions(PaymentMethod)}
          />
          {/* <FormInputNumber control={formSearch.control} name='minAmount' label='Số tiền tối thiểu' className='col-span-1' placeholder='Nhập số tiền...' /> */}
          {/* <FormInputNumber control={formSearch.control} name='maxAmount' label='Số tiền tối đa' className='col-span-1' placeholder='Nhập số tiền...' /> */}
          <FormDatePicker
            showTime
            control={formSearch.control}
            name='fromDate'
            label='Thời gian từ'
            className='col-span-1'
          />
          <FormDatePicker
            showTime
            control={formSearch.control}
            name='toDate'
            label='Thời gian đến'
            className='col-span-1'
          />
        </div>
        <div className='flex justify-end mt-3 gap-1'>
          <ButtonComponent
            htmlType='submit'
            icon={<MagnifyingGlassIcon size={18} />}
            content={'Tìm kiếm'}
          />
          <ButtonComponent
            onClick={handleReset}
            type='default'
            icon={<BroomIcon size={18} />}
            content={'Xóa lọc'}
          />
        </div>
      </form>
    </div>
  )
}

export default FormSearch
