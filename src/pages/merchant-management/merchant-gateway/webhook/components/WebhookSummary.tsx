import type { ReactNode } from 'react'
import type { MerchantWebhook } from '@/app/services/merchantWebhookApi'
import { TagComponent } from '@components/index'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'

interface WebhookSummaryProps {
  webhook: MerchantWebhook
  isSub: boolean
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className='min-w-0'>
    <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
    <dd className='mt-1 break-all text-sm text-foreground'>{children}</dd>
  </div>
)

export function WebhookSummary({ webhook, isSub }: WebhookSummaryProps) {
  const source = !isSub
    ? 'Cấu hình của Master'
    : webhook.inherited
      ? 'Kế thừa Master'
      : 'Cấu hình riêng của Sub'

  return (
    <div className='space-y-3'>
      {webhook.inherited && (
        <p className='rounded-lg border border-border bg-muted p-3 text-xs leading-relaxed text-muted-foreground'>
          Sub-merchant chưa có cấu hình riêng nên IPN đang gửi theo cấu hình của
          Master. Sau lần lưu đầu tiên, Sub dùng cấu hình riêng và không lùi về
          Master nữa, kể cả khi tắt.
        </p>
      )}
      <dl className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Field label='URL nhận IPN'>
          {webhook.url ? (
            <span className='font-mono'>{webhook.url}</span>
          ) : (
            'Chưa cấu hình'
          )}
        </Field>
        <Field label='Trạng thái'>
          <TagComponent color={webhook.enabled ? 'success' : 'default'}>
            {webhook.enabled ? 'Đang bật' : 'Đang tắt'}
          </TagComponent>
        </Field>
        <Field label='Nguồn cấu hình'>{source}</Field>
        <Field label='Cập nhật lần cuối'>
          {webhook.updatedAt
            ? formatUTCToLocalDateTime(webhook.updatedAt)
            : 'Chưa có'}
        </Field>
      </dl>
    </div>
  )
}
