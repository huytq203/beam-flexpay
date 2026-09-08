import { Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import * as Icons from '@components/icons'
import type { ColumnsType } from 'antd/es/table'
import type { FeeComponent } from '../types/FeeComponent.types'
import { groupFeeComponentsByBeneficiary } from '../utils/feeComponentGroups'

interface FeeComponentGroupsProps {
  dataSource: FeeComponent[] | undefined
  columns: ColumnsType<FeeComponent>
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  /** Bề rộng tối thiểu để bảng cuộn ngang thay vì bóp chữ trên điện thoại. */
  scrollX?: number
}

const EmptyState = () => (
  <div className='flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-center'>
    <Icons.ScalesIcon size={40} className='text-muted-foreground' />
    <p className='font-medium text-foreground'>Chưa có thành phần phí nào</p>
    <p className='max-w-sm text-xs text-muted-foreground'>
      Thêm ít nhất một thành phần để biết khoản phí này được chia cho ngân hàng
      và FlexPay như thế nào.
    </p>
  </div>
)

const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <div className='flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-danger-strong/40 bg-red-50 py-10 text-center'>
    <Icons.WarningIcon size={36} color='#c62828' />
    <p className='font-medium text-danger-strong'>
      Không tải được danh sách thành phần phí
    </p>
    {onRetry && (
      <button
        type='button'
        onClick={onRetry}
        className='rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-slate-50'
      >
        Thử lại
      </button>
    )}
  </div>
)

/**
 * Bảng thành phần phí tách theo bên hưởng. Không cộng tổng: khi có thành phần
 * tính theo phần trăm hoặc theo bậc, tổng phụ thuộc số tiền giao dịch nên một
 * con số cố định ở đây sẽ là con số sai.
 */
export const FeeComponentGroups = ({
  dataSource,
  columns,
  isLoading = false,
  isError = false,
  onRetry,
  scrollX = 1040
}: FeeComponentGroupsProps) => {
  if (isLoading) return <SkeletonTable />
  if (isError) return <ErrorState onRetry={onRetry} />

  const groups = groupFeeComponentsByBeneficiary(dataSource)
  if (groups.length === 0) return <EmptyState />

  return (
    <div className='space-y-4'>
      {groups.map((group) => (
        <section key={group.beneficiaryType}>
         
          <div className='rounded-b-xl'>
            <Table<FeeComponent>
              columns={columns}
              dataSource={group.items}
              rowKey={(record) => record.id ?? `${group.beneficiaryType}-${record.componentType}`}
              size='small'
              pagination={false}
              scroll={{ x: scrollX }}
            />
          </div>
        </section>
      ))}
    </div>
  )
}
