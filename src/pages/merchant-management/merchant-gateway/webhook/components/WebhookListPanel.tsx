import { Can } from '@/app/permissions'
import type { WebhookListRow } from '@/app/services/merchantWebhookApi'
import {
  ButtonComponent,
  CardComponent,
  ExportCsvButton,
  Table
} from '@components/index'
import { createWebhookListColumns } from '../columns/webhookList.columns'
import { useWebhookList } from '../hooks/useWebhookList'
import { WebhookListFilters } from './WebhookListFilters'

interface WebhookListPanelProps {
  onOpen: (row: WebhookListRow) => void
}

export function WebhookListPanel({ onOpen }: WebhookListPanelProps) {
  const list = useWebhookList()
  const { query, page, pageSize } = list

  return (
    <>
      <CardComponent className='border border-border bg-background shadow-none'>
        <WebhookListFilters
          draft={list.draft}
          onChange={list.setDraft}
          onApply={list.apply}
          onReset={list.reset}
        />
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <div>
            <h1 className='text-base font-semibold text-foreground'>
              Webhook (IPN) theo Merchant và Sub-merchant
            </h1>
            <p className='mt-1 text-xs text-muted-foreground'>
              {query.data?.totalElements ?? 0} dòng · Sub-merchant chưa có cấu
              hình riêng hiển thị URL kế thừa của Master. Mở chi tiết để sửa,
              xóa cấu hình riêng của Sub và xem lịch sử gửi.
            </p>
          </div>
          <Can
            screen='MERCHANT_WEBHOOK'
            action='export'
          >
            <ExportCsvButton
              onExport={list.exportCsv}
              loading={list.isExporting}
              disabled={!query.data?.totalElements}
            />
          </Can>
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải danh sách webhook.
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<WebhookListRow>
          rowKey={(row) => `${row.merchantId}:${row.subMerchantId ?? ''}`}
          size='small'
          loading={query.isFetching}
          onRefresh={query.refetch}
          dataSource={query.data?.content ?? []}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize,
            total: query.data?.totalElements ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [20, 50, 100],
            onChange: list.paginate
          }}
          columns={createWebhookListColumns(page, pageSize, onOpen)}
        />
      </CardComponent>
    </>
  )
}
