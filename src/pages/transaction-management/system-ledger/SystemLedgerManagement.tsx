import { CardComponent, Table, TooltipComponent } from '@components/index'
import React from 'react'
import FormSearch from './components/FormSearch'
import getSystemLedgerColumn from './columns/SystemLedger.column'
import useSystemLedger from './hooks/useSystemLedger'
import { LedgerEntry } from './types/SystemLedger.type'
import dayjs from 'dayjs'
import { formatCurrency } from '@utils/formatNumber'
import { OwnerTypeLabels, StatusConstants } from './constants/SystemLedger.constant'
import StatusBadge from '@components/status-badge/StatusBadge'

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
    refetch,
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
          <div className="bg-white p-3 rounded-sm border">
            <h4 className="font-bold text-[12px] mb-2 text-gray-700">Chi tiết giao dịch</h4>
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
                <span className="text-gray-500">Mã giao dịch:</span>
                <span className="font-medium">{record.transaction?.transactionCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tài khoản:</span>
                <span className="font-medium">{record.transaction?.maskedAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Loại giao dịch:</span>
                <span className="font-medium">{record.transaction?.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng tiền:</span>
                <span className="font-bold">{formatCurrency(record.transaction?.grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thực nhận:</span>
                <span className="font-medium">{formatCurrency(record.transaction?.netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí:</span>
                <span className="font-medium text-red-600">{formatCurrency(record.transaction?.feeAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mô tả:</span>
                <span className="font-medium">{record.transaction?.description || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thời gian xử lý:</span>
                <span className="font-medium">{dayjs(record.transaction?.processedAt).format('DD/MM/YYYY HH:mm:ss')}</span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white p-3 rounded-sm border">
            <h4 className="font-bold text-[12px] mb-2 text-gray-700">Chi tiết tài khoản</h4>
            <div className="space-y-1 text-[12px]">
              {/* <div className="flex justify-between">
                <span className="text-gray-500">Account ID:</span>
                <span className="font-medium font-mono">{record.account?.id.substring(0, 13)}...</span>
              </div> */}

              <div className="flex justify-between">
                <span className="text-gray-500">Loại tài khoản:</span>
                <div className="flex flex-col items-end">
                  <span className="font-medium">{OwnerTypeLabels[record.account?.ownerType] || record.account?.ownerType} </span>
                  <span className="font-medium text-gray-400">{record.account?.glCode} </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tài khoản:</span>
                <span className="font-medium">{record.account?.ownerUsername ? record.account?.ownerUsername !== 'SYSTEM' ? record.account?.ownerUsername : 'Hệ thống' : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số dư:</span>
                <span className="font-bold text-green-600">{formatCurrency(record.account?.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng nợ:</span>
                <span className="font-medium">{formatCurrency(record.account?.totalDebit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng có:</span>
                <span className="font-medium">{formatCurrency(record.account?.totalCredit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số dư khả dụng:</span>
                <span className="font-medium">{formatCurrency(record.account?.balance ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trạng thái tài khoản:</span>
                <StatusBadge className='text-[10px]' status={record.account?.status as StatusConstants} />
              </div>
            </div>
          </div>

          {/* Entry Details */}
          <div className="bg-white p-3 rounded-sm border">
            <h4 className="font-bold text-[12px] mb-2 text-gray-700">Chi tiết Entry</h4>
            <div className="space-y-1 text-[12px]">
              {/* <div className="flex justify-between">
                <span className="text-gray-500">Entry ID:</span>
                <span className="font-medium font-mono">{record.id.substring(0, 13)}...</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-gray-500">Loại:</span>
                <span className={`font-bold ${record.direction === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                  {record.direction}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-bold">{formatCurrency(record.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số dư sau:</span>
                <span className="font-bold text-blue-600">{formatCurrency(record.balanceAfter)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số dư bị giữ:</span>
                <span className="font-medium">{formatCurrency(record.account?.holdBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày tạo:</span>
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
            onRefresh={refetch}
            rowKey="id"
            expandable={{
              expandedRowRender,
              rowExpandable: () => true,
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
              showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
            }}
          />
        }
      />
    </div>
  )
}

export default SystemLedgerManagement
