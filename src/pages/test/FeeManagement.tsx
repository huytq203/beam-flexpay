import { useNavigate } from 'react-router-dom'
import { TEST } from '@constants/routersConstant'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Input, SelectInput, ButtonComponent, Table } from '@components/common'
import { Card } from 'antd'
import React, { useState } from 'react'
import { useGetFeePoliciesQuery } from '@services/apiFeePoliciesServices'

const FeeManagement = () => {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetFeePoliciesQuery({
    page,
    size: 10,
    sortBy: 'name',
    sortDirection: 'ASC'
  })
  const navigate = useNavigate()
  const list = data?.content || []
  const total = data?.totalElements || 0

  const dataSource = list.map((item, index) => ({
    key: item.id,
    no: (page - 1) * 10 + index + 1,
    name: item.name,
    serviceType: item.serviceType,
    status: item.status,
    currency: item.currency,
    validFrom: item.validFrom,
    validTo: item.validTo
  }))

  const columns = [
    { title: 'STT', dataIndex: 'no', width: 60, align: 'center' as const ,className:'border'},
    { title: 'Tên chính sách', dataIndex: 'name',className:'border border-l-0' },
    { title: 'Loại dịch vụ', dataIndex: 'serviceType',className:'border border-l-0'  },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      className:'border border-l-0' ,
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }`}
        >
          {status}
        </span>
      )
    },
    { title: 'Loại tiền', dataIndex: 'currency',className:'border border-l-0'  },
    {
      title: 'Hiệu lực từ',
      dataIndex: 'validFrom',
      className:'border border-l-0' ,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString('vi-VN') : ''
    },
    {
      title: 'Hiệu lực đến',
      dataIndex: 'validTo',
      className:'border border-l-0' ,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString('vi-VN') : ''
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      className:'border border-l-0' ,
      align: 'center' as const,
      render: (record: any) => (
        <div className='flex gap-2 justify-center'>
          <ButtonComponent
            type='text'
            icon={<EditOutlined />}
            onClick={() => navigate(`${TEST}?id=${record.key}`)}
          />
          <ButtonComponent
            type='text'
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              // Handle delete
              alert('Delete' + record.key)
            }}
          />
        </div>
      )
    }
  ]

  return (
    <>
      <Card>
        <div className='flex gap-3'>
          <div className='flex-1'>
            <label htmlFor=''>Tên chính sách</label>
            <Input placeholder='nhập tên chính sách...' />
          </div>
          <div className='flex-1'>
            <label htmlFor=''>Tên chính sách</label>
            <SelectInput
              data={[
                { label: 'Tất cả dịch vụ', value: 0 },
                { label: 'Tất cả dịch vụ', value: 1 },
                { label: 'Tất cả dịch vụ', value: 2 }
              ]}
            />
          </div>
          <div className='flex justify-end flex-col'>
            <ButtonComponent
              icon={
                <svg
                  width={20}
                  height={20}
                >
                  <use href='/icons.svg#hugeicons-search-01' />
                </svg>
              }
              content='Search'
            />
          </div>
          <div className='flex justify-end flex-col'>
            <ButtonComponent
              htmlType='button'
              content='Thêm chính sách mới'
              onClick={() => navigate(TEST + '/create')}
              type='primary'
              icon={
                <svg
                  className='pointer-events-none'
                  width={20}
                  height={20}
                >
                  <use href='/icons.svg#hugeicons-plus-sign-circle' />
                </svg>
              }
            />
          </div>
        </div>

        <div className=' mt-3'>
          <Table
            size='small'
            dataSource={dataSource}
            columns={columns}
          />
        </div>
      </Card>
    </>
  )
}

export default FeeManagement
