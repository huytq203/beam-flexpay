import { useState } from 'react'
import { Can } from '@/app/permissions'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, ExportCsvButton, Table } from '@components/index'
import { AccessPageShell } from '@/pages/merchant-management/merchant-access/components/AccessPageShell'
import { createAuditLogColumns } from '../columns/auditLog.columns'
import { AuditLogDetailDrawer } from '../components/AuditLogDetailDrawer'
import { AuditLogFilters } from '../components/AuditLogFilters'
import {
  AUDIT_EXPORT_LIMIT,
  AUDIT_EXPORT_OVER_LIMIT_HINT,
  AUDIT_PAGE_SIZE_OPTIONS
} from '../constants/auditLog.constants'
import { useAuditLogExport } from '../hooks/useAuditLogExport'
import { useAuditLogList } from '../hooks/useAuditLogList'
import type { AuditLogRecord } from '../types/auditLog.types'

export default function AuditLogPage() {
  const data = useAuditLogList()
  const { query } = data
  const { exportCsv, isExporting } = useAuditLogExport(data.filterQuery)
  const [detailId, setDetailId] = useState<string | null>(null)
  const overLimit = data.total > AUDIT_EXPORT_LIMIT

  return (
    <>
      <AccessPageShell
        title='Nhật ký hệ thống'
        count={query.data?.totalElements}
        actions={
          <Can
            screen='AUDIT_LOG'
            action='export'
          >
            <ExportCsvButton
              onExport={exportCsv}
              loading={isExporting}
              disabled={data.total === 0 || overLimit}
              tooltip={overLimit ? AUDIT_EXPORT_OVER_LIMIT_HINT : undefined}
              label='Xuất Excel'
            />
          </Can>
        }
        toolbar={
          <AuditLogFilters
            draft={data.draft}
            errors={data.errors}
            onChange={data.setDraft}
            onApply={data.apply}
            onReset={data.reset}
          />
        }
      >
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
          >
            {getApiErrorDetail(query.error, 'Không thể tải nhật ký hệ thống.')}
            <ButtonComponent
              size='small'
              type='default'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<AuditLogRecord>
          columns={createAuditLogColumns({
            page: data.page,
            pageSize: data.pageSize,
            onView: (record) => setDetailId(record.id)
          })}
          dataSource={[...data.records]}
          loading={query.isFetching}
          locale={{ emptyText: 'Không có bản ghi nhật ký nào' }}
          onRefresh={query.refetch}
          pagination={{
            current: data.page,
            pageSize: data.pageSize,
            total: data.total,
            showSizeChanger: true,
            pageSizeOptions: AUDIT_PAGE_SIZE_OPTIONS,
            onChange: (page, size) => data.setPagination(page, size)
          }}
          rowKey='id'
          scroll={{ x: 'max-content' }}
          size='small'
        />
        <p className='mt-2 text-xs text-muted-foreground'>
          * File xuất gồm toàn bộ bản ghi khớp bộ lọc, sắp theo thời gian giảm
          dần, tối đa 50.000 dòng và không kèm dữ liệu trước/sau.
        </p>
      </AccessPageShell>
      {detailId && (
        <AuditLogDetailDrawer
          auditId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  )
}
