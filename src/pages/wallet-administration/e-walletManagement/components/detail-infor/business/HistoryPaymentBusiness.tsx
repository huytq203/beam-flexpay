import { CardComponent, Table } from '@components/index'
import React, { useState } from 'react'
import { Column } from './configs/HistoryPayment.column'
import HistoryFormSearch from './components/HistoryFormSearch'
import useFetchData from './hooks/useFetchDataHistory'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import dayjs from 'dayjs'

interface Props {
  ownerId: string
}
const HistoryPaymentBusiness = ({ ownerId }: Props) => {
  const [searchParams, setSearchParams] = useState<any>({})
  const { dataTransaction, isLoadingGetTransaction, dataSource, page, size, setPage, setPageSize } = useFetchData(ownerId, searchParams)

  const handleSearch = (data: any) => {
    const formattedData = {
      ...data,
      fromDate: data.fromDate ? dayjs(data.fromDate).startOf('day').toISOString() : undefined,
      toDate: data.toDate ? dayjs(data.toDate).endOf('day').toISOString() : undefined,
    }

    // Remove undefined/empty values
    Object.keys(formattedData).forEach(key => (!formattedData[key] && formattedData[key] !== 0) && delete formattedData[key])

    setSearchParams(formattedData)
    setPage(1)
  }

  const column = Column()
  return (
    <div>

      <CardComponent className='mt-3' content={<><HistoryFormSearch onSearch={handleSearch} /></>} />
      <CardComponent className='mt-3' content={
        isLoadingGetTransaction ? (
          <SkeletonTable columns={column?.length || 5} rows={size || 5} />
        ) : (
          <Table
            scroll={{ x: 'max-content' }} size='small'
            bordered columns={column}
            dataSource={dataSource}
            pagination={{
              current: page,
              showSizeChanger: true,
              pageSize: size,
              total: dataTransaction?.totalElements,
              onChange: (page, pageSize) => {
                setPage(page)
                setPageSize(pageSize)
              },
            }}

          />
        )}
      />

    </div>
  )
}

export default HistoryPaymentBusiness
