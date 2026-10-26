import { TagComponent } from '@components/index'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS
} from '../constants/merchantOrder.constants'
import type { MerchantOrderStatus } from '../types/merchantOrder.types'

export function OrderStatusTag({ status }: { status: MerchantOrderStatus }) {
  return (
    <TagComponent color={ORDER_STATUS_COLORS[status] ?? 'default'}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </TagComponent>
  )
}
