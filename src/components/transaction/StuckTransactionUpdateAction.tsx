import { toStuckTransactionUpdate } from '@pages/transaction-management/stuck-transaction/dto/stuckTransactionUpdate.dto'
import { useTransactionSnapshot } from '@pages/wallet-administration/transaction-wallet/hooks/useTransactionSnapshot'
import { useState } from 'react'
import {
  ButtonComponent,
  DialogModal,
  TooltipComponent
} from '@components/index'
import { ArrowsCounterClockwiseIcon } from '@components/icons'
import { PERMISSION, useAccess } from '@/app/permissions'
import { useMessage } from '@hooks/useMessage'
import { useUpdateStuckTransactionStatusMutation } from '@services/apiStuckTransaction'
import {
  useGetWithdrawalByTransactionCodeQuery,
  useLazyGetWithdrawalByTransactionCodeQuery
} from '@services/apiJournal'
import {
  canShowStuckUpdateForType,
  canUpdateStuckTransaction,
  isStuckJournalStatus
} from '@utils/stuck-transaction'
import { StuckTransactionDialogContent } from './StuckTransactionDialogContent'
import type { StuckTransactionUpdateFormValues } from './StuckTransaction.schema'
import {
  describeResult,
  describeSubmitError,
  getFinalActions,
  isConflictError
} from './stuckTransaction.utils'

const CASH_OUT = 'CASH_OUT'

export interface StuckTransactionUpdateActionProps {
  transactionCode?: string | null
  /** Loại giao dịch của bút toán (`CASH_IN` / `CASH_OUT` / `P2P_TRANSFER`…). */
  transactionType?: string | null
  /** Trạng thái bút toán bên wallet-core. */
  journalStatus?: string | null
  /** Thu gọn thành icon trong cột thao tác của bảng. */
  compact?: boolean
  /** Ẩn nút khi lệnh chưa thuộc diện cập nhật treo (ví dụ lệnh rút đang chờ phê duyệt). */
  hidden?: boolean
  className?: string
}

/**
 * Nút "Xử lý chi tiền" và form chốt kết quả.
 *
 * Nút **biến mất** khi lệnh rút đang ở `PENDING_APPROVAL`: BE từ chối những lệnh
 * đó ở endpoint này, và quan trọng hơn, cùng chữ "Thành công" ở đây nghĩa là
 * *ghi sổ cho khớp* còn ở luồng duyệt nghĩa là *chi tiền thật*. Trạng thái lệnh
 * rút đọc từ cùng cache entry mà `WithdrawalDecisionPanel` đang dùng nên không
 * phát sinh request thứ hai.
 */
export const StuckTransactionUpdateAction = ({
  transactionCode,
  transactionType,
  journalStatus,
  compact = false,
  hidden = false,
  className
}: StuckTransactionUpdateActionProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const { has } = useAccess()
  const { successMess, errorMess } = useMessage()
  const code = transactionCode ?? ''
  const canAccess = has(PERMISSION.EWALLET_FULL)
  const [readWithdrawal, { isFetching: isCheckingWithdrawal }] =
    useLazyGetWithdrawalByTransactionCodeQuery()

  // Trong detail, đọc cache đã nạp sẵn. Ở bảng compact thì trì hoãn request
  // đến lúc bấm icon để không gọi `/withdrawals` cho mọi dòng đang hiển thị.
  const { data: withdrawal } = useGetWithdrawalByTransactionCodeQuery(code, {
    skip:
      !code ||
      !canAccess ||
      compact ||
      !isStuckJournalStatus(journalStatus) ||
      transactionType !== CASH_OUT,
    refetchOnMountOrArgChange: false
  })
  const [updateStatus, { isLoading }] =
    useUpdateStuckTransactionStatusMutation()
  const { snapshot, refresh } = useTransactionSnapshot(code)
  // Chưa có snapshot thì vẫn hiện nút để bấm vào là hỏi `refresh`; kết quả cuối thì
  // `allowedActions` không còn POSTED/FAILED nên nút biến mất (NFR-DATA-INTEG).
  const hasNoFinalAction =
    snapshot !== undefined &&
    getFinalActions(snapshot.allowedActions).length === 0

  if (!code || !canAccess || hidden) return null
  if (!canShowStuckUpdateForType(transactionType)) return null
  if (!isStuckJournalStatus(journalStatus)) return null
  if (hasNoFinalAction && !isOpen) return null
  if (
    !compact &&
    !canUpdateStuckTransaction(journalStatus, withdrawal?.status)
  ) {
    return null
  }

  const handleOpen = async (): Promise<void> => {
    if (compact && transactionType === CASH_OUT) {
      const latestWithdrawal = await readWithdrawal(code)
        .unwrap()
        .catch(() => null)

      if (!latestWithdrawal) {
        errorMess('Không đọc được trạng thái lệnh rút. Vui lòng thử lại.')
        return
      }

      if (!canUpdateStuckTransaction(journalStatus, latestWithdrawal.status)) {
        errorMess('Lệnh rút đang chờ phê duyệt, không thể Xử lý chi tiền.')
        return
      }
    }

    setSubmissionError(null)
    setIsOpen(true)
    void refresh()
  }

  const handleSubmit = async (
    values: StuckTransactionUpdateFormValues,
    optionalFields: readonly string[]
  ): Promise<void> => {
    if (isLoading) return
    setSubmissionError(null)
    try {
      const result = await updateStatus(
        toStuckTransactionUpdate(code, values, optionalFields)
      ).unwrap()
      setIsOpen(false)
      successMess(describeResult(result))
    } catch (error) {
      setSubmissionError(describeSubmitError(error))
      // 409: trạng thái đã đổi (đã có kết quả cuối...) nên tải lại popup theo snapshot mới.
      if (isConflictError(error)) void refresh()
    }
  }

  const actionLabel = 'Xử lý chi tiền'
  const trigger = (
    <ButtonComponent
      aria-label={actionLabel}
      htmlType='button'
      type='default'
      size={compact ? 'small' : undefined}
      className={className}
      content={compact ? undefined : actionLabel}
      icon={<ArrowsCounterClockwiseIcon size={16} />}
      loading={compact && isCheckingWithdrawal}
      onClick={() => void handleOpen()}
    />
  )

  return (
    <>
      {compact ? (
        <TooltipComponent title='Xử lý'>{trigger}</TooltipComponent>
      ) : (
        trigger
      )}
      <DialogModal
        open={isOpen}
        title='Xử lý chi tiền'
        footer={null}
        width={{ xs: '100%', sm: 640 }}
        closable={{ 'aria-label': 'Đóng' }}
        onOk={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        content={
          isOpen ? (
            <StuckTransactionDialogContent
              transactionCode={code}
              isSubmitting={isLoading}
              submissionError={submissionError}
              onSubmit={(values, optionalFields) =>
                void handleSubmit(values, optionalFields)
              }
              onCancel={() => setIsOpen(false)}
            />
          ) : null
        }
      />
    </>
  )
}
