import { Table } from '@components/index'
import type { RefundItemInfo } from '@/app/schemas/unified-refund.schema'
import { createTransactionRefundColumns } from '../columns/TransactionRefundList.column'

interface TransactionRefundListProps {
  /** `null`/`undefined`: chưa tra được (user-wallet lỗi); `[]`: chưa có yêu cầu hoàn. */
  refunds: RefundItemInfo[] | null | undefined
  currency?: string
}

const MESSAGE_CLASS =
  'rounded-md bg-muted px-3 py-4 text-center text-sm text-muted-foreground'

function RefundListBody({ refunds, currency }: TransactionRefundListProps) {
  if (refunds == null) {
    return (
      <p
        role='status'
        className={MESSAGE_CLASS}
      >
        Không tải được danh sách hoàn tiền. Thông tin hoàn tiền chưa xác định,
        vui lòng tải lại sau.
      </p>
    )
  }
  if (refunds.length === 0) {
    return <p className={MESSAGE_CLASS}>Chưa có yêu cầu hoàn tiền</p>
  }
  return (
    <Table
      columns={createTransactionRefundColumns(currency)}
      dataSource={refunds}
      rowKey='refundCode'
      pagination={false}
      size='small'
      scroll={{ x: 'max-content' }}
    />
  )
}

export function TransactionRefundList({
  refunds,
  currency
}: TransactionRefundListProps) {
  return (
    <section aria-label='Yêu cầu hoàn tiền'>
      <div className='flex items-baseline justify-between gap-3'>
        <p className='font-medium'>Yêu cầu hoàn tiền</p>
        {refunds && refunds.length > 0 && (
          <span className='text-sm text-muted-foreground'>
            {refunds.length} yêu cầu, mới nhất trước
          </span>
        )}
      </div>
      <hr className='my-3' />
      <RefundListBody
        refunds={refunds}
        currency={currency}
      />
    </section>
  )
}
