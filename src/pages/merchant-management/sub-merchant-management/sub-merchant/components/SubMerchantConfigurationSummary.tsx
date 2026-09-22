import { CardComponent } from '@components/index'

import type { ConfigurationSource, SubMerchantRow } from '../types/subMerchant.type'
import { formatVnd } from '../utils/subMerchant.utils'

interface SubMerchantConfigurationSummaryProps {
  record: SubMerchantRow
  masked?: boolean
}

const sourceLabel = (source: ConfigurationSource): string =>
  source === 'INHERITED' ? 'Kế thừa Merchant cha' : 'Cấu hình riêng'

export function SubMerchantConfigurationSummary({
  record,
  masked = true
}: SubMerchantConfigurationSummaryProps) {
  const integrationItems = [
    {
      label: 'Tài khoản ngân hàng',
      value: masked ? record.maskedBankAccount : 'Dữ liệu được bảo vệ',
      source: record.configurationSources.bank
    },
    {
      label: 'Key tích hợp',
      value: masked ? record.maskedIntegrationKey : 'Dữ liệu được bảo vệ',
      source: record.configurationSources.key
    },
    { label: 'Thanh toán', value: 'Theo cấu hình đang áp dụng', source: record.configurationSources.payment },
    { label: 'Thông báo', value: 'Theo cấu hình đang áp dụng', source: record.configurationSources.notification }
  ]

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='configuration-summary-title' className='space-y-5'>
        <header className='border-b border-border pb-3'>
          <h2 className='font-display text-base font-semibold text-foreground' id='configuration-summary-title'>Cấu hình vận hành</h2>
          <p className='mt-1 text-xs text-muted-foreground'>Giá trị nhạy cảm luôn được che trên màn hình tổng quan.</p>
        </header>
        <dl className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {integrationItems.map((item) => (
            <div className='rounded-lg border border-border bg-muted/30 p-3' key={item.label}>
              <dt className='text-xs text-muted-foreground'>{item.label}</dt>
              <dd className='mt-1 font-medium text-foreground'>{item.value}</dd>
              <dd className='mt-1 text-xs text-muted-foreground'>{sourceLabel(item.source)}</dd>
            </div>
          ))}
        </dl>
        <dl className='grid grid-cols-1 gap-x-6 gap-y-3 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-4'>
          <div><dt className='text-xs text-muted-foreground'>Quyết toán</dt><dd className='mt-1 text-sm font-medium'>{record.settlementMode === 'AUTO' ? 'Tự động' : 'Thủ công'} · T+{record.holdbackDays}</dd></div>
          <div><dt className='text-xs text-muted-foreground'>Ngưỡng duyệt tự động</dt><dd className='mt-1 text-sm font-medium tabular-nums'>{formatVnd(record.autoApprovalThreshold)}</dd></div>
          <div><dt className='text-xs text-muted-foreground'>Rút tối thiểu</dt><dd className='mt-1 text-sm font-medium tabular-nums'>{formatVnd(record.minimumWithdrawal)}</dd></div>
          <div><dt className='text-xs text-muted-foreground'>Hạn mức rút/ngày</dt><dd className='mt-1 text-sm font-medium tabular-nums'>{formatVnd(record.dailyWithdrawalLimit)}</dd></div>
        </dl>
      </section>
    </CardComponent>
  )
}
