import { useState } from 'react'
import { ButtonComponent, DialogModal } from '@components/index'
import { ArrowsCounterClockwiseIcon } from '@components/icons'
import { PERMISSION, useAccess } from '@/app/permissions'
import { useMessage } from '@hooks/useMessage'
import { useUpdateStuckTransactionStatusMutation } from '@services/apiStuckTransaction'
import { useGetWithdrawalByTransactionCodeQuery } from '@services/apiJournal'
import { canUpdateStuckTransaction } from '@utils/stuck-transaction'
import { StuckTransactionOutcome } from '@type/stuckTransaction.type'
import { StuckTransactionUpdateForm } from './StuckTransactionUpdateForm'
import type { StuckTransactionUpdateFormValues } from './StuckTransaction.schema'

const CASH_OUT = 'CASH_OUT'

export interface StuckTransactionUpdateActionProps {
  transactionCode?: string | null
  /** Loại giao dịch của bút toán (`CASH_IN` / `CASH_OUT` / `P2P_TRANSFER`…). */
  transactionType?: string | null
  /** Trạng thái bút toán bên wallet-core. */
  journalStatus?: string | null
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
  className
}: StuckTransactionUpdateActionProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { has } = useAccess()
  const { successMess, errorMess } = useMessage()
  const code = transactionCode ?? ''

  // Chỉ cần trạng thái, không cần cửa sổ theo dõi như WithdrawalDecisionPanel —
  // hai component đọc chung một cache entry nên đây không phải request thứ hai.
  const { data: withdrawal } = useGetWithdrawalByTransactionCodeQuery(code, {
    skip: !code || transactionType !== CASH_OUT
  })
  const [updateStatus, { isLoading }] = useUpdateStuckTransactionStatusMutation()

  if (!code || !has(PERMISSION.EWALLET_FULL)) return null
  if (!canUpdateStuckTransaction(journalStatus, withdrawal?.status)) return null

  const handleSubmit = async (
    values: StuckTransactionUpdateFormValues
  ): Promise<void> => {
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
    } catch {
      // user-wallet trả cùng một `BUSINESS_ERROR` cho mọi nguyên nhân nên không
      // suy ra được lý do; nêu các khả năng và cách kiểm chứng thay vì đoán.
      // errorMess(
      //   'Không cập nhật được giao dịch. Có thể giao dịch đã có kết quả cuối, hoặc là lệnh rút đang chờ duyệt. Hãy tải lại chi tiết giao dịch để xem trạng thái mới nhất.'
      // )
    }
  }

  return (
    <>
      <ButtonComponent
        htmlType='button'
        type='default'
        className={className}
        content='Cập nhật giao dịch treo'
        icon={<ArrowsCounterClockwiseIcon size={16} />}
        onClick={() => setIsOpen(true)}
      />
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
            isSubmitting={isLoading}
            onSubmit={(values) => void handleSubmit(values)}
            onCancel={() => setIsOpen(false)}
          />
        }
      />
    </>
  )
}
