import type { Dayjs } from 'dayjs'
import { DateInput, Input, SelectComponent } from '@components/index'
import { AccessFilterActions } from '@/pages/merchant-management/merchant-access/components/AccessFilterActions'
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_DISPLAY_TIME_FORMAT,
  AUDIT_ENTITY_OPTIONS
} from '../constants/auditLog.constants'
import type {
  AuditLogAction,
  AuditLogFilterErrors,
  AuditLogFilters as AuditLogFilterValues
} from '../types/auditLog.types'
import { fromApiTime, toApiTime } from '../utils/auditLog.utils'

interface Props {
  draft: AuditLogFilterValues
  errors: AuditLogFilterErrors
  onChange: (filters: AuditLogFilterValues) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'
const ENTITY_LIST_ID = 'audit-log-entity-options'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p
      id={id}
      role='alert'
      className='mt-1 text-xs text-danger-strong'
    >
      {message}
    </p>
  )
}

export function AuditLogFilters({
  draft,
  errors,
  onChange,
  onApply,
  onReset
}: Props) {
  const set = (patch: Partial<AuditLogFilterValues>) =>
    onChange({ ...draft, ...patch })
  const time = (value: Dayjs | null) => (value ? toApiTime(value) : undefined)

  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      onReset={onReset}
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <div>
          <label
            className={labelClass}
            htmlFor='audit-filter-actor-username'
          >
            Tài khoản thực hiện
          </label>
          <Input
            id='audit-filter-actor-username'
            allowClear
            placeholder='Chứa chuỗi, không phân biệt hoa thường'
            value={draft.actorUsername}
            onChange={(event) => set({ actorUsername: event.target.value })}
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='audit-filter-actor-id'
          >
            ID người thực hiện
          </label>
          <Input
            id='audit-filter-actor-id'
            allowClear
            status={errors.actorId ? 'error' : undefined}
            placeholder='UUID, khớp chính xác'
            value={draft.actorId}
            onChange={(event) => set({ actorId: event.target.value })}
          />
          <FieldError
            id='audit-actor-id-error'
            message={errors.actorId}
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='audit-filter-action'
          >
            Hành động
          </label>
          <SelectComponent
            id='audit-filter-action'
            allowClear
            className='w-full'
            options={AUDIT_ACTION_OPTIONS}
            placeholder='Tất cả hành động'
            value={draft.action}
            onChange={(action: AuditLogAction | undefined) => set({ action })}
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='audit-filter-entity-name'
          >
            Loại đối tượng
          </label>
          <Input
            id='audit-filter-entity-name'
            allowClear
            list={ENTITY_LIST_ID}
            placeholder='Chọn hoặc nhập đúng giá trị (phân biệt hoa thường)'
            value={draft.entityName}
            onChange={(event) => set({ entityName: event.target.value })}
          />
          <datalist id={ENTITY_LIST_ID}>
            {AUDIT_ENTITY_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </datalist>
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='audit-filter-entity-id'
          >
            Mã đối tượng
          </label>
          <Input
            id='audit-filter-entity-id'
            allowClear
            status={errors.entityId ? 'error' : undefined}
            placeholder='UUID, khớp chính xác'
            value={draft.entityId}
            onChange={(event) => set({ entityId: event.target.value })}
          />
          <FieldError
            id='audit-entity-id-error'
            message={errors.entityId}
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='audit-filter-from'
          >
            Từ thời điểm
          </label>
          <DateInput
            id='audit-filter-from'
            className='w-full'
            showTime
            format={AUDIT_DISPLAY_TIME_FORMAT}
            placeholder='Chọn thời điểm bắt đầu'
            value={fromApiTime(draft.occurredFrom) ?? null}
            onChange={(value: Dayjs | null) =>
              set({ occurredFrom: time(value) })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='audit-filter-to'
          >
            Đến thời điểm
          </label>
          <DateInput
            id='audit-filter-to'
            className='w-full'
            showTime
            status={errors.occurredTo ? 'error' : undefined}
            format={AUDIT_DISPLAY_TIME_FORMAT}
            placeholder='Chọn thời điểm kết thúc'
            value={fromApiTime(draft.occurredTo) ?? null}
            onChange={(value: Dayjs | null) => set({ occurredTo: time(value) })}
          />
          <FieldError
            id='audit-time-error'
            message={errors.occurredTo}
          />
        </div>
      </div>
      <AccessFilterActions />
    </form>
  )
}
