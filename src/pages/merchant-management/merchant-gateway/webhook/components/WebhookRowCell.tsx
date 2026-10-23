import { useGetMerchantWebhookQuery } from '@/app/services/merchantWebhookApi'
import { TagComponent } from '@components/index'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'

interface WebhookRowCellProps {
  merchantId: string
  field: 'url' | 'status' | 'updatedAt'
}

/**
 * BE chưa có API danh sách webhook nên mỗi dòng tự đọc cấu hình của Master đó
 * (RTK Query gộp các lời gọi trùng). Đổi sang API danh sách khi BE có.
 */
export function WebhookRowCell({ merchantId, field }: WebhookRowCellProps) {
  const query = useGetMerchantWebhookQuery({ merchantId })
  if (query.isLoading) return <span className='text-muted-foreground'>…</span>
  if (query.isError || !query.data)
    return <span className='text-xs text-danger-strong'>Không tải được</span>
  const webhook = query.data

  if (field === 'url')
    return webhook.url ? (
      <span
        className='block max-w-[320px] truncate font-mono text-xs'
        title={webhook.url}
      >
        {webhook.url}
      </span>
    ) : (
      <span className='text-muted-foreground'>Chưa cấu hình</span>
    )
  if (field === 'status')
    return !webhook.url ? (
      <TagComponent color='default'>Chưa cấu hình</TagComponent>
    ) : (
      <TagComponent color={webhook.enabled ? 'success' : 'warning'}>
        {webhook.enabled ? 'Đang bật' : 'Đang tắt'}
      </TagComponent>
    )
  return webhook.updatedAt ? (
    <>{formatUTCToLocalDateTime(webhook.updatedAt)}</>
  ) : (
    <>—</>
  )
}
