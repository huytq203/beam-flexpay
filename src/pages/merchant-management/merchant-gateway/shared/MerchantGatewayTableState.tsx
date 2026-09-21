import { Empty, Result } from 'antd'
import type { Key } from 'react'

import { ButtonComponent, Table } from '@components/index'

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
      <div aria-live='polite' className='min-w-0' role='status'>
        <Table<T>
          columns={props.columns}
          dataSource={[]}
          loading={{ spinning: true, tip: 'Đang tải dữ liệu' }}
          pagination={false}
          rowKey={tableRowKey}
          scroll={{ x: 'max-content' }}
        />
      </div>
    )
  }

  if (props.state === 'error') {
    return (
      <div role='alert'>
        <Result
          status='error'
          title='Không thể tải dữ liệu'
          subTitle='Vui lòng kiểm tra kết nối và thử lại.'
          extra={
            <ButtonComponent
              content='Thử lại'
              htmlType='button'
              onClick={props.onRetry}
            />
          }
        />
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
      />
    )
  }

  return (
    <Table<T>
      columns={props.columns}
      dataSource={[...props.rows]}
      pagination={props.pagination}
      rowKey={tableRowKey}
      scroll={{ x: 'max-content' }}
    />
  )
}
