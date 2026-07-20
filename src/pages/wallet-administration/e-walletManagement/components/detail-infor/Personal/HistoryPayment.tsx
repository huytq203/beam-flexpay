import { CardComponent, Table } from '@components/index'
import React, { useState } from 'react'
import { getColumn } from './configs/HistoryPayment.column'
import HistoryFormSearch, { HistorySearchFormValues } from './components/HistoryFormSearch'
import useFetchData from './hooks/useFetchDataHistory'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import dayjs from 'dayjs'

interface Props {
  ownerId: string
  initiatorUsername: string
}

/** Bộ lọc đã được chuẩn hoá (ngày giờ -> chuỗi ISO) trước khi gửi lên API */
interface HistorySearchParams {
  [key: string]: string | number | undefined
  transactionCode?: string
  counterpartyUsername?: string
  sourceDomain?: string
  status?: string
  transactionType?: string
  paymentMethod?: string
  fromDate?: string
  toDate?: string
}

const HistoryPayment = ({ ownerId, initiatorUsername }: Props) => {
  const [searchParams, setSearchParams] = useState<HistorySearchParams>({})
  const {page, size, setPage, setPageSize,dataSourceUnified,  isLoadingGetUnified,  dataUnified, } = useFetchData({ ownerId, initiatorUsername, searchParams })

  const handleSearch = (data: HistorySearchFormValues) => {
    const formattedData: HistorySearchParams = {
      ...data,
      fromDate: data.fromDate ? dayjs(data.fromDate).format('YYYY-MM-DDTHH:mm:ss.SSS') : undefined,
      toDate: data.toDate ? dayjs(data.toDate).format('YYYY-MM-DDTHH:mm:ss.SSS') : undefined,
    }

    // Remove undefined/empty values
    Object.keys(formattedData).forEach(key => (!formattedData[key] && formattedData[key] !== 0) && delete formattedData[key])

    setSearchParams(formattedData)
    setPage(1)
  }

  const column = getColumn()
  return (
    <div>

      <CardComponent className='mt-3' content={<><HistoryFormSearch onSearch={handleSearch} /></>} />
      <CardComponent className='mt-3' content={
        isLoadingGetUnified ? (
          <SkeletonTable columns={column?.length || 5} rows={size || 5} />
        ) : (
          <Table
            scroll={{ x: 'max-content' }} size='small'
            bordered columns={column}
            dataSource={dataSourceUnified}
            pagination={{
              current: page,
              showSizeChanger: true,
              pageSize: size,
              total: dataUnified?.totalElements,
              onChange: (page, pageSize) => {
                setPage(page)
                setPageSize(pageSize)
              },
              showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
            }}

          />
        )}
      />

    </div>
  )
}

export default HistoryPayment