import { ButtonComponent, ExportCsvButton, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import type { ColumnsType } from 'antd/es/table'
import type { ApplicableFeeRuleTableRow } from '../configs/FeeSetting.column'
import { FeeRulesEmptyState } from './FeeSettingCard'

interface FeeRulesBodyProps {
  columns: ColumnsType<ApplicableFeeRuleTableRow>
  dataSource: ApplicableFeeRuleTableRow[]
  page: number
  size: number
  totalElements: number
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  /** Rỗng vì bộ lọc, không phải vì chưa có quy tắc. */
  hasFilter: boolean
  refetch: () => void | Promise<unknown>
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  /** Câu hiển thị khi chưa có quy tắc nào; bỏ trống thì dùng câu của ví. */
  emptyMessage?: string
}

/**
 * Thân thẻ quy tắc phí dùng chung cho tab ví và khối trong chi tiết merchant:
 * khung tải, lỗi (có nút thử lại), trạng thái rỗng và bảng phân trang.
 */
export const FeeRulesBody = ({
  columns,
  dataSource,
  page,
  size,
  totalElements,
  isLoading,
  isFetching,
  isError,
  hasFilter,
  refetch,
  setPage,
  setPageSize,
  emptyMessage
}: FeeRulesBodyProps) => {
  if (isLoading) {
    return (
      <SkeletonTable
        columns={columns.length}
        rows={size}
        noContainer
      />
    )
  }

  if (isError) {
    return (
      <div
        role='alert'
        className='flex min-h-44 flex-col items-center justify-center gap-3 text-center'
      >
        <div>
          <p className='font-medium text-foreground'>
            Không tải được quy tắc phí
          </p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Vui lòng thử lại hoặc kiểm tra quyền xem chính sách phí.
          </p>
        </div>
        <ButtonComponent
          type='default'
          content='Thử lại'
          onClick={() => refetch()}
        />
      </div>
    )
  }

  if (dataSource.length === 0) {
    return (
      <FeeRulesEmptyState
        filtered={hasFilter}
        message={emptyMessage}
      />
    )
  }

  return (
    <Table<ApplicableFeeRuleTableRow>
      rowKey='rowKey'
      size='small'
      scroll={{ x: 'max-content' }}
      columns={columns}
      dataSource={dataSource}
      loading={isFetching}
      onRefresh={refetch}
      pagination={{
        current: page,
        pageSize: size,
        total: totalElements,
        showSizeChanger: true,
        onChange: (nextPage, nextPageSize) => {
          setPage(nextPage)
          setPageSize(nextPageSize)
        }
      }}
    />
  )
}

interface FeeRulesExportButtonProps {
  onExport: () => void
  loading: boolean
  totalElements: number
  tooltip: string
}

/** Nút xuất CSV của thẻ quy tắc phí: khóa khi chưa có dòng nào để xuất. */
export const FeeRulesExportButton = ({
  onExport,
  loading,
  totalElements,
  tooltip
}: FeeRulesExportButtonProps) => (
  <ExportCsvButton
    onExport={onExport}
    loading={loading}
    disabled={totalElements === 0}
    totalRows={totalElements}
    tooltip={tooltip}
  />
)
