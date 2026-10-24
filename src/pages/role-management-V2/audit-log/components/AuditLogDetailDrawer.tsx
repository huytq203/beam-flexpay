import { useGetAuditLogByIdQuery } from '@/app/services/auditLogApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, DrawerComponent } from '@components/index'
import type { AuditLogRecord } from '../types/auditLog.types'
import {
  actorTypeLabel,
  entityLabel,
  formatOccurredAt
} from '../utils/auditLog.utils'
import { AuditDataDiff } from './AuditDataDiff'
import { AuditLogActionTag } from './AuditLogActionTag'

interface Props {
  auditId: string
  onClose: () => void
}

function Field({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='min-w-0'>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='break-words text-sm text-foreground'>{children}</dd>
    </div>
  )
}

const dash = (value: string | null) => value || '—'

function AuditLogInfo({ record }: { record: AuditLogRecord }) {
  return (
    <div className='space-y-5'>
      <dl className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Field label='Thời gian'>{formatOccurredAt(record.occurredAt)}</Field>
        <Field label='Hành động'>
          <AuditLogActionTag action={record.action} />
        </Field>
        <Field label='Đối tượng'>
          {entityLabel(record.entityName)}
          {entityLabel(record.entityName) !== record.entityName && (
            <span className='block font-mono text-xs text-muted-foreground'>
              {record.entityName}
            </span>
          )}
        </Field>
        <Field label='Mã đối tượng'>
          <span className='font-mono text-xs'>{dash(record.entityId)}</span>
        </Field>
        <Field label='Lý do'>{dash(record.reason)}</Field>
        <Field label='Loại người thực hiện'>
          {actorTypeLabel(record.actorType)}
        </Field>
        <Field label='Tài khoản thực hiện'>{dash(record.actorUsername)}</Field>
        <Field label='ID người thực hiện'>
          <span className='font-mono text-xs'>{dash(record.actorId)}</span>
        </Field>
        <Field label='Địa chỉ IP'>{dash(record.ipAddress)}</Field>
        <Field label='Nguồn'>{dash(record.source)}</Field>
        <Field label='Request ID'>
          <span className='font-mono text-xs'>{dash(record.requestId)}</span>
        </Field>
      </dl>
      <section>
        <h3 className='mb-2 text-sm font-semibold text-foreground'>
          Dữ liệu thay đổi
        </h3>
        <AuditDataDiff
          oldData={record.oldData}
          newData={record.newData}
        />
      </section>
    </div>
  )
}

export function AuditLogDetailDrawer({ auditId, onClose }: Props) {
  const { data, isFetching, isError, error, refetch } =
    useGetAuditLogByIdQuery(auditId)
  // BE trả 200 với data null khi id không tồn tại; không coi đó là lỗi mạng.
  const record = data?.id === auditId ? data : undefined
  const notFound = !isFetching && !isError && data === null

  return (
    <DrawerComponent
      open
      width='min(100vw, 760px)'
      title='Chi tiết nhật ký'
      onClose={onClose}
      loading={isFetching && !record}
      destroyOnHidden
    >
      {isError && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 text-sm text-danger-strong'
        >
          {getApiErrorDetail(error, 'Không thể tải chi tiết nhật ký.')}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void refetch()}
          />
        </div>
      )}
      {notFound && (
        <p
          role='alert'
          className='text-sm text-muted-foreground'
        >
          Không tìm thấy bản ghi nhật ký.
        </p>
      )}
      {record && <AuditLogInfo record={record} />}
    </DrawerComponent>
  )
}
