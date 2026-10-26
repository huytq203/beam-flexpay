import { useState } from 'react'
import { useSyncRolePermissionsMutation } from '@/app/services/rolePermissionMatrixApi'
import { feedback } from '@components/index'
import type {
  AdminRole,
  AdminRoleSyncStatus
} from '../types/rolePermissionMatrix.types'
import { validateReason } from '../utils/matrixDraft.utils'
import { getMatrixErrorMessage } from '../utils/matrixError.utils'

/**
 * Đồng bộ chạy trong request và HTTP 200 chưa có nghĩa đã đồng bộ: giữ kết quả
 * để hộp thoại hiển thị `state` và `note` thật của BE, không tự báo thành công.
 */
export function useRoleSync(role: AdminRole) {
  const [sync, { isLoading }] = useSyncRolePermissionsMutation()
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AdminRoleSyncStatus>()
  const reasonError = touched ? validateReason(reason) : ''

  const run = async (): Promise<void> => {
    setTouched(true)
    // BE có thể trả 500 khi `reason` trống hoặc dài hơn 255 ký tự nên chặn trước khi gọi.
    if (validateReason(reason)) return
    try {
      const status = await sync({ role, reason: reason.trim() }).unwrap()
      setResult(status)
      setError('')
      if (status.state === 'IN_SYNC') feedback.success('Đã đồng bộ vai trò')
      else
        feedback.warning(
          'Chưa đồng bộ được: trạng thái vai trò chưa chuyển sang "Đã đồng bộ"'
        )
    } catch (failure) {
      const detail = getMatrixErrorMessage(failure, 'Không thể đồng bộ vai trò')
      setError(detail)
      feedback.error(detail)
    }
  }

  return {
    reason,
    reasonError,
    error,
    result,
    isLoading,
    setReason: (value: string): void => {
      setReason(value)
      setError('')
    },
    run
  }
}
