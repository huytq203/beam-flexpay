import { useState } from 'react'
import {
  useDeleteMerchantAssignmentMutation,
  usePostMerchantAssignmentMutation
} from '@/app/services/merchantAssignmentApi'
import { feedback } from '@components/index'
import type { AssignmentScope } from '../types/merchantAssignment.types'
import { describeAssignmentError } from '../utils/assignmentError.utils'
import { validateReason } from '../utils/merchantAssignment.utils'

interface Options {
  /** Chưa có phạm vi (hộp thoại gán theo người dùng) thì chưa gửi được. */
  scope?: AssignmentScope
  onDone: () => void
}

type Mode = 'assign' | 'remove'

const SUCCESS_MESSAGE: Record<Mode, string> = {
  assign: 'Đã gán Sales phụ trách',
  remove: 'Đã gỡ Sales phụ trách'
}

const FAILURE_FALLBACK: Record<Mode, string> = {
  assign: 'Không thể gán Sales phụ trách',
  remove: 'Không thể gỡ Sales phụ trách'
}

/**
 * Gán/gỡ luôn gửi `reason` đã kiểm tra (DELETE thiếu `reason` làm BE trả 500)
 * và giữ hộp thoại mở khi lỗi để người dùng sửa hoặc thử lại.
 */
export function useAssignmentActions({ scope, onDone }: Options) {
  const [assign, assignState] = usePostMerchantAssignmentMutation()
  const [remove, removeState] = useDeleteMerchantAssignmentMutation()
  const [error, setError] = useState('')

  const run = async (
    adminUserId: string,
    reason: string,
    mode: Mode
  ): Promise<void> => {
    if (!scope) return
    const invalid = validateReason(reason)
    setError(invalid)
    if (invalid) return
    const args = {
      level: scope.level,
      id: scope.id,
      adminUserId,
      reason: reason.trim()
    }
    try {
      if (mode === 'assign') await assign(args).unwrap()
      else await remove(args).unwrap()
      feedback.success(SUCCESS_MESSAGE[mode])
      onDone()
    } catch (failure) {
      const detail = describeAssignmentError(failure, FAILURE_FALLBACK[mode])
      setError(detail)
      feedback.error(detail)
    }
  }

  return {
    error,
    clearError: (): void => setError(''),
    isLoading: assignState.isLoading || removeState.isLoading,
    assign: (adminUserId: string, reason: string) =>
      run(adminUserId, reason, 'assign'),
    remove: (adminUserId: string, reason: string) =>
      run(adminUserId, reason, 'remove')
  }
}
