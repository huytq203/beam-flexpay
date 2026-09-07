import { Empty } from 'antd'

import { ArrowsCounterClockwiseIcon, WarningIcon } from '@components/icons'
import { ButtonComponent, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'

import { createBankAccountColumns } from '../columns/bank-account.columns'
import type { BankAccountRow } from '../types/bank-account.type'

interface BankAccountTableStateProps {
  rows: BankAccountRow[]
  totalElements: number
  page: number
  size: number
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onEdit: (row: BankAccountRow) => void
  onToggleLock: (row: BankAccountRow) => void
  onRefresh: () => void | Promise<unknown>
  onPageChange: (page: number, pageSize: number) => void
}

export function BankAccountTableState({
  rows,
  totalElements,
  page,
  size,
  isLoading,
  isFetching,
  isError,
  onEdit,
  onToggleLock,
  onRefresh,
  onPageChange
}: BankAccountTableStateProps) {
  const columns = createBankAccountColumns({ onEdit, onToggleLock })
  const handleRefresh = (): void => {
    void onRefresh()
  }

  if (isLoading) {
    return (
      <div role='status' aria-label='Đang tải danh sách tài khoản ngân hàng'>
        <SkeletonTable rows={size} columns={columns.length} noContainer />
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
            Không tải được danh sách tài khoản ngân hàng
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
            <p className='font-medium text-foreground'>
              Chưa có tài khoản ngân hàng
            </p>
            <p className='text-sm text-muted-foreground'>
              Không tìm thấy tài khoản phù hợp với bộ lọc hiện tại.
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
    <Table<BankAccountRow>
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
