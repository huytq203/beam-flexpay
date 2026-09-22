import { CardComponent } from '@components/index'

import { useSubMerchantTerminalCounts } from '../hooks/useSubMerchantTerminalCounts'
import type { SubMerchantRow } from '../types/subMerchant.type'
import { formatVnd } from '../utils/subMerchant.utils'

interface SubMerchantMetricsProps {
  record: SubMerchantRow
}

const metricClass = 'flex min-w-0 flex-col gap-1 border-b border-border pb-3 last:border-0 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4 sm:last:border-r-0'

export function SubMerchantMetrics({ record }: SubMerchantMetricsProps) {
  const terminals = useSubMerchantTerminalCounts(record.id)
  const metrics = [
    { label: 'Số dư khả dụng', value: formatVnd(record.availableBalance) },
    { label: 'Đã thu hôm nay', value: formatVnd(record.collectedToday) },
    { label: 'Chờ quyết toán', value: formatVnd(record.pendingSettlement) },
    { label: 'Số Terminal', value: String(terminals.total), detail: `${terminals.active} đang hoạt động` }
  ]

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <dl className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {metrics.map((metric) => (
          <div className={metricClass} key={metric.label}>
            <dt className='text-xs font-medium text-muted-foreground'>{metric.label}</dt>
            <dd className='font-display text-base font-semibold text-foreground tabular-nums'>{metric.value}</dd>
            {metric.detail && <dd className='text-xs text-muted-foreground'>{metric.detail}</dd>}
          </div>
        ))}
      </dl>
    </CardComponent>
  )
}
