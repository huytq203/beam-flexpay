import { useMemo, useState } from 'react'
import { useUpdateRolePermissionsMutation } from '@/app/services/rolePermissionMatrixApi'
import { feedback } from '@components/index'
import type {
  AdminAccessScope,
  AdminAccessType,
  AdminRole,
  AdminRolePermissionMatrix
} from '../types/rolePermissionMatrix.types'
import { selfLockoutRisk } from '../utils/matrixCaller.utils'
import {
  buildUpdateBody,
  changedFunctions,
  removesManageRow,
  setAccessType,
  setScope,
  toDraft,
  validateReason
} from '../utils/matrixDraft.utils'
import { getMatrixErrorMessage } from '../utils/matrixError.utils'

interface Options {
  /** Ma trận vừa tải lại ngay trước khi mở hộp thoại (BE không có khoá lạc quan). */
  matrix: AdminRolePermissionMatrix
  role: AdminRole
  callerRoles: AdminRole[]
  onDone: () => void
}

/** Soạn lại toàn bộ quyền của một vai trò rồi PUT; giữ hộp thoại mở khi lỗi. */
export function useRoleEditor({ matrix, role, callerRoles, onDone }: Options) {
  const original = useMemo(() => toDraft(matrix, role), [matrix, role])
  const [draft, setDraft] = useState(original)
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [reasonTouched, setReasonTouched] = useState(false)
  const [update, { isLoading }] = useUpdateRolePermissionsMutation()

  const changed = useMemo(
    () => changedFunctions(original, draft),
    [original, draft]
  )
  const risk = removesManageRow(original, draft)
    ? selfLockoutRisk(role, callerRoles)
    : 'none'
  const reasonError = reasonTouched ? validateReason(reason) : ''

  const save = async (): Promise<void> => {
    setReasonTouched(true)
    if (changed.length === 0 || validateReason(reason)) return
    // Gỡ dòng quản trị ma trận khỏi vai trò của chính mình: phải xác nhận thêm một bước.
    if (risk !== 'none' && !confirming) {
      setConfirming(true)
      return
    }
    try {
      await update({
        role,
        body: buildUpdateBody(matrix, draft, reason)
      }).unwrap()
      feedback.success(
        'Đã lưu quyền của vai trò. Cổng phân quyền chưa đổi cho tới khi đồng bộ lên Keycloak.'
      )
      onDone()
    } catch (failure) {
      const detail = getMatrixErrorMessage(
        failure,
        'Không thể lưu quyền của vai trò'
      )
      setConfirming(false)
      setError(detail)
      feedback.error(detail)
    }
  }

  return {
    draft,
    original,
    reason,
    reasonError,
    error,
    confirming,
    isLoading,
    changed,
    risk,
    setReason: (value: string): void => {
      setReason(value)
      setError('')
    },
    setAccessType: (code: string, accessType: AdminAccessType | null): void => {
      setDraft((current) => setAccessType(current, code, accessType))
      setConfirming(false)
    },
    setScope: (code: string, scope: AdminAccessScope): void =>
      setDraft((current) => setScope(current, code, scope)),
    cancelConfirm: (): void => setConfirming(false),
    save
  }
}
