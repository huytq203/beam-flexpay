import { useState } from 'react'
import {
  useGetGatewayMerchantsQuery,
  type GatewayMerchant
} from '@/app/services/merchantGatewayApi'
import { ButtonComponent, CardComponent, Input, Table } from '@components/index'
import { createWebhookMerchantColumns } from '../columns/webhookMerchant.columns'

const PAGE_SIZE = 10

interface WebhookListPanelProps {
  onOpen: (merchant: GatewayMerchant) => void
}

export function WebhookListPanel({ onOpen }: WebhookListPanelProps) {
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState({ name: '', code: '' })
  const [applied, setApplied] = useState({ name: '', code: '' })
  const query = useGetGatewayMerchantsQuery({
    page,
    size: PAGE_SIZE,
    name: applied.name.trim() || undefined,
    code: applied.code.trim() || undefined
  })

  const apply = () => {
    setPage(1)
    setApplied(draft)
  }
  const reset = () => {
    setPage(1)
    setDraft({ name: '', code: '' })
    setApplied({ name: '', code: '' })
  }

  return (
    <>
      <CardComponent className='border border-border bg-background shadow-none'>
        <form
          className='grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]'
          onSubmit={(event) => {
            event.preventDefault()
            apply()
          }}
        >
          <Input
            aria-label='Tên Merchant'
            placeholder='Tìm theo tên Merchant'
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
          />
          <Input
            aria-label='Mã Merchant'
            placeholder='Tìm theo mã Merchant'
            value={draft.code}
            onChange={(event) =>
              setDraft({ ...draft, code: event.target.value })
            }
          />
          <div className='flex gap-2'>
            <ButtonComponent
              type='default'
              htmlType='button'
              content='Xóa bộ lọc'
              onClick={reset}
            />
            <ButtonComponent
              htmlType='submit'
              content='Tìm kiếm'
            />
          </div>
        </form>
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 border-b border-border pb-3'>
          <h1 className='text-base font-semibold text-foreground'>
            Webhook (IPN) theo Merchant
          </h1>
          <p className='mt-1 text-xs text-muted-foreground'>
            {query.data?.totalElements ?? 0} merchant · Cấu hình đọc riêng cho
            từng Master trong trang. Mở chi tiết để sửa, xem Sub và lịch sử gửi.
          </p>
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải danh sách merchant.
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<GatewayMerchant>
          rowKey='id'
          size='small'
          loading={query.isFetching}
          onRefresh={query.refetch}
          dataSource={query.data?.content ?? []}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: query.data?.totalElements ?? 0,
            showSizeChanger: false,
            onChange: setPage
          }}
          columns={createWebhookMerchantColumns(page, PAGE_SIZE, onOpen)}
        />
      </CardComponent>
    </>
  )
}
