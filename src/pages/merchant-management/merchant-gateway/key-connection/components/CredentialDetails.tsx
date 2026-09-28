import type { ApiCredential } from '@/app/services/merchantGatewayApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'

const dateLabel = (value?: string | null) =>
  value ? formatUTCToLocalDateTime(value) : 'Chưa có'

function DetailItem({
  label,
  value
}: {
  label: string
  value: string | number
}) {
  return (
    <div className='min-w-0'>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='mt-1 break-words text-sm text-foreground'>{value}</dd>
    </div>
  )
}

export function CredentialDetails({
  credential
}: {
  credential: ApiCredential
}) {
  return (
    <div className='grid gap-5 py-2 md:grid-cols-3'>
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-secondary-foreground'>
          Định danh & truy cập
        </h3>
        <dl className='space-y-3'>
          <DetailItem
            label='ID key'
            value={credential.id}
          />
          <DetailItem
            label='ID Master Merchant'
            value={credential.merchantId}
          />
          <DetailItem
            label='Phiên bản secret'
            value={`v${credential.version ?? 1}`}
          />
          <DetailItem
            label='IP Whitelist'
            value={
              credential.ipWhitelist?.length
                ? credential.ipWhitelist.join(', ')
                : 'Không giới hạn IP'
            }
          />
        </dl>
      </section>
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-secondary-foreground'>
          Thời hạn & sử dụng
        </h3>
        <dl className='space-y-3'>
          <DetailItem
            label='Ngày tạo'
            value={dateLabel(credential.createdAt)}
          />
          <DetailItem
            label='Cập nhật lần cuối'
            value={dateLabel(credential.updatedAt)}
          />
          <DetailItem
            label='Hết hạn'
            value={
              credential.expiresAt
                ? dateLabel(credential.expiresAt)
                : 'Không đặt hạn'
            }
          />
          <DetailItem
            label='Lần sử dụng gần nhất'
            value={dateLabel(credential.lastUsedAt)}
          />
        </dl>
      </section>
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-secondary-foreground'>
          Lịch sử bảo mật
        </h3>
        <dl className='space-y-3'>
          <DetailItem
            label='Xoay key lần cuối'
            value={dateLabel(credential.rotatedAt)}
          />
          <DetailItem
            label='Secret cũ còn hiệu lực đến'
            value={dateLabel(credential.previousSecretExpiresAt)}
          />
          <DetailItem
            label='Thu hồi lúc'
            value={dateLabel(credential.revokedAt)}
          />
          <DetailItem
            label='Người thu hồi'
            value={credential.revokedBy || 'Chưa có'}
          />
          {credential.revokeReason && (
            <DetailItem
              label='Lý do thu hồi'
              value={credential.revokeReason}
            />
          )}
        </dl>
      </section>
    </div>
  )
}
