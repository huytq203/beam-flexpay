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
  canUpdateStuckTransaction,
  isStuckJournalStatus
} from '@utils/stuck-transaction'
import { StuckTransactionOutcome } from '@type/stuckTransaction.type'
import { StuckTransactionUpdateForm } from './StuckTransactionUpdateForm'
import type { StuckTransactionUpdateFormValues } from './StuckTransaction.schema'

const CASH_OUT = 'CASH_OUT'

const getErrorDetail = (error: unknown): string | null => {
  if (!error || typeof error !== 'object' || !('data' in error)) return null
  const data = error.data
  if (!data || typeof data !== 'object' || !('detail' in data)) return null
  return typeof data.detail === 'string' ? data.detail : null
}

export interface StuckTransactionUpdateActionProps {
  transactionCode?: string | null
  /** Loại giao dịch của bút toán (`CASH_IN` / `CASH_OUT` / `P2P_TRANSFER`…). */
  transactionType?: string | null
  /** Trạng thái bút toán bên wallet-core. */
  journalStatus?: string | null
  /** Thu gọn thành icon trong cột thao tác của bảng. */
  compact?: boolean
  className?: string
}

/**
 * Nút "Cập nhật giao dịch treo" và form chốt kết quả.
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

  if (!code || !canAccess) return null
  if (!isStuckJournalStatus(journalStatus)) return null
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
        errorMess(
          'Lệnh rút đang chờ phê duyệt, không thể cập nhật giao dịch treo.'
        )
        return
      }
    }

    setSubmissionError(null)
    setIsOpen(true)
  }

  const handleSubmit = async (
    values: StuckTransactionUpdateFormValues
  ): Promise<void> => {
    setSubmissionError(null)
    try {
      const result = await updateStatus({
        transactionCode: code,
        ...values
      }).unwrap()
      setIsOpen(false)
      successMess(
        result.newStatus === StuckTransactionOutcome.POSTED
          ? 'Đã chốt giao dịch thành công và ghi bút toán vào sổ cái.'
          : 'Đã chốt giao dịch thất bại. Khoản tiền đang bị giữ đã được giải phóng.'
      )
    } catch (error) {
      setSubmissionError(
        getErrorDetail(error) ??
          'Không thể chốt giao dịch. Hãy kiểm tra lại trạng thái lệnh, bằng chứng ngân hàng và số tiền có thể giữ, rồi thử lại.'
      )
    }
  }

  const actionLabel = 'Cập nhật giao dịch treo'
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
        <TooltipComponent title={actionLabel}>{trigger}</TooltipComponent>
      ) : (
        trigger
      )}
      <DialogModal
        open={isOpen}
        title='Cập nhật giao dịch treo'
        footer={null}
        width={{ xs: '100%', sm: 520 }}
        closable={{ 'aria-label': 'Đóng' }}
        onOk={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        content={
          <StuckTransactionUpdateForm
            transactionCode={code}
            isCashOut={transactionType === CASH_OUT}
            isSubmitting={isLoading}
            submissionError={submissionError}
            onSubmit={(values) => void handleSubmit(values)}
            onCancel={() => setIsOpen(false)}
          />
        }
      />
    </>
  )
}
