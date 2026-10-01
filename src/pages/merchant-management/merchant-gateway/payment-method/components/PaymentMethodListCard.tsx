import type { PaymentMethodSummary } from '@/app/services/merchantGatewayApi'
import { Can } from '@/app/permissions'
import { CreditCardOutlined, PlusOutlined } from '@components/icons'
import { ButtonComponent, CardComponent, Table } from '@components/index'
import { createPaymentMethodColumns } from '../columns/paymentMethod.columns'

interface PaymentMethodListCardProps {
  rows: PaymentMethodSummary[]
  total: number
  page: number
  size: number
  loading: boolean
  error: boolean
  onRefresh: () => void
  onPageChange: (page: number, size: number) => void
  onEdit: (merchantId: string) => void
  onCreate: () => void
}

export function PaymentMethodListCard({
  rows,
  total,
  page,
  size,
  loading,
  error,
  onRefresh,
  onPageChange,
  onEdit,
  onCreate
}: PaymentMethodListCardProps) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
        <div className='flex items-center gap-2'>
          <CreditCardOutlined
            aria-hidden
            className='text-secondary-foreground'
          />
          <h2 className='font-display text-base font-semibold text-foreground'>
            Danh sách phương thức thanh toán
          </h2>
          {!error && (
            <span
              aria-live='polite'
              className='rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground tabular-nums'
            >
              {total} bản ghi
            </span>
          )}
        </div>
        <Can
          screen='MERCHANT_PAYMENT_METHOD'
          action='edit'
        >
          <ButtonComponent
            content='Thêm mới cấu hình'
            icon={<PlusOutlined aria-hidden />}
            onClick={onCreate}
          />
        </Can>
      </div>
      {error && (
        <div
          role='alert'
          className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 bg-danger-strong/5 px-3 py-2 text-sm text-danger-strong'
        >
          Không thể tải danh sách.
          <ButtonComponent
            type='default'
            size='small'
            content='Thử lại'
            onClick={onRefresh}
          />
        </div>
      )}
      <Table<PaymentMethodSummary>
        rowKey='merchantId'
        onRefresh={onRefresh}
        loading={loading}
        dataSource={error ? [] : rows}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize: size,
          total,
          onChange: onPageChange
        }}
        columns={createPaymentMethodColumns(page, size, onEdit)}
      />
    </CardComponent>
  )
}
