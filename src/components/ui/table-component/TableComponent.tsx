import { useState } from 'react'
import type { ReactNode } from 'react'
import { Empty, Table } from 'antd'
import type { TablePaginationConfig, TableProps } from 'antd'
import { ArrowsClockwise as RefreshIcon } from '@phosphor-icons/react'
import ButtonComponent from '../button-component'
import TooltipComponent from '../tooltip-component'

interface TableComponentProps<T extends object> extends TableProps<T> {
  onRefresh?: () => void | Promise<unknown>
  /** Hành động của bảng (thêm mới, xuất file...) — nằm cùng hàng, bên trái nút làm mới. */
  toolbar?: ReactNode
}

interface TableRefreshButtonProps {
  busy: boolean
  onClick: () => void
}

const defaultPagination: TablePaginationConfig = {
  showSizeChanger: true,
  showTotal: (total, range) =>
    `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
}

const isLoadingTable = <T extends object>(
  loading: TableProps<T>['loading']
): boolean =>
  typeof loading === 'boolean' ? loading : Boolean(loading?.spinning)

function TableRefreshButton({
  busy,
  onClick
}: TableRefreshButtonProps) {
  return (
    <TooltipComponent title='Làm mới dữ liệu'>
        <ButtonComponent
          type='default'
          htmlType='button'
          aria-label='Làm mới dữ liệu'
          aria-busy={busy}
          icon={
            <RefreshIcon
              aria-hidden
              size={17}
              className={busy ? 'animate-spin' : undefined}
            />
          }
          disabled={busy}
          onClick={onClick}
          className='size-8! rounded-full! border-border! p-0! text-foreground! shadow-none!'
        />
    </TooltipComponent>
  )
}

const TableComponent = <T extends object>({
  onRefresh,
  toolbar,
  ...props
}: TableComponentProps<T>) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const pagination =
    props.pagination === false
      ? false
      : {
          ...defaultPagination,
          ...props.pagination
        }
  const isRefreshBusy = isRefreshing || isLoadingTable(props.loading)

  const handleRefresh = async (): Promise<void> => {
    if (!onRefresh || isRefreshBusy) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className='min-w-0'>
      {(onRefresh || toolbar) && (
        <div className='mb-2 flex min-h-8 flex-wrap items-center justify-end gap-2'>
          {toolbar}
          {onRefresh && (
            <TableRefreshButton
              busy={isRefreshBusy}
              onClick={handleRefresh}
            />
          )}
        </div>
      )}
      <Table<T>
        {...props}
        bordered
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description='Chưa có dữ liệu'
            />
          ),
          ...props.locale
        }}
        pagination={pagination}
        scroll={{ x: 'max-content', ...props.scroll }}
      />
    </div>
  )
}

export type { TableComponentProps }
export default TableComponent
