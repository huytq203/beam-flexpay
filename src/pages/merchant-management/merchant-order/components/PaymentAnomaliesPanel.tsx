import { useState } from 'react'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, Table } from '@components/index'
import { AccessPageShell } from '../../merchant-access/components/AccessPageShell'
import { createPaymentAnomalyColumns } from '../columns/paymentAnomaly.columns'
import { ORDER_PAGE_SIZE_OPTIONS } from '../constants/merchantOrder.constants'
import { usePaymentAnomalyListData } from '../hooks/usePaymentAnomalyListData'
import type { MerchantPaymentAnomaly } from '../types/merchantOrder.types'
import { PaymentAnomalyFilters } from './PaymentAnomalyFilters'
import { PaymentAnomalyResolveDialog } from './PaymentAnomalyResolveDialog'

interface Props {
  onViewOrder: (orderId: string) => void
}

/** Tiền ngân hàng đã báo có nhưng không ghi có merchant; vận hành xử lý rồi đánh dấu Đã xử lý kèm lý do. */
export function PaymentAnomaliesPanel({ onViewOrder }: Props) {
  const data = usePaymentAnomalyListData()
  const [resolving, setResolving] = useState<MerchantPaymentAnomaly | null>(
    null
  )
  const { anomaliesQuery } = data
  const columns = createPaymentAnomalyColumns({
    page: data.page,
    pageSize: data.pageSize,
    onViewOrder,
    onResolve: setResolving
  })

  return (
    <AccessPageShell
      title='Tiền về bất thường'
      count={anomaliesQuery.data?.totalElements}
      actions={null}
      toolbar={
        <PaymentAnomalyFilters
          draft={data.draft}
          onChange={data.setDraft}
          onApply={data.apply}
          onReset={data.reset}
        />
      }
    >
      <p className='mb-3 text-xs text-muted-foreground'>
        Khoản tiền ngân hàng đã báo có nhưng không ghi có cho merchant (đơn
        không còn thanh toán được, trễ, sai số tiền hoặc trùng). Sau khi xử lý
        ngoài hệ thống, đánh dấu Đã xử lý kèm lý do để lưu vết.
      </p>
      {anomaliesQuery.isError && (
        <div
          role='alert'
          className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
        >
          {getApiErrorDetail(
            anomaliesQuery.error,
            'Không thể tải danh sách tiền về bất thường.'
          )}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void anomaliesQuery.refetch()}
          />
        </div>
      )}
      <Table<MerchantPaymentAnomaly>
        columns={columns}
        dataSource={[...data.anomalies]}
        loading={anomaliesQuery.isFetching}
        locale={{ emptyText: 'Không có khoản tiền về bất thường' }}
        onRefresh={anomaliesQuery.refetch}
        pagination={{
          current: data.page,
          pageSize: data.pageSize,
          total: data.total,
          showSizeChanger: true,
          pageSizeOptions: ORDER_PAGE_SIZE_OPTIONS,
          onChange: (page, size) => data.setPagination(page, size)
        }}
        rowKey='id'
        scroll={{ x: 'max-content' }}
        size='small'
      />
      {resolving && (
        <PaymentAnomalyResolveDialog
          key={resolving.id}
          anomaly={resolving}
          onClose={() => setResolving(null)}
        />
      )}
    </AccessPageShell>
  )
}
