import { ButtonComponent } from '@components/index'
import { FormField, FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { StatusLabel } from '../constants/Ewallet.constant'
import { FormSearchValues } from '../types/ResponseWalletAccount.type'
import * as Icons from '@components/icons'

interface props {
  handleSearch: (value: FormSearchValues) => void
}

const FormSearch = ({ handleSearch }: props) => {
  const formSearch = useForm<FormSearchValues>()
  const { svg } = useSVG()
  const onSubmit: SubmitHandler<FormSearchValues> = (data) => {
    handleSearch(data)
  }
  return (
    <div>
      <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'> <Icons.FunnelIcon /> Bộ lọc tìm kiếm</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="col-span-1">
          <FormInput control={formSearch.control} name='keyword' label='Từ khóa' placeholder='Từ khóa...' />
        </div>
        <div className="col-span-1">
          <FormSelect control={formSearch.control} name='status' options={mapEnumToSelectOptions(StatusLabel)} label='Trạng thái ví' />
        </div>
        <div className="col-span-1">
          <FormSelect control={formSearch.control} name='kycStatus' options={[]} label='Trạng thái KYC' />
        </div>
        <div className="col-span-1 flex items-end">
          <ButtonComponent onClick={formSearch.handleSubmit(onSubmit)} className='w-full' content='Tìm kiếm' icon={svg('/icons.svg#hugeicons-search-01')} />
        </div>

      </div>
    </div>
  )
}

export default FormSearch