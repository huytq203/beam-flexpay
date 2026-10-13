import { useState } from 'react'
import { DialogModal } from '@components/index'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundTarget } from '../schemas/refund.schema'
import { getTypeNote } from '../utils/refundApproveNote'
import { RefundDialogFooter } from './RefundDialogFooter'
import { RefundNote } from './RefundNote'
import { RefundSummary } from './RefundSummary'

interface ApproveRefundDialogProps {
  refund: RefundTarget
  username: string
  onClose: () => void
}

export function ApproveRefundDialog({
  refund,
  username,
  onClose
}: ApproveRefundDialogProps) {
  const { approve, isApproving } = useRefundActions()
  const [error, setError] = useState('')
  const typeNote = getTypeNote(refund)

  const handleApprove = async (): Promise<void> => {
    if (isApproving) return
    setError('')
    const result = await approve(refund.id)
    if (result.ok) onClose()
    else setError(result.message)
  }

  return (
    <DialogModal
      open
      title='Duyệt yêu cầu hoàn tiền'
      width={{ xs: '100%', sm: 520 }}
      footer={null}
      maskClosable={false}
      keyboard={!isApproving}
      closable={!isApproving}
      onOk={onClose}
      onCancel={() => {
        if (!isApproving) onClose()
      }}
    >
      <div className='flex flex-col gap-3'>
        <RefundSummary
          refund={refund}
          showAmounts
        />
        {typeNote && <RefundNote tone='info'>{typeNote}</RefundNote>}

        {error && <RefundNote tone='danger'>{error}</RefundNote>}
      </div>
      <RefundDialogFooter
        okText='Duyệt hoàn tiền'
        loading={isApproving}
        onOk={handleApprove}
        onCancel={onClose}
      />
    </DialogModal>
  )
}
