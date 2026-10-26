import { useGetMerchantOrderByIdQuery } from '@/app/services/apiOrderMerchant.api'
import { Can } from '@/app/permissions'
import { ButtonComponent, DrawerComponent } from '@components/index'
import { getApiErrorDetail } from '@/app/utils/api-error'
import type {
  MerchantOrder,
  OrderActionKind
} from '../types/merchantOrder.types'
import {
  canCancelOrder,
  canConfirmOrder,
  canRefreshOrderQr,
  canRetryCredit
} from '../utils/merchantOrder.utils'
import { OrderDetailSections } from './OrderDetailSections'
import { OrderStatusFlow } from './OrderStatusFlow'

interface Props {
  orderId: string
  onClose: () => void
  onAction: (kind: OrderActionKind, order: MerchantOrder) => void
}

const ACTIONS: readonly {
  kind: OrderActionKind
  label: string
  allowed: (order: MerchantOrder) => boolean
  danger?: boolean
}[] = [
  { kind: 'confirm', label: 'Xác nhận thanh toán', allowed: canConfirmOrder },
  { kind: 'retry', label: 'Ghi có lại', allowed: canRetryCredit },
  { kind: 'refresh', label: 'Làm mới QR', allowed: canRefreshOrderQr },
  { kind: 'cancel', label: 'Hủy đơn', allowed: canCancelOrder, danger: true }
]

export function OrderDetailDrawer({ orderId, onClose, onAction }: Props) {
  const { data, isFetching, isError, error, refetch } =
    useGetMerchantOrderByIdQuery(orderId)
  const order = data?.id === orderId ? data : undefined

  return (
    <DrawerComponent
      open
      width={560}
      title='Chi tiết đơn hàng'
      onClose={onClose}
      loading={isFetching && !order}
      footer={
        order && (
          <Can
            screen='MERCHANT_ORDER'
            action='update'
          >
            <div className='flex flex-wrap justify-end gap-2'>
              {ACTIONS.filter(({ allowed }) => allowed(order)).map(
                ({ kind, label, danger }) => (
                  <ButtonComponent
                    key={kind}
                    danger={danger}
                    htmlType='button'
                    type={danger ? 'default' : 'primary'}
                    content={label}
                    onClick={() => onAction(kind, order)}
                  />
                )
              )}
            </div>
          </Can>
        )
      }
    >
      {isError && !order && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
        >
          {getApiErrorDetail(error, 'Không thể tải chi tiết đơn hàng.')}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void refetch()}
          />
        </div>
      )}
      {order && (
        <>
          <OrderDetailSections order={order} />
          <section>
            <h3 className='mb-2 border-b border-border pb-1 font-display text-sm font-semibold text-foreground'>
              Vị trí trong quy trình
            </h3>
            <OrderStatusFlow current={order.status} />
          </section>
        </>
      )}
    </DrawerComponent>
  )
}
