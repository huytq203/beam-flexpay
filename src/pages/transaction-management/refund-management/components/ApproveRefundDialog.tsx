import { useState } from 'react'
import { DialogModal } from '@components/index'
import { useRefundActions } from '../hooks/useRefundActions'
import {
  RefundChannel,
  RefundOriginalType,
  type RefundTarget
} from '../schemas/refund.schema'
import { RefundDialogFooter } from './RefundDialogFooter'
import { RefundNote } from './RefundNote'
import { RefundSummary } from './RefundSummary'

interface ApproveRefundDialogProps {
  refund: RefundTarget
  username: string
  onClose: () => void
}

const getTypeNote = (refund: RefundTarget): string | undefined => {
  if (refund.channel === RefundChannel.TO_BANK) {
    return 'Sau khi duyệt, hệ thống tạo lệnh chi về ngân hàng và chờ ngân hàng xác nhận. Trạng thái chuyển sang Đã duyệt, đang chuyển tiền.'
  }
  if (refund.originalType === RefundOriginalType.CASH_OUT) {
    return 'Hoàn giao dịch rút tiền lấy từ quỹ ví tạm giữ. Nếu quỹ không đủ, yêu cầu chuyển sang Chờ đủ số dư.'
  }
  if (refund.originalType === RefundOriginalType.MERCHANT_PAYMENT) {
    return 'Ví merchant phải đủ số dư. Nếu thiếu, hệ thống báo lỗi và yêu cầu vẫn ở Chờ duyệt, không chuyển sang Chờ đủ số dư.'
  }
  return undefined
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
        <RefundNote tone='warning'>
          Thao tác chạm vào tiền thật và được ghi vết theo tài khoản{' '}
          <strong>{username}</strong>.
        </RefundNote>
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
