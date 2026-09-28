import { useState } from 'react'
import { Can } from '@/app/permissions'
import type { NotificationListItem } from '@/app/services/merchantNotificationApi'
import { BroadcastIcon, PlusOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  ExportCsvButton,
  Table
} from '@components/index'
import { createNotificationColumns } from '../columns/notification.columns'
import { NotificationEditorDialog } from '../components/NotificationEditorDialog'
import { NotificationFilters } from '../components/NotificationFilters'
import { NotificationInheritDialog } from '../components/NotificationInheritDialog'
import { NOTIFICATION_EXPORT_LIMIT } from '../constants/notification.constants'
import type { NotificationEditorTarget } from '../hooks/useNotificationEditor'
import { useNotificationList } from '../hooks/useNotificationList'

const NotificationPage = () => {
  const list = useNotificationList()
  const { query } = list
  const total = query.data?.totalElements ?? 0
  const [editing, setEditing] = useState<NotificationEditorTarget | null>(null)
  const [inheriting, setInheriting] = useState<NotificationListItem | null>(
    null
  )

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <NotificationFilters
          draft={list.draft}
          onChange={list.setDraft}
          onApply={list.apply}
          onReset={list.reset}
        />
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <h1 className='flex items-center gap-2 text-base font-semibold'>
            <BroadcastIcon aria-hidden /> Cấu hình thông báo
          </h1>
          <div className='flex flex-wrap gap-2'>
            <ExportCsvButton
              onExport={list.exportCsv}
              loading={list.isExporting}
              disabled={total === 0 || total > NOTIFICATION_EXPORT_LIMIT}
              tooltip={
                total > NOTIFICATION_EXPORT_LIMIT
                  ? `Tối đa ${NOTIFICATION_EXPORT_LIMIT.toLocaleString('vi-VN')} dòng mỗi lần xuất. Hãy thu hẹp bộ lọc.`
                  : undefined
              }
            />
            <Can
              screen='MERCHANT_NOTIFICATION'
              action='create'
            >
              <ButtonComponent
                content='Thêm cấu hình'
                icon={<PlusOutlined aria-hidden />}
                onClick={() => setEditing({ mode: 'create' })}
              />
            </Can>
          </div>
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải cấu hình thông báo.
            <ButtonComponent
              size='small'
              type='default'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<NotificationListItem>
          rowKey={(row) => `${row.merchantId}:${row.subMerchantId ?? 'master'}`}
          size='small'
          loading={query.isFetching}
          onRefresh={query.refetch}
          dataSource={query.data?.content ?? []}
          scroll={{ x: 1100 }}
          pagination={{
            current: list.page,
            pageSize: list.size,
            total,
            showSizeChanger: true,
            onChange: list.changePage
          }}
          columns={createNotificationColumns({
            page: list.page,
            size: list.size,
            onEdit: (row) => setEditing({ mode: 'edit', row }),
            onSetup: (row) => setEditing({ mode: 'setup', row }),
            onInherit: setInheriting
          })}
        />
      </CardComponent>
      {editing && (
        <NotificationEditorDialog
          target={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {inheriting && (
        <NotificationInheritDialog
          row={inheriting}
          onClose={() => setInheriting(null)}
        />
      )}
    </main>
  )
}

export default NotificationPage
