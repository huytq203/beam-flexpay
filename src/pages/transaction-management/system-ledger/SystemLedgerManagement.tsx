import { CardComponent, Table, TooltipComponent } from '@components/index'
import React from 'react'
import FormSearch from './components/FormSearch'
import getSystemLedgerColumn from './columns/SystemLedger.column'
import useSystemLedger from './hooks/useSystemLedger'
import { LedgerEntry } from './types/SystemLedger.type'
import dayjs from 'dayjs'
import { formatCurrency } from '@utils/formatNumber'
import { OwnerTypeLabels, GLCodeLabels, StatusLabel, StatusConstants } from './constants/SystemLedger.constant'
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
    isFetching
  } = useSystemLedger()
    const dataSource2=[
      {
  "id": "48668471-af43-49ef-83e1-56d97e21cef0",
  "transaction": {
    "id": "2e5e9c30-6252-47a5-927b-ead8f2755533",
    "createdAt": "2026-03-31T16:22:00.204816",
    "updatedAt": "2026-03-31T16:22:00.204816",
    "createdBy": "internal-service",
    "updatedBy": "internal-service",
    "transactionCode": "FW26P6XBM",
    "ownerId": "539cf5fd-9cf0-4436-862d-93b75a73441c",
    "type": "DEBIT",
    "grossAmount": 50000,
    "netAmount": 50000,
    "amount": 50000,
    "feeCalculationId": "fb53435d-e25e-449d-9e71-a49d6379d480",
    "feeAmount": 0,
    "currency": "VND",
    "status": "SUCCESS",
    "idempotencyKey": "c1a6fdc5-4325-4728-86b1-f8b1ce6fe5ea",
    "description": "Rut tien ve tai khoan",
    "maskedAccount": "******1913",
    "transactionTime": "2026-03-31T16:22:00.204424",
    "processedAt": "2026-03-31T16:22:00.204434",
    "checksumSalt": "80828b8b-f4b2-4459-8a95-cf19e0e28b5f",
    "checksum": "UE1AId0b+11xgvpHUFTbcwhseQlxurfzfjTsc/BFmtk="
  },
  "account": {
    "id": "a837225d-4a16-4c70-a6f9-0f0e13eb7f93",
    "createdAt": "2026-03-26T18:00:58.50291",
    "updatedAt": "2026-03-31T16:22:00.207675",
    "createdBy": "internal-service",
    "updatedBy": "internal-service",
    "ownerId": "00000000-0000-0000-0000-000000000000",
    "ownerType": "SYSTEM",
    "ownerUsername": null,
    "glCode": "SYS_BANK_SETTLEMENT_VND",
    "currency": "VND",
    "totalDebit": 200000,
    "totalCredit": 200000,
    "balance": 0,
    "holdBalance": 0,
    "availableBalance": 0,
    "version": 11,
    "status": "ACTIVE",
    "checksum": "1lO6U08yVkPRL3kgqtLoFuIKqTRRl/afYNuhpFr9J1E=",
    "lockedReason": null,
    "lockedAt": null,
    "lockedBy": null
  },
  "direction": "CREDIT",
  "amount": 50000,
  "balanceAfter": 0,
  "description": null,
  "checksum": "VHSxImECcyXafkxWdBnNSbpZnusHdUesA52Ldo1RPYc=",
  "previousChecksum": "A92fo0EqTJfzdyG2lbt0I/ycxmJ/2VlAQxuGA2DdPHY=",
  "createdAt": "2026-03-31T16:22:00.269709"
}
    ]
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
          <div className="bg-white p-3 rounded border">
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
          <div className="bg-white p-3 rounded border">
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
              showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
            }}
          />
        }
      />
    </div>
  )
}

export default SystemLedgerManagement
