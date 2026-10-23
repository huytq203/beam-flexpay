import type { UserInfor } from '@type/userManagement'
import { ASSIGNMENT_REASON_MAX } from '../constants/merchantAssignment.constants'
import type {
  AdminUserOption,
  AssignmentScope
} from '../types/merchantAssignment.types'

/** Họ tên ghép từ firstName/lastName; thiếu thì dùng username để luôn có nhãn. */
export const toAdminUserName = (user: UserInfor): string => {
  const fullName = [user.lastName, user.firstName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
  return fullName || user.username
}

export const toAdminUserOption = (user: UserInfor): AdminUserOption => ({
  id: user.id,
  name: toAdminUserName(user),
  code: user.username,
  email: user.email,
  enabled: user.enabled
})

/**
 * Lý do bắt buộc và tối đa 255 ký tự. DELETE sai ràng buộc này làm BE trả 500
 * thay vì 400 nên FE phải chặn trước khi gọi.
 */
export const validateReason = (value: string): string => {
  const reason = value.trim()
  if (!reason) return 'Lý do không được để trống'
  if (reason.length > ASSIGNMENT_REASON_MAX)
    return `Lý do không được vượt quá ${ASSIGNMENT_REASON_MAX} ký tự`
  return ''
}

interface NamedEntity {
  name: string
  code: string
}

/** Phạm vi Master, dùng chung cho màn gán riêng và các màn danh sách. */
export const toMasterScope = (
  entity: NamedEntity & { id: string }
): AssignmentScope => ({
  level: 'master',
  id: entity.id,
  label: `Master ${entity.name} (${entity.code})`
})

export const toSubScope = (
  entity: NamedEntity & { id: string }
): AssignmentScope => ({
  level: 'sub',
  id: entity.id,
  label: `Sub-merchant ${entity.name} (${entity.code})`
})
