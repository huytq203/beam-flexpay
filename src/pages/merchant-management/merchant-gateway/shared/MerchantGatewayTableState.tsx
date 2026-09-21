import { Empty } from 'antd'
import type { Key } from 'react'

import { ArrowsCounterClockwiseIcon, WarningIcon } from '@components/icons'
import { ButtonComponent, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'

import type { MerchantGatewayTableStateProps } from './merchantGateway.types'

const emptyCopy = {
  initial: {
    title: 'Chưa có cấu hình',
    description: 'Hãy tạo cấu hình đầu tiên để bắt đầu thiết lập merchant.'
  },
  filtered: {
    title: 'Chưa có cấu hình',
    description: 'Không tìm thấy cấu hình phù hợp với bộ lọc hiện tại.'
  }
} as const

export function MerchantGatewayTableState<T extends object>(
  props: MerchantGatewayTableStateProps<T>
) {
  const tableRowKey = props.rowKey as string | ((record: T) => Key)

  if (props.state === 'loading') {
    return (
      <div aria-label='Đang tải danh sách cấu hình merchant' role='status'>
        <span className='sr-only'>Đang tải dữ liệu</span>
        <SkeletonTable columns={props.columns.length} noContainer rows={5} />
      </div>
    )
  }

  if (props.state === 'error') {
    return (
      <div className='flex min-h-56 flex-col items-center justify-center gap-3 px-4 text-center' role='alert'>
        <span className='flex size-10 items-center justify-center rounded-lg bg-danger/10 text-danger'>
          <WarningIcon aria-hidden size={22} />
        </span>
        <div className='space-y-1'>
          <h3 className='font-display text-base font-semibold text-foreground'>
            Không tải được danh sách cấu hình merchant
          </h3>
          <p className='text-sm text-muted-foreground'>
            Vui lòng kiểm tra kết nối và thử tải lại dữ liệu.
          </p>
        </div>
        <ButtonComponent content='Thử lại' htmlType='button' icon={<ArrowsCounterClockwiseIcon aria-hidden size={18} />} onClick={props.onRetry} type='default' />
      </div>
    )
  }

  if (props.state === 'empty') {
    const copy = emptyCopy[props.emptyKind ?? 'initial']

    return (
      <Empty
        description={
          <div className='space-y-1'>
            <p className='font-medium text-foreground'>{copy.title}</p>
            <p className='text-sm text-muted-foreground'>{copy.description}</p>
          </div>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        {props.onRetry && (
          <ButtonComponent content='Làm mới dữ liệu' htmlType='button' icon={<ArrowsCounterClockwiseIcon aria-hidden size={18} />} onClick={props.onRetry} type='default' />
        )}
      </Empty>
    )
  }

  return (
    <Table<T>
      columns={props.columns}
      dataSource={[...props.rows]}
      onRefresh={props.onRefresh}
      pagination={props.pagination}
      rowKey={tableRowKey}
      size='small'
      scroll={{ x: 'max-content' }}
    />
  )
}
