import {
  ManualPayoutOutcome,
  readFirstErrorMessage,
  type ManualPayoutSubmitValues
} from '@components/payout/manualPayout.utils'
import { describeSubmitError } from '@components/transaction/stuckTransaction.utils'
import { useMessage } from '@hooks/useMessage'
import { useUpdateStuckTransactionStatusMutation } from '@services/apiStuckTransaction'
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
  /**
   * Chốt tay lệnh chi thủ công qua `update-status` sẵn có. Trả `null` khi xong,
   * hoặc câu lỗi tiếng Việt để dialog hiển thị và giữ nguyên cho người dùng sửa.
   */
  confirmManualPayout: (
    outcome: ManualPayoutOutcome,
    values: ManualPayoutSubmitValues
  ) => Promise<string | null>
  isConfirmingManual: boolean
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
  const [updateStatus, { isLoading: isConfirmingManual }] =
    useUpdateStuckTransactionStatusMutation()

  const isDeciding = isApproving || isRejecting || isConfirmingManual

  const confirmManualPayout = async (
    outcome: ManualPayoutOutcome,
    values: ManualPayoutSubmitValues
  ): Promise<string | null> => {
    if (isDeciding || !transactionCode) return null
    const isSuccess = outcome === ManualPayoutOutcome.SUCCESS
    try {
      // Thành công = POSTED (ghi sổ, tiền đã ra); thất bại = FAILED (nhả tiền giữ về ví).
      await updateStatus({
        transactionCode,
        newStatus: isSuccess ? 'POSTED' : 'FAILED',
        note: values.note,
        ...(isSuccess
          ? { bankReference: values.bankReference, receiptKey: values.receiptKey }
          : {})
      }).unwrap()
      successMess(
        isSuccess
          ? 'Đã chốt chi thành công. Bút toán đã ghi vào sổ cái.'
          : 'Đã chốt chi thất bại. Toàn bộ tiền bị giữ đã trả về ví khách.'
      )
      return null
    } catch (error) {
      return readFirstErrorMessage(error) ?? describeSubmitError(error)
    }
  }

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
    isConfirmingManual,
    confirmManualPayout,
    approve: (note) =>
      runDecision(
        'approve',
        () => approveWithdrawal({ transactionCode, note }).unwrap(),
        // Câu trung lập cho cả hai chế độ chi: lệnh chi tay chưa đi đâu cho tới khi kế toán chốt.
        'Đã duyệt lệnh rút. Tiền chưa rời ngân hàng cho tới khi chi xong.'
      ),
    reject: (reason) =>
      runDecision(
        'reject',
        () => rejectWithdrawal({ transactionCode, reason }).unwrap(),
        'Đã từ chối lệnh rút. Toàn bộ tiền bị giữ đã trả về ví khách.'
      )
  }
}
