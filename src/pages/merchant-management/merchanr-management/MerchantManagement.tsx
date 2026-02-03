import { ButtonComponent, CardComponent, Table } from '@components/index'
import React from 'react'
import FormSearch from './components/FormSearch'

const MerchantManagement = () => {
  return (
    <div className='space-y-3'>
      <CardComponent>
        <FormSearch />
      </CardComponent>
      <CardComponent>
        <div className="flex justify-between items-center gap-3 mb-3">
          <div className="">
            <span className='font-medium text-[16px]'>Danh sách merchant</span>
          </div>
          <div className="flex gap-3">
            <ButtonComponent content='Xuất excel' type='default' />
            <ButtonComponent content='Tạo mới' type='primary' />
          </div>
        </div>

        <Table />
      </CardComponent>

    </div>
  )
}

export default MerchantManagement