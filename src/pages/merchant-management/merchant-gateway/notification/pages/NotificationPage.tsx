import { useState } from 'react'
import {
  useGetGatewayMerchantsQuery,
  useGetGatewayNotificationConfigQuery
} from '@/app/services/merchantGatewayApi'
import { BroadcastIcon } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  SelectComponent
} from '@components/index'
import { NotificationConfigForm } from '../components/NotificationConfigForm'

const NotificationPage = () => {
  const [merchantId, setMerchantId] = useState<string>()
  const merchants = useGetGatewayMerchantsQuery({ page: 1, size: 100 })
  const query = useGetGatewayNotificationConfigQuery(merchantId ?? '', {
    skip: !merchantId
  })

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='max-w-xl'>
          <label className='mb-1 block text-sm font-medium'>Merchant</label>
          <SelectComponent
            aria-label='Chọn Merchant'
            className='w-full'
            showSearch
            optionFilterProp='label'
            placeholder='Chọn Merchant để xem cấu hình'
            value={merchantId}
            onChange={setMerchantId}
            options={(merchants.data?.content ?? []).map((item) => ({
              label: `${item.code} — ${item.name}`,
              value: item.id
            }))}
          />
        </div>
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <h1 className='flex items-center gap-2 text-base font-semibold'>
            <BroadcastIcon aria-hidden /> Cấu hình thông báo
          </h1>
          {merchantId && (
            <ButtonComponent
              size='small'
              type='default'
              content='Làm mới'
              loading={query.isFetching}
              onClick={() => void query.refetch()}
            />
          )}
        </div>
        {!merchantId && (
          <p className='text-sm text-muted-foreground'>
            Chọn Merchant để xem và chỉnh sửa thông báo.
          </p>
        )}
        {merchantId && query.isLoading && (
          <p
            role='status'
            className='text-sm text-muted-foreground'
          >
            Đang tải cấu hình…
          </p>
        )}
        {merchantId && query.isError && (
          <div
            role='alert'
            className='text-sm text-danger-strong'
          >
            Không thể tải cấu hình thông báo.
          </div>
        )}
        {merchantId && query.data && (
          <NotificationConfigForm
            key={`${merchantId}:${query.fulfilledTimeStamp}`}
            merchantId={merchantId}
            config={query.data}
          />
        )}
      </CardComponent>
    </main>
  )
}

export default NotificationPage
