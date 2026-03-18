import { CardComponent, Table, TooltipComponent } from '@components/index'
import React from 'react'
import FormSearch from './components/FormSearch'
import getSystemLedgerColumn from './columns/SystemLedger.column'
import useSystemLedger from './hooks/useSystemLedger'
import { LedgerEntry } from './types/SystemLedger.type'
import dayjs from 'dayjs'
import { formatCurrency } from '@utils/formatNumber'
import { OwnerTypeLabels, GLCodeLabels } from './constants/SystemLedger.constant'

const SystemLedgerManagement = () => {
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<string[]>([])

  const {
    dataSource,
    totalElements,
    page,
    setPage,
    pageSize,
    setPageSize,
    navigate,
    handleSearch,
    isFetching
  } = useSystemLedger()

  const columns = getSystemLedgerColumn({ navigate })

  // Handle expand - chỉ cho phép mở 1 row tại 1 thời điểm
  const handleExpand = (expanded: boolean, record: LedgerEntry) => {
    if (expanded) {
      setExpandedRowKeys([record.id]) // Chỉ mở row hiện tại
    } else {
      setExpandedRowKeys([]) // Đóng tất cả
    }
  }

  // Expandable row render
  const expandedRowRender = (record: LedgerEntry) => {
    return (
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Transaction Details */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-bold text-[12px] mb-2 text-gray-700">Transaction Details</h4>
            <div className="space-y-1 text-[12px]">
              {/* <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-medium font-mono">{record.transaction?.id.substring(0, 13)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Owner ID:</span>
                <span className="font-medium font-mono">{record.transaction?.ownerId?.substring(0, 13)}...</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{record.transaction?.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gross Amount:</span>
                <span className="font-bold">{formatCurrency(record.transaction?.grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Net Amount:</span>
                <span className="font-medium">{formatCurrency(record.transaction?.netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fee Amount:</span>
                <span className="font-medium text-red-600">{formatCurrency(record.transaction?.feeAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Description:</span>
                <span className="font-medium">{record.transaction?.description || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Processed At:</span>
                <span className="font-medium">{dayjs(record.transaction?.processedAt).format('DD/MM/YYYY HH:mm:ss')}</span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-bold text-[12px] mb-2 text-gray-700">Account Details</h4>
            <div className="space-y-1 text-[12px]">
              {/* <div className="flex justify-between">
                <span className="text-gray-500">Account ID:</span>
                <span className="font-medium font-mono">{record.account?.id.substring(0, 13)}...</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-gray-500">GL Code:</span>
                <span className="font-bold text-blue-600">{record.account?.glCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Owner Type:</span>
                <span className="font-medium">{OwnerTypeLabels[record.account?.ownerType] || record.account?.ownerType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Balance:</span>
                <span className="font-bold text-green-600">{formatCurrency(record.account?.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Debit:</span>
                <span className="font-medium">{formatCurrency(record.account?.totalDebit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Credit:</span>
                <span className="font-medium">{formatCurrency(record.account?.totalCredit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Available Balance:</span>
                <span className="font-medium">{formatCurrency(record.account?.balance??0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Status:</span>
                <span className="font-medium text-green-600">{record.account?.status}</span>
              </div>
            </div>
          </div>

          {/* Entry Details */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-bold text-[12px] mb-2 text-gray-700">Entry Details</h4>
            <div className="space-y-1 text-[12px]">
              {/* <div className="flex justify-between">
                <span className="text-gray-500">Entry ID:</span>
                <span className="font-medium font-mono">{record.id.substring(0, 13)}...</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-gray-500">Direction:</span>
                <span className={`font-bold ${record.direction === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                  {record.direction}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Entry Amount:</span>
                <span className="font-bold">{formatCurrency(record.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Balance After:</span>
                <span className="font-bold text-blue-600">{formatCurrency(record.balanceAfter)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hold Balance:</span>
                <span className="font-medium">{formatCurrency(record.account?.holdBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created At:</span>
                <span className="font-medium">{dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Checksum:</span>
                <TooltipComponent title={record.checksum}>
                  <span className="font-mono text-[10px]">{record.checksum.substring(0, 20)}...</span>
                </TooltipComponent>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Prev Checksum:</span>
                <TooltipComponent title={record.previousChecksum}>
                  <span className="font-mono text-[10px]">{record.previousChecksum.substring(0, 20)}...</span>
                </TooltipComponent>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      <CardComponent content={<FormSearch handleSearch={handleSearch} />} />
      <CardComponent
        content={
          <Table
            bordered
            size='small'
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={dataSource}
            loading={isFetching}
            rowKey="id"
            expandable={{
              expandedRowRender,
              rowExpandable: (record) => true,
              expandedRowKeys: expandedRowKeys,
              onExpand: handleExpand,
            }}
            pagination={{
              current: page,
              showSizeChanger: true,
              pageSize: pageSize,
              total: totalElements,
              onChange: (page, pageSize) => {
                setPage(page)
                setPageSize(pageSize)
              },
              showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} entries`
            }}
          />
        }
      />
    </div>
  )
}

export default SystemLedgerManagement
