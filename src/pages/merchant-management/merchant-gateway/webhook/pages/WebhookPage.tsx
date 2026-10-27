import { useState } from 'react'
import { Can } from '@/app/permissions'
import { useGetMerchantByIdQuery } from '@/app/services/apiMerchant'
import { useGetMerchantWebhookQuery } from '@/app/services/merchantWebhookApi'
import {
  ButtonComponent,
  CardComponent,
  type PickedEntity
} from '@components/index'
import { WebhookDeliveries } from '../components/WebhookDeliveries'
import { WebhookListPanel } from '../components/WebhookListPanel'
import { WebhookDeleteDialog } from '../components/WebhookDeleteDialog'
import { WebhookEditDialog } from '../components/WebhookEditDialog'
import { WebhookScopeBar } from '../components/WebhookScopeBar'
import { WebhookSummary } from '../components/WebhookSummary'

const WebhookPage = () => {
  const [merchant, setMerchant] = useState<PickedEntity>()
  const [sub, setSub] = useState<PickedEntity>()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const scope = merchant
    ? { merchantId: merchant.id, subMerchantId: sub?.id }
    : undefined
  const webhook = useGetMerchantWebhookQuery(scope ?? { merchantId: '' }, {
    skip: !scope
  })
  const detail = useGetMerchantByIdQuery(merchant?.id ?? '', {
    skip: !merchant
  })
  const isTerminated = detail.data?.status === 'TERMINATED'
  const scopeLabel = sub
    ? `Sub-merchant ${sub.name} (${sub.code})`
    : merchant
      ? `Master ${merchant.name} (${merchant.code})`
      : ''

  if (!merchant)
    return (
      <main className='flex min-w-0 flex-col gap-3'>
        <WebhookListPanel
          onOpen={(row) => {
            setMerchant({
              id: row.merchantId,
              code: row.merchantCode,
              name: row.merchantName
            })
            setSub(
              row.subMerchantId
                ? {
                    id: row.subMerchantId,
                    code: row.subMerchantCode ?? '',
                    name: row.subMerchantName ?? ''
                  }
                : undefined
            )
          }}
        />
      </main>
    )

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <div>
        <ButtonComponent
          type='default'
          htmlType='button'
          size='small'
          content='← Quay lại danh sách'
          onClick={() => {
            setMerchant(undefined)
            setSub(undefined)
          }}
        />
      </div>
      <CardComponent className='border border-border bg-background shadow-none'>
        <WebhookScopeBar
          merchant={merchant}
          sub={sub}
          onMerchantChange={(next) => {
            setMerchant(next)
            setSub(undefined)
          }}
          onSubChange={setSub}
        />
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <div>
            <h1 className='text-base font-semibold text-foreground'>
              Webhook (IPN)
            </h1>
            <p className='mt-1 text-xs text-muted-foreground'>
              {scopeLabel || 'Chọn Merchant để xem cấu hình nhận IPN'}
              {isTerminated &&
                ' · Merchant đã chấm dứt hợp tác, chỉ xem, không sửa được'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {sub && webhook.data && !webhook.data.inherited && (
              <Can
                screen='MERCHANT_WEBHOOK'
                action='delete'
              >
                <ButtonComponent
                  content='Xóa cấu hình riêng'
                  danger
                  type='default'
                  htmlType='button'
                  disabled={isTerminated}
                  onClick={() => setIsDeleting(true)}
                />
              </Can>
            )}
            <Can
              screen='MERCHANT_WEBHOOK'
              action='edit'
            >
              <ButtonComponent
                content='Sửa cấu hình'
                htmlType='button'
                disabled={!webhook.data || isTerminated}
                onClick={() => setIsEditing(true)}
              />
            </Can>
          </div>
        </div>
        {webhook.isError && (
          <div
            role='alert'
            className='flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải cấu hình webhook.
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void webhook.refetch()}
            />
          </div>
        )}
        {webhook.isLoading && (
          <p className='text-sm text-muted-foreground'>Đang tải...</p>
        )}
        {webhook.data && (
          <WebhookSummary
            webhook={webhook.data}
            isSub={Boolean(sub)}
          />
        )}
      </CardComponent>
      {merchant && (
        <CardComponent className='border border-border bg-background shadow-none'>
          <h2 className='mb-3 text-base font-semibold text-foreground'>
            Lịch sử gửi IPN
          </h2>
          <WebhookDeliveries
            key={sub?.id ?? 'master'}
            merchantId={merchant.id}
            subMerchantId={sub?.id}
          />
        </CardComponent>
      )}
      {isDeleting && scope?.subMerchantId && webhook.data && (
        <WebhookDeleteDialog
          merchantId={scope.merchantId}
          subMerchantId={scope.subMerchantId}
          scopeLabel={scopeLabel}
          rowRevision={webhook.data.rowRevision}
          onClose={() => {
            setIsDeleting(false)
            void webhook.refetch()
          }}
        />
      )}
      {isEditing && scope && webhook.data && (
        <WebhookEditDialog
          scope={scope}
          scopeLabel={scopeLabel}
          webhook={webhook.data}
          onClose={() => {
            setIsEditing(false)
            void webhook.refetch()
          }}
        />
      )}
    </main>
  )
}

export default WebhookPage
