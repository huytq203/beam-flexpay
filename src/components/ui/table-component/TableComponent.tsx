import { useState } from 'react'
import type { ReactNode } from 'react'
import { Empty, Table } from 'antd'
import type { TablePaginationConfig, TableProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { cn } from '@lib/utils/cn'
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

const ACTION_COLUMN_TITLES = ['Thao tác', 'Hành động']

type TableColumns<T extends object> = ColumnsType<T>

const hasChildren = <T extends object>(
  column: TableColumns<T>[number]
): column is TableColumns<T>[number] & { children: TableColumns<T> } =>
  'children' in column && Array.isArray(column.children)

const isActionColumn = <T extends object>(
  column: TableColumns<T>[number]
): boolean =>
  !hasChildren(column) &&
  typeof column.title === 'string' &&
  ACTION_COLUMN_TITLES.includes(column.title)

const someColumn = <T extends object>(
  columns: TableColumns<T>,
  test: (column: TableColumns<T>[number]) => boolean
): boolean =>
  columns.some((column) =>
    hasChildren(column) ? someColumn(column.children, test) : test(column)
  )

/**
 * Cột Thao tác/Hành động co theo số nút của dòng. Độ rộng cố định luôn phải đặt theo trường hợp
 * nhiều nút nhất nên cột bị phình khi dòng ít nút; bỏ trống thì bố cục `auto` lại chia phần dư của
 * bảng cho cả cột này. Đặt `width: 1` để cột co về đúng nội dung (không xuống dòng), phần dư
 * dồn sang các cột còn lại.
 */
const fitActionColumns = <T extends object>(
  columns: TableColumns<T>
): TableColumns<T> =>
  columns.map((column) => {
    if (hasChildren(column)) {
      return { ...column, children: fitActionColumns(column.children) }
    }
    if (!isActionColumn(column)) return column
    return {
      ...column,
      // Cột Thao tác luôn ghim bên phải để còn thấy khi bảng cuộn ngang.
      ...(column.title === 'Thao tác' && column.fixed === undefined
        ? { fixed: 'right' as const }
        : {}),
      width: 1,
      className: cn(column.className, 'whitespace-nowrap')
    }
  })

const isLoadingTable = <T extends object>(
  loading: TableProps<T>['loading']
): boolean =>
  typeof loading === 'boolean' ? loading : Boolean(loading?.spinning)

function TableRefreshButton({ busy, onClick }: TableRefreshButtonProps) {
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

  // Bố cục `auto` là điều kiện để cột co theo nội dung, nhưng làm cột `ellipsis` không cắt chữ
  // được; bảng có cột ellipsis giữ nguyên bố cục cố định và độ rộng khai báo.
  const columns = props.columns
  const fitsActions =
    Boolean(columns) &&
    props.tableLayout === undefined &&
    someColumn(columns ?? [], isActionColumn) &&
    !someColumn(columns ?? [], (column) => Boolean(column.ellipsis))

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
        {...(fitsActions && columns
          ? { columns: fitActionColumns(columns), tableLayout: 'auto' as const }
          : {})}
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
