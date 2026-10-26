import type { ColumnsType } from 'antd/es/table'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, Table } from '@components/index'
import type { MerchantPage } from '@type/merchant'

interface MerchantHistoryTableProps<T extends object> {
  label: string
  rowKey: keyof T & string
  columns: ColumnsType<T>
  data?: MerchantPage<T>
  isFetching: boolean
  isError: boolean
  error: unknown
  page: number
  size: number
  emptyText: string
  onRefetch: () => void
  onPageChange: (page: number, size: number) => void
}

/** Bảng phân trang dùng chung cho Lịch sử trạng thái và Nhật ký. */
export function MerchantHistoryTable<T extends object>({
  label,
  rowKey,
  columns,
  data,
  isFetching,
  isError,
  error,
  page,
  size,
  emptyText,
  onRefetch,
  onPageChange
}: MerchantHistoryTableProps<T>) {
  if (isError)
    return (
      <div
        role='alert'
        className='flex flex-wrap items-center gap-2 text-sm text-danger-strong'
      >
        {getApiErrorDetail(error, `Không tải được ${label.toLowerCase()}.`)}
        <ButtonComponent
          htmlType='button'
          type='default'
          size='small'
          content='Thử lại'
          onClick={onRefetch}
        />
      </div>
    )

  return (
    <Table<T>
      aria-label={label}
      size='small'
      rowKey={rowKey}
      columns={columns}
      dataSource={data?.content ?? []}
      loading={isFetching}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText }}
      onRefresh={onRefetch}
      pagination={{
        current: page,
        pageSize: size,
        total: data?.totalElements ?? 0,
        onChange: onPageChange
      }}
    />
  )
}
