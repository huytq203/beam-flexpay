import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TabComponent } from '@components/index'
import { MerchantOrdersPanel } from '../components/MerchantOrdersPanel'
import { OrderActionDialog } from '../components/OrderActionDialog'
import { OrderCreateDialog } from '../components/OrderCreateDialog'
import { OrderDetailDrawer } from '../components/OrderDetailDrawer'
import { PaymentAnomaliesPanel } from '../components/PaymentAnomaliesPanel'
import type {
  MerchantOrder,
  OrderActionKind,
  OrderTab
} from '../types/merchantOrder.types'

interface ActionTarget {
  kind: OrderActionKind
  order: MerchantOrder
}

const TAB_PARAM = 'tab'

export default function MerchantOrderListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: OrderTab =
    searchParams.get(TAB_PARAM) === 'anomalies' ? 'anomalies' : 'orders'
  const [detailId, setDetailId] = useState<string | null>(null)
  const [action, setAction] = useState<ActionTarget | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <>
      <TabComponent
        activeKey={tab}
        items={[
          { key: 'orders', label: 'Đơn hàng' },
          { key: 'anomalies', label: 'Tiền về bất thường' }
        ]}
        // Mỗi tab có bộ lọc và phân trang riêng nên đổi tab bỏ mọi tham số cũ.
        onChange={(key) => setSearchParams({ [TAB_PARAM]: key })}
      />
      {tab === 'orders' ? (
        <MerchantOrdersPanel
          onView={(order) => setDetailId(order.id)}
          onAction={(kind, order) => setAction({ kind, order })}
          onCreate={() => setCreating(true)}
        />
      ) : (
        <PaymentAnomaliesPanel onViewOrder={setDetailId} />
      )}
      {detailId && (
        <OrderDetailDrawer
          key={detailId}
          orderId={detailId}
          onClose={() => setDetailId(null)}
          onAction={(kind, order) => setAction({ kind, order })}
        />
      )}
      {action && (
        <OrderActionDialog
          key={`${action.kind}:${action.order.id}`}
          kind={action.kind}
          order={action.order}
          onClose={() => setAction(null)}
        />
      )}
      {creating && <OrderCreateDialog onClose={() => setCreating(false)} />}
    </>
  )
}
