import { useState } from 'react'
import { DialogModal } from '@components/index'
import { ManualPayoutForm } from '@components/payout/ManualPayoutForm'
import { ManualPayoutOutcome } from '@components/payout/manualPayout.utils'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundTarget } from '../schemas/refund.schema'
import { formatVnd } from '../utils/refund.utils'
import { RefundSummary } from './RefundSummary'

interface ManualPayoutDialogProps {
  refund: RefundTarget
  outcome: ManualPayoutOutcome
  onClose: () => void
}

const TITLE: Record<ManualPayoutOutcome, string> = {
  [ManualPayoutOutcome.SUCCESS]: 'Xác nhận chi hoàn thành công',
  [ManualPayoutOutcome.FAILED]: 'Xác nhận chi hoàn thất bại'
}

/**
 * Chốt tay kết quả chi hoàn ra ngân hàng chưa có API (`payoutMode = MANUAL`).
 *
 * Ảnh UNC tải lên theo mã lệnh chi (`payoutCode`) qua API biên lai sẵn có. Lỗi BE
 * hiển thị ngay trong dialog và dialog được giữ nguyên để người dùng sửa, gửi lại.
 */
export function ManualPayoutDialog({
  refund,
  outcome,
  onClose
}: ManualPayoutDialogProps) {
  const { manualPayout, isConfirmingManualPayout } = useRefundActions()
  const [error, setError] = useState<string | null>(null)
  const close = (): void => {
    if (!isConfirmingManualPayout) onClose()
  }

  return (
    <DialogModal
      open
      title={TITLE[outcome]}
      width={{ xs: '100%', sm: 560 }}
      footer={null}
      onOk={close}
      onCancel={close}
    >
      <ManualPayoutForm
        outcome={outcome}
        receiptTransactionCode={refund.payoutCode ?? null}
        isSubmitting={isConfirmingManualPayout}
        error={error}
        summary={<RefundSummary refund={refund} />}
        consequence={
          outcome === ManualPayoutOutcome.SUCCESS
            ? `Xác nhận đã chuyển khoản tay ${formatVnd(refund.netCredit)} cho khách. Yêu cầu hoàn chuyển sang Thành công và hệ thống ghi bút toán; thao tác này không hoàn tác được.`
            : 'Xác nhận chuyển khoản tay không thành. Khoản tiền đang giữ được nhả và yêu cầu hoàn quay về chờ duyệt.'
        }
        onSubmit={(values) => {
          setError(null)
          void manualPayout({ id: refund.id, outcome, ...values }).then(
            (result) => {
              if (result.ok) onClose()
              else setError(result.message)
            }
          )
        }}
        onCancel={close}
      />
    </DialogModal>
  )
}
