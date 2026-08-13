import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { StatusLabel, WalletTypeLabel } from '../constants/Ewallet.constant'
import { FormSearchValues } from '../types/ResponseWalletAccount.type'
import * as Icons from '@components/icons'
import { StatusEKYCLabel } from '@/pages/wallet-administration/e-walletManagement/constants/StatusEKYC.constant'

interface props {
  handleSearch: (value: FormSearchValues) => void
}

const FormSearch = ({ handleSearch }: props) => {
  const formSearch = useForm<FormSearchValues>()
  const { svg } = useSVG()

  const onSubmit: SubmitHandler<FormSearchValues> = (data) => {
    handleSearch(data)
  }
  const handleReset = () => {
    formSearch.reset()
    handleSearch({})
  }
  return (
    <form className='space-y-3' onSubmit={formSearch.handleSubmit(onSubmit)} onReset={handleReset}>
      <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'> <Icons.FunnelIcon /> Bộ lọc tìm kiếm</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="col-span-1">
          <FormInput control={formSearch.control} name='username' label='Người dùng' placeholder='Tên đăng nhập...' />
        </div>
        <div className="col-span-1">
          <FormInput control={formSearch.control} name='ownerId' label='Mã người dùng' placeholder='Tên đăng nhập...' />
        </div>
        <div className="col-span-1">
          <FormInput control={formSearch.control} name='glCode' label='GL Code' placeholder='Tên đăng nhập...' />
        </div>
        <div className="col-span-1">
          <FormSelect control={formSearch.control} name='status' options={mapEnumToSelectOptions(StatusLabel)} label='Trạng thái ví' />
        </div>
        <div className="col-span-1">
          <FormSelect control={formSearch.control} name='verificationStatus' options={mapEnumToSelectOptions(StatusEKYCLabel)} label='Trạng thái xác thực' />
        </div>
        <div className="col-span-1">
          <FormSelect control={formSearch.control} name='walletType' options={mapEnumToSelectOptions(WalletTypeLabel)} label='Loại ví' />
        </div>
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

export default FormSearch