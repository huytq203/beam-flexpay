import { useState } from 'react'
import { useGetWebhookDeliveriesQuery } from '@/app/services/merchantWebhookApi'
import { ButtonComponent, Table } from '@components/index'
import { createWebhookDeliveryColumns } from '../columns/webhookDelivery.columns'

const PAGE_SIZE = 20

/** `page` của API bắt đầu từ 0; lịch sử chỉ giữ khoảng 30 ngày và chưa lọc theo Sub. */
export function WebhookDeliveries({ merchantId }: { merchantId: string }) {
  const [page, setPage] = useState(0)
  const query = useGetWebhookDeliveriesQuery({
    merchantId,
    page,
    size: PAGE_SIZE
  })

  return (
    <div className='space-y-2'>
      <p className='text-xs text-muted-foreground'>
        Mỗi dòng là một sự kiện, hiển thị kết quả lần gửi gần nhất. Bao gồm đơn
        của mọi Sub thuộc Master, lưu khoảng 30 ngày. Nếu toàn &quot;Chờ
        gửi&quot;, kiểm tra worker gửi IPN đã bật ở môi trường này chưa.
      </p>
      {query.isError && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 text-sm text-danger-strong'
        >
          Không thể tải lịch sử gửi.
          <ButtonComponent
            type='default'
            size='small'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      <Table
        rowKey='eventId'
        size='small'
        loading={query.isFetching}
        onRefresh={query.refetch}
        dataSource={query.data?.content ?? []}
        locale={{ emptyText: 'Chưa có sự kiện gửi IPN nào' }}
        pagination={{
          current: page + 1,
          pageSize: PAGE_SIZE,
          total: query.data?.totalElements ?? 0,
          showSizeChanger: false,
          onChange: (next) => setPage(next - 1)
        }}
        columns={createWebhookDeliveryColumns(page, PAGE_SIZE)}
      />
    </div>
  )
}
