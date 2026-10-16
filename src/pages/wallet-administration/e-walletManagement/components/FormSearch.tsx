import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { StatusLabel, WalletTypeLabel } from '../constants/Ewallet.constant'
import { FormSearchValues } from '../types/ResponseWalletAccount.type'
import type { EwalletFilterKey } from '../constants/ewalletFilter.constants'
import * as Icons from '@components/icons'

type EwalletFilters = Partial<Record<EwalletFilterKey, string>>

interface FormSearchProps {
  /** Bộ lọc đang áp dụng (URL/bản sao) để ô nhập hiện lại khi quay về màn. */
  filters: EwalletFilters
  handleSearch: (value: EwalletFilters) => void
  onReset: () => void
}

const EMPTY_FORM: FormSearchValues = {
  username: '',
  ownerId: '',
  status: undefined,
  walletType: undefined,
  fromDate: '',
  toDate: ''
}

/** Ô trống là "không lọc" — DatePicker khi xoá trả `''`, gửi lên BE sẽ lỗi parse date-time. */
const omitEmpty = (values: FormSearchValues): EwalletFilters =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => Boolean(value))
  )

export const FormSearch = ({ filters, handleSearch, onReset }: FormSearchProps) => {
  const formSearch = useForm<FormSearchValues>({
    defaultValues: { ...EMPTY_FORM, ...filters }
  })
  const { svg } = useSVG()

  const onSubmit: SubmitHandler<FormSearchValues> = (data) => {
    handleSearch(omitEmpty(data))
  }
  const handleReset = () => {
    formSearch.reset(EMPTY_FORM)
    onReset()
  }
  return (
    <form className='space-y-3' onSubmit={formSearch.handleSubmit(onSubmit)} onReset={handleReset}>
      <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'> <Icons.FunnelIcon /> Bộ lọc tìm kiếm</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="col-span-1">
          <FormInput control={formSearch.control} name='username' label='Người dùng' placeholder='Tìm kiếm số điện thoại...' />
        </div>
        <div className="col-span-1">
          <FormInput control={formSearch.control} name='ownerId' label='Mã người dùng' placeholder='Mã người dùng' />
        </div>
        {/* <div className="col-span-1">
          <FormInput control={formSearch.control} name='glCode' label='GL Code' placeholder='Tên đăng nhập...' />
        </div> */}
        <div className="col-span-1">
          <FormSelect control={formSearch.control} name='status' options={mapEnumToSelectOptions(StatusLabel)} label='Trạng thái ví' />
        </div>
        <div className="col-span-1">
          <FormSelect control={formSearch.control} name='walletType' options={mapEnumToSelectOptions(WalletTypeLabel)} label='Loại ví' />
        </div>
        <FormDatePicker
          showTime
          control={formSearch.control}
          name='fromDate'
          className='col-span-1 flex flex-col'
          label='Từ ngày'
          placeholder='DD/MM/YYYY HH:mm:ss'
        />
        <FormDatePicker
          showTime
          control={formSearch.control}
          name='toDate'
          className='col-span-1 flex flex-col'
          label='Đến ngày'
          placeholder='DD/MM/YYYY HH:mm:ss'
        />
        {/* <div className="col-span-1">
          <FormSelect control={formSearch.control} name='kycStatus' options={[]} label='Trạng thái KYC' />
        </div> */}


      </div>
      <div className="flex gap-2 justify-end">
        <div className="flex items-end justify-end">
          <ButtonComponent htmlType='submit' className='w-full' content='Tìm kiếm' icon={svg('/icons.svg#hugeicons-search-01')} />
        </div>
        <div className="flex items-end justify-end">
          <ButtonComponent htmlType='reset' type='default' className='w-full' content='Xóa bộ lọc' icon={<Icons.BroomIcon size={18} />} />
        </div>
      </div>
    </form>
  )
}
