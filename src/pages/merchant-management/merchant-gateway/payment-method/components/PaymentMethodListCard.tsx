import { Can } from '@/app/permissions'
import type { PaymentMethodListRow } from '@/app/services/merchantPaymentMethodApi'
import { CreditCardOutlined, PlusOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  ExportCsvButton,
  Table
} from '@components/index'
import { createPaymentMethodColumns } from '../columns/paymentMethod.columns'

interface PaymentMethodListCardProps {
  rows: PaymentMethodListRow[]
  total: number
  page: number
  size: number
  loading: boolean
  error: boolean
  onRefresh: () => void
  onPageChange: (page: number, size: number) => void
  onEdit: (row: PaymentMethodListRow) => void
  onCreate: () => void
  onExport: () => void
  exporting: boolean
}

/** Dòng Sub dùng chung `merchantId` với Master nên khoá phải gồm cả Sub. */
const rowKey = (row: PaymentMethodListRow) =>
  `${row.merchantId}:${row.subMerchantId ?? 'MASTER'}`

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
  onCreate,
  onExport,
  exporting
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
        <div className='flex flex-wrap items-center gap-2'>
          <Can
            screen='MERCHANT_PAYMENT_METHOD'
            action='export'
          >
            <ExportCsvButton
              onExport={onExport}
              loading={exporting}
              tooltip='Xuất toàn bộ cấu hình khớp từ khoá tên/mã Merchant, không theo trang đang xem.'
            />
          </Can>
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
      <Table<PaymentMethodListRow>
        rowKey={rowKey}
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
