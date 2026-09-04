import { Empty } from 'antd'

import { WarningIcon, ArrowsCounterClockwiseIcon } from '@components/icons'
import { ButtonComponent, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'

import { createBusinessWalletColumns } from '../columns/business-wallet.columns'
import type { BusinessWalletRow } from '../types/business-wallet.type'

interface BusinessWalletTableStateProps {
  rows: BusinessWalletRow[]
  totalElements: number
  page: number
  size: number
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onEdit: (row: BusinessWalletRow) => void
  onRefresh: () => void | Promise<unknown>
  onPageChange: (page: number, pageSize: number) => void
}

export function BusinessWalletTableState({
  rows,
  totalElements,
  page,
  size,
  isLoading,
  isFetching,
  isError,
  onEdit,
  onRefresh,
  onPageChange
}: BusinessWalletTableStateProps) {
  const columns = createBusinessWalletColumns({ onEdit })
  const handleRefresh = (): void => {
    void onRefresh()
  }

  if (isLoading) {
    return (
      <div role='status' aria-label='Đang tải danh sách ví doanh nghiệp'>
        <SkeletonTable
          rows={size}
          columns={columns.length}
          noContainer
        />
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role='alert'
        className='flex min-h-56 flex-col items-center justify-center gap-3 px-4 text-center'
      >
        <span className='flex size-10 items-center justify-center rounded-lg bg-danger/10 text-danger'>
          <WarningIcon aria-hidden size={22} />
        </span>
        <div className='space-y-1'>
          <h3 className='font-display text-base font-semibold text-foreground'>
            Không tải được danh sách ví doanh nghiệp
          </h3>
          <p className='text-sm text-muted-foreground'>
            Vui lòng kiểm tra kết nối và thử tải lại dữ liệu.
          </p>
        </div>
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Thử lại'
          icon={<ArrowsCounterClockwiseIcon aria-hidden size={18} />}
          onClick={handleRefresh}
        />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className='space-y-1'>
            <p className='font-medium text-foreground'>Chưa có ví doanh nghiệp</p>
            <p className='text-sm text-muted-foreground'>
              Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        }
      >
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Làm mới dữ liệu'
          icon={<ArrowsCounterClockwiseIcon aria-hidden size={18} />}
          onClick={handleRefresh}
        />
      </Empty>
    )
  }

  return (
    <Table<BusinessWalletRow>
      rowKey='id'
      size='small'
      columns={columns}
      dataSource={rows}
      loading={isFetching}
      onRefresh={onRefresh}
      pagination={{
        current: page,
        pageSize: size,
        total: totalElements,
        showSizeChanger: true,
        onChange: onPageChange
      }}
    />
  )
}
