import { useState } from 'react'
import { DialogModal } from '@components/index'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundTarget } from '../schemas/refund.schema'
import { RefundDialogFooter } from './RefundDialogFooter'
import { RefundNote } from './RefundNote'
import { RefundSummary } from './RefundSummary'

interface PayoutApproveDialogProps {
  refund: RefundTarget
  onClose: () => void
}

export function PayoutApproveDialog({
  refund,
  onClose
}: PayoutApproveDialogProps) {
  const { approveRefundPayout, isApprovingPayout } = useRefundActions()
  const [error, setError] = useState('')

  const handleApprove = async (): Promise<void> => {
    if (isApprovingPayout) return
    setError('')
    const result = await approveRefundPayout(refund.id)
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
          Sau khi duyệt chi, lệnh chi được gửi sang ngân hàng và không hoàn tác
          được.
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
