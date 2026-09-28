import { useState } from 'react'
import {
  useCreateMerchantNotificationMutation,
  usePatchMerchantNotificationMutation,
  type NotificationListItem
} from '@/app/services/merchantNotificationApi'
import { feedback, type PickedEntity } from '@components/index'
import {
  diffFields,
  omitEmptyEmails,
  toDraft,
  toFields,
  validateDraft,
  type NotificationDraft,
  type NotificationDraftErrors
} from '../utils/notification.utils'

/**
 * create: chọn phạm vi tự do · setup: tạo cấu hình riêng cho phạm vi chưa có
 * (form điền sẵn giá trị đang hiệu lực) · edit: PATCH cấu hình đã có.
 */
export type NotificationEditorTarget =
  | { mode: 'create' }
  | { mode: 'setup'; row: NotificationListItem }
  | { mode: 'edit'; row: NotificationListItem }

export interface NotificationScopeDraft {
  master?: PickedEntity
  sub?: PickedEntity
}

// Sửa/thiết lập khóa phạm vi theo dòng đang chọn nên chỉ cần id để gửi lên.
const scopeOf = (target: NotificationEditorTarget): NotificationScopeDraft => {
  if (target.mode === 'create') return {}
  const { row } = target
  const toEntity = (id: string) => ({
    id,
    code: row.merchantCode,
    name: row.merchantName
  })
  return {
    master: toEntity(row.merchantId),
    sub: row.subMerchantId ? toEntity(row.subMerchantId) : undefined
  }
}

export const useNotificationEditor = (
  target: NotificationEditorTarget,
  onDone: () => void
) => {
  const row = target.mode === 'create' ? undefined : target.row
  const [draft, setDraft] = useState<NotificationDraft>(() => toDraft(row))
  const [scope, setScope] = useState(() => scopeOf(target))
  const [errors, setErrors] = useState<NotificationDraftErrors>({})
  const [create, createState] = useCreateMerchantNotificationMutation()
  const [patch, patchState] = usePatchMerchantNotificationMutation()
  const fields = toFields(draft)
  const changes = target.mode === 'edit' ? diffFields(target.row, fields) : {}

  const save = async () => {
    const nextErrors = validateDraft(draft, target.mode === 'edit')
    setErrors(nextErrors)
    if (!scope.master) {
      feedback.warning('Vui lòng chọn Merchant áp dụng')
      return
    }
    if (Object.values(nextErrors).some(Boolean)) return
    if (target.mode === 'edit' && Object.keys(changes).length === 0) {
      feedback.warning('Chưa có thay đổi nào để lưu')
      return
    }
    try {
      if (target.mode === 'edit') {
        await patch({
          configId: target.row.configId ?? '',
          version: target.row.version ?? 0,
          reason: draft.reason.trim(),
          ...changes
        }).unwrap()
      } else {
        await create({
          masterMerchantId: scope.master.id,
          subMerchantId: scope.sub?.id,
          reason: draft.reason.trim() || undefined,
          ...omitEmptyEmails(fields),
          transactionNotificationEnabled: fields.transactionNotificationEnabled,
          active: fields.active
        }).unwrap()
      }
      feedback.success(
        target.mode === 'edit'
          ? 'Đã cập nhật cấu hình thông báo'
          : 'Đã tạo cấu hình thông báo'
      )
      onDone()
    } catch {
      feedback.error('Không thể lưu cấu hình thông báo')
    }
  }

  return {
    draft,
    scope,
    errors,
    changes,
    isSaving: createState.isLoading || patchState.isLoading,
    patchDraft: (value: Partial<NotificationDraft>) => {
      setDraft((current) => ({ ...current, ...value }))
      setErrors((current) => ({
        ...current,
        ...Object.fromEntries(Object.keys(value).map((key) => [key, undefined]))
      }))
    },
    setScope,
    save
  }
}
