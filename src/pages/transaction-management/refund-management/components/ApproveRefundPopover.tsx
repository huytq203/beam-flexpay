import { useState, type ReactNode } from 'react'
import { ButtonComponent, PopoverComponent } from '@components/index'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundTarget } from '../schemas/refund.schema'
import { getTypeNote } from '../utils/refundApproveNote'
import { RefundNote } from './RefundNote'

interface ApproveRefundPopoverProps {
  refund: RefundTarget
  username: string
  children: ReactNode
}

export function ApproveRefundPopover({
  refund,
  username,
  children
}: ApproveRefundPopoverProps) {
  const { approve, isApproving } = useRefundActions()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const typeNote = getTypeNote(refund)

  const handleOpenChange = (next: boolean): void => {
    if (isApproving) return
    setOpen(next)
    if (next) setError('')
  }

  const handleApprove = async (): Promise<void> => {
    if (isApproving) return
    setError('')
    const result = await approve(refund.id)
    if (result.ok) setOpen(false)
    else setError(result.message)
  }

  return (
    <PopoverComponent
      open={open}
      trigger='click'
      placement='bottomRight'
      destroyOnHidden
      onOpenChange={handleOpenChange}
      title={`Duyệt ${refund.refundCode}`}
      content={
        <div className='flex w-72 flex-col gap-2'>
          {typeNote && <RefundNote tone='info'>{typeNote}</RefundNote>}
          <RefundNote tone='warning'>
            Thao tác chạm vào tiền thật và được ghi vết theo tài khoản{' '}
            <strong>{username}</strong>.
          </RefundNote>
          {error && <RefundNote tone='danger'>{error}</RefundNote>}
          <div className='flex justify-end gap-2'>
            <ButtonComponent
              type='default'
              htmlType='button'
              size='small'
              content='Đóng'
              disabled={isApproving}
              onClick={() => setOpen(false)}
            />
            <ButtonComponent
              htmlType='button'
              size='small'
              loading={isApproving}
              content='Duyệt hoàn tiền'
              onClick={handleApprove}
            />
          </div>
        </div>
      }
    >
      {/* Popover cần phần tử DOM để gắn sự kiện; nút bọc ngoài không nhận props lạ. */}
      <span className='inline-flex'>{children}</span>
    </PopoverComponent>
  )
}
