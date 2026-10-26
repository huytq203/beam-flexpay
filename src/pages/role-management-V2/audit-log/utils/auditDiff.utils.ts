import { formatAuditJson } from '@/pages/merchant-management/merchant-management/merchant/utils/auditData.utils'
import type { AuditDiff, AuditDiffRow } from '../types/auditLog.types'

type JsonObject = Record<string, unknown>

type Parsed = { ok: true; value: unknown } | { ok: false }

const parse = (raw: string | null): Parsed => {
  if (raw === null || raw.trim() === '') return { ok: true, value: null }
  try {
    return { ok: true, value: JSON.parse(raw) as unknown }
  } catch {
    return { ok: false }
  }
}

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const show = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value)

const rowOf = (
  key: string,
  before: JsonObject | null,
  after: JsonObject | null
): AuditDiffRow => {
  const oldValue = before && key in before ? show(before[key]) : null
  const newValue = after && key in after ? show(after[key]) : null
  return { key, oldValue, newValue, changed: oldValue !== newValue }
}

/**
 * `oldData`/`newData` là chuỗi JSON có cấu trúc tuỳ `entityName`. Chỉ khi cả
 * hai (hoặc phía còn lại là null) là object mới dựng được bảng từng trường;
 * mảng, giá trị đơn hay chuỗi không phải JSON thì giữ nguyên để người xem tự đọc.
 */
export const buildAuditDiff = (
  oldData: string | null,
  newData: string | null
): AuditDiff => {
  const before = parse(oldData)
  const after = parse(newData)
  const raw: AuditDiff = {
    kind: 'raw',
    oldText: oldData?.trim() ? formatAuditJson(oldData) : null,
    newText: newData?.trim() ? formatAuditJson(newData) : null
  }
  if (!before.ok || !after.ok) return raw
  const oldObject = isObject(before.value) ? before.value : null
  const newObject = isObject(after.value) ? after.value : null
  const comparable =
    (oldObject || before.value === null) && (newObject || after.value === null)
  if (!comparable || (!oldObject && !newObject)) return raw
  const keys = [
    ...new Set([
      ...Object.keys(oldObject ?? {}),
      ...Object.keys(newObject ?? {})
    ])
  ]
  return {
    kind: 'rows',
    rows: keys.map((key) => rowOf(key, oldObject, newObject))
  }
}
