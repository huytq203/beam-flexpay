import { useMessage } from '@hooks/useMessage'
import { useLazyGetWithdrawalByTransactionCodeQuery } from '@services/apiJournal'
import {
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation
} from '@services/apiWithdrawalApproval'
import {
  getWithdrawalDecisionFailureMessage,
  type WithdrawalDecision
} from '@utils/withdrawal-approval'

export interface WithdrawalDecisionApi {
  approve: (note: string) => Promise<boolean>
  reject: (reason: string) => Promise<boolean>
  isApproving: boolean
  isRejecting: boolean
  isDeciding: boolean
}

/**
 * Duyệt / từ chối một lệnh rút vượt ngưỡng.
 *
 * Khi lệnh hỏng, ta **đọc lại trạng thái thật rồi mới báo** thay vì diễn giải
 * response: user-wallet trả cùng một `BUSINESS_ERROR` cho mọi nguyên nhân, nên
 * chỉ trạng thái mới nhất mới phân biệt được "người khác vừa duyệt mất" với
 * "sổ cái từ chối, thử lại đi".
 */
export const useWithdrawalDecision = (
  transactionCode: string
): WithdrawalDecisionApi => {
  const { successMess, errorMess } = useMessage()
  const [approveWithdrawal, { isLoading: isApproving }] =
    useApproveWithdrawalMutation()
  const [rejectWithdrawal, { isLoading: isRejecting }] =
    useRejectWithdrawalMutation()
  const [readWithdrawal] = useLazyGetWithdrawalByTransactionCodeQuery()

  const isDeciding = isApproving || isRejecting

  const runDecision = async (
    decision: WithdrawalDecision,
    send: () => Promise<unknown>,
    successMessage: string
  ): Promise<boolean> => {
    if (isDeciding || !transactionCode) return false

    try {
      await send()
      successMess(successMessage)
      return true
    } catch {
      const fresh = await readWithdrawal(transactionCode)
        .unwrap()
        .catch(() => null)
      errorMess(getWithdrawalDecisionFailureMessage(fresh?.status, decision))
      return false
    }
  }

  return {
    isApproving,
    isRejecting,
    isDeciding,
    approve: (note) =>
      runDecision(
        'approve',
        () => approveWithdrawal({ transactionCode, note }).unwrap(),
        'Đã duyệt lệnh rút. Hệ thống đang chi, tiền chưa rời ngân hàng.'
      ),
    reject: (reason) =>
      runDecision(
        'reject',
        () => rejectWithdrawal({ transactionCode, reason }).unwrap(),
        'Đã từ chối lệnh rút. Toàn bộ tiền bị giữ đã trả về ví khách.'
      )
  }
}
