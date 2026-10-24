import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTOR_TYPE_LABELS,
  AUDIT_API_TIME_FORMAT,
  AUDIT_DISPLAY_TIME_FORMAT,
  AUDIT_ENTITY_LABELS,
  AUDIT_UUID_PATTERN,
  type AuditFilterKey
} from '../constants/auditLog.constants'
import type {
  AuditLogAction,
  AuditLogFilterErrors,
  AuditLogFilterQuery,
  AuditLogFilters
} from '../types/auditLog.types'

dayjs.extend(customParseFormat)

type RawFilters = Partial<Record<AuditFilterKey, string>>

const isAction = (value?: string): value is AuditLogAction =>
  value !== undefined && value in AUDIT_ACTION_LABELS

const isApiTime = (value?: string): value is string =>
  Boolean(value) && dayjs(value, AUDIT_API_TIME_FORMAT, true).isValid()

export const toApiTime = (value: dayjs.Dayjs): string =>
  value.format(AUDIT_API_TIME_FORMAT)

export const fromApiTime = (value?: string): dayjs.Dayjs | undefined =>
  isApiTime(value) ? dayjs(value, AUDIT_API_TIME_FORMAT, true) : undefined

/** Giá trị lạ trên URL bị bỏ: BE trả 400/500 với enum, UUID hoặc ngày-giờ sai kiểu. */
export const fromUrlFilters = (raw: RawFilters): AuditLogFilters => ({
  actorUsername: raw.actorUsername ?? '',
  actorId: raw.actorId ?? '',
  action: isAction(raw.action) ? raw.action : undefined,
  entityName: raw.entityName ?? '',
  entityId: raw.entityId ?? '',
  occurredFrom: isApiTime(raw.occurredFrom) ? raw.occurredFrom : undefined,
  occurredTo: isApiTime(raw.occurredTo) ? raw.occurredTo : undefined
})

export const toUrlFilters = (
  filters: AuditLogFilters
): Record<AuditFilterKey, string | undefined> => ({
  actorUsername: filters.actorUsername.trim() || undefined,
  actorId: filters.actorId.trim() || undefined,
  action: filters.action,
  entityName: filters.entityName.trim() || undefined,
  entityId: filters.entityId.trim() || undefined,
  occurredFrom: filters.occurredFrom,
  occurredTo: filters.occurredTo
})

/** Query gửi BE: bỏ chuỗi rỗng để không lọc nhầm; dùng chung cho danh sách và xuất file. */
export const toFilterQuery = (
  filters: AuditLogFilters
): AuditLogFilterQuery => {
  const url = toUrlFilters(filters)
  return {
    actorUsername: url.actorUsername,
    actorId: url.actorId,
    action: filters.action,
    entityName: url.entityName,
    entityId: url.entityId,
    occurredFrom: url.occurredFrom,
    occurredTo: url.occurredTo
  }
}

/** Chặn trước các giá trị BE trả 500/400: UUID sai định dạng, từ-ngày sau đến-ngày. */
export const validateFilters = (
  filters: AuditLogFilters
): AuditLogFilterErrors => {
  const errors: AuditLogFilterErrors = {}
  const actorId = filters.actorId.trim()
  const entityId = filters.entityId.trim()
  if (actorId && !AUDIT_UUID_PATTERN.test(actorId))
    errors.actorId = 'ID người thực hiện phải là UUID hợp lệ.'
  if (entityId && !AUDIT_UUID_PATTERN.test(entityId))
    errors.entityId = 'Mã đối tượng phải là UUID hợp lệ.'
  const from = fromApiTime(filters.occurredFrom)
  const to = fromApiTime(filters.occurredTo)
  if (from && to && from.isAfter(to))
    errors.occurredTo = 'Thời điểm bắt đầu phải trước thời điểm kết thúc.'
  return errors
}

export const hasAnyFilter = (filters: AuditLogFilters): boolean =>
  Object.values(toUrlFilters(filters)).some(Boolean)

export const actionLabel = (action: string): string =>
  AUDIT_ACTION_LABELS[action as AuditLogAction] ?? action

export const entityLabel = (entityName: string): string =>
  AUDIT_ENTITY_LABELS[entityName] ?? entityName

export const actorTypeLabel = (actorType: string | null): string =>
  actorType ? (AUDIT_ACTOR_TYPE_LABELS[actorType] ?? actorType) : '—'

export const formatOccurredAt = (value: string): string => {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format(AUDIT_DISPLAY_TIME_FORMAT) : value
}
