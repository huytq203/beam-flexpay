import {
  MANAGE_MATRIX_FUNCTION,
  REASON_MAX_LENGTH
} from '../constants/rolePermissionMatrix.constants'
import type {
  AdminAccessScope,
  AdminAccessType,
  AdminRole,
  AdminRolePermissionMatrix,
  AdminRolePermissionUpdateBody,
  DraftCell,
  RoleDraft
} from '../types/rolePermissionMatrix.types'
import { findCell } from './matrixGroups.utils'

const NOT_GRANTED: DraftCell = { accessType: null, scope: 'ALL' }

/** Trạng thái hiện tại của một cột (vai trò) làm điểm xuất phát để soạn. */
export const toDraft = (
  matrix: AdminRolePermissionMatrix,
  role: AdminRole
): RoleDraft => {
  const draft: RoleDraft = {}
  for (const row of matrix.functions) {
    const cell = findCell(row, role)
    draft[row.code] =
      cell?.granted && cell.accessType
        ? { accessType: cell.accessType, scope: cell.scope ?? 'ALL' }
        : { ...NOT_GRANTED }
  }
  return draft
}

export const isSameCell = (a: DraftCell, b: DraftCell): boolean =>
  a.accessType === b.accessType &&
  (a.accessType === null || a.scope === b.scope)

/** Mã chức năng có ô khác so với bản gốc. */
export const changedFunctions = (
  original: RoleDraft,
  draft: RoleDraft
): string[] =>
  Object.keys(draft).filter(
    (code) => !isSameCell(original[code] ?? NOT_GRANTED, draft[code])
  )

export const setAccessType = (
  draft: RoleDraft,
  code: string,
  accessType: AdminAccessType | null
): RoleDraft => ({
  ...draft,
  [code]: {
    accessType,
    // Ô "Không" không mang phạm vi; đặt lại ALL để lần cấp sau bắt đầu từ mặc định.
    scope: accessType === null ? 'ALL' : (draft[code]?.scope ?? 'ALL')
  }
})

export const setScope = (
  draft: RoleDraft,
  code: string,
  scope: AdminAccessScope
): RoleDraft => ({
  ...draft,
  [code]: { accessType: draft[code]?.accessType ?? null, scope }
})

/**
 * PUT ghi đè toàn bộ quyền của vai trò: gửi đủ mọi ô đang cấp (kể cả ô không đổi),
 * bỏ ô "Không". Mỗi chức năng chỉ xuất hiện một lần vì lấy từ danh sách dòng của BE.
 */
export const buildUpdateBody = (
  matrix: AdminRolePermissionMatrix,
  draft: RoleDraft,
  reason: string
): AdminRolePermissionUpdateBody => ({
  reason: reason.trim(),
  permissions: matrix.functions.flatMap((row) => {
    const cell = draft[row.code]
    return cell?.accessType
      ? [{ function: row.code, accessType: cell.accessType, scope: cell.scope }]
      : []
  })
})

/** Lý do bắt buộc, tối đa 255 ký tự (chặn từ FE vì BE trả 500 ở một số đường). */
export const validateReason = (value: string): string => {
  const reason = value.trim()
  if (!reason) return 'Lý do không được để trống'
  if (reason.length > REASON_MAX_LENGTH)
    return `Lý do không được vượt quá ${REASON_MAX_LENGTH} ký tự`
  return ''
}

/** Bản lưu sẽ gỡ dòng quản trị ma trận khỏi vai trò đang có dòng đó. */
export const removesManageRow = (
  original: RoleDraft,
  draft: RoleDraft
): boolean =>
  original[MANAGE_MATRIX_FUNCTION]?.accessType != null &&
  draft[MANAGE_MATRIX_FUNCTION]?.accessType == null
