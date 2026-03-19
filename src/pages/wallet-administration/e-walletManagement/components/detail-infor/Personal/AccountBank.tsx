import { ButtonComponent, CardComponent, Table } from '@components/index'
import React, { useMemo } from 'react'
import { getColumn } from './configs/AccountBank.column'
import { LinkedBank } from '@type/responseAccountWallet'
import usePagination from '@hooks/usePagination'

interface Props {
  linkedBanks?: LinkedBank[]
}
const AccountBank = ({ linkedBanks }: Props) => {
  const { page, pageSize, setPage, setPageSize } = usePagination()
  const total = linkedBanks?.length

  const dataSource = useMemo(() => {
    return linkedBanks?.map((item, index) => {
      return {
        no: (page - 1) * pageSize + index + 1,
        ...item,
      }
    })
  }, [linkedBanks])
  const column = getColumn()
  return (
    <div>

      <CardComponent className='mt-3' content={<>
        <div className="flex justify-between items-center mb-3">
          <span className='font-medium text-gray-600 text-lg'>Danh sách liên kết</span>
          <ButtonComponent content='Xuất Excel' />
        </div>
        <Table
          rowKey='id'
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            }
          }}
          scroll={{ x: 'max-content' }} 
          size='small' columns={column} 
          bordered dataSource={dataSource} />
      </>} />
    </div>
  )
}

export default AccountBank
