import { ButtonComponent, CardComponent, Table } from '@components/index'
import React from 'react'
import FormSearch from './components/FormSearch'
import useFetchData from './hooks/useFetchData'
import { MerchantColumn } from './column/column'
import { useNavigate } from 'react-router-dom'
import { Can } from '@/app/permissions'

const MerchantManagement = () => {
  const { data, isFetching, refetch } = useFetchData()
  const navigate = useNavigate()

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
            <Can screen='MERCHANT_MANAGEMENT' action='create'>
              <ButtonComponent
                onClick={() => navigate('create')}
                content='Tạo mới'
                type='primary'
              />
            </Can>
          </div>
        </div>

        <Table
          key='id'
          size='small'
          columns={MerchantColumn({
            onEdit: (id) => navigate(`create/${id}`),
            onView: (id) => navigate(`detail/${id}`)
          })}
          dataSource={data}
          loading={isFetching}
          onRefresh={refetch}
        />
      </CardComponent>

    </div>
  )
}

export default MerchantManagement
