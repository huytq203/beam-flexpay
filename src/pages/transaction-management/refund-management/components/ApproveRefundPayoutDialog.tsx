import { useState } from 'react'
import { DialogModal } from '@components/index'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundTarget } from '../schemas/refund.schema'
import { RefundDialogFooter } from './RefundDialogFooter'
import { RefundNote } from './RefundNote'
import { RefundSummary } from './RefundSummary'

interface ApproveRefundPayoutDialogProps {
  refund: RefundTarget
  onClose: () => void
}

/** Kế toán xác nhận cho phép chi tiền hoàn ra ngân hàng; hệ thống gửi lệnh chi sau khi duyệt. */
export function ApproveRefundPayoutDialog({
  refund,
  onClose
}: ApproveRefundPayoutDialogProps) {
  const { approvePayout, isApprovingPayout } = useRefundActions()
  const [error, setError] = useState('')

  const handleApprove = async (): Promise<void> => {
    if (isApprovingPayout) return
    setError('')
    const result = await approvePayout(refund.id)
    if (result.ok) onClose()
    else setError(result.message)
  }

  return (
    <DialogModal
      open
      title='Duyệt chi hoàn tiền'
      width={{ xs: '100%', sm: 520 }}
      footer={null}
      maskClosable={false}
      keyboard={!isApprovingPayout}
      closable={!isApprovingPayout}
      onOk={onClose}
      onCancel={() => {
        if (!isApprovingPayout) onClose()
      }}
    >
      <div className='flex flex-col gap-3'>
        <RefundSummary
          refund={refund}
          showAmounts
        />
        <RefundNote tone='info'>
          Sau khi duyệt chi, hệ thống gửi lệnh chi sang ngân hàng và không thể
          hoàn tác. Trạng thái chuyển sang Đang xử lý.
        </RefundNote>
        {error && <RefundNote tone='danger'>{error}</RefundNote>}
      </div>
      <RefundDialogFooter
        okText='Duyệt chi'
        loading={isApprovingPayout}
        onOk={handleApprove}
        onCancel={onClose}
      />
    </DialogModal>
  )
}
