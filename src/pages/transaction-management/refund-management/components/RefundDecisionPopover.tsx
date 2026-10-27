import { useState, type ReactNode } from 'react'
import {
  ButtonComponent,
  PopoverComponent,
  ReasonDialog
} from '@components/index'
import { useMessage } from '@hooks/useMessage'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundTarget } from '../schemas/refund.schema'
import { REASON_MAX, REASON_MIN } from '../schemas/refundForm.schema'
import { RefundNote } from './RefundNote'

interface RefundDecisionPopoverProps {
  refund: RefundTarget
  /** Nhận trạng thái mở để nút kích hoạt tắt tooltip của nó khi popover đang hiện. */
  children: (isOpen: boolean) => ReactNode
}

export function RefundDecisionPopover({
  refund,
  children
}: RefundDecisionPopoverProps) {
  const { approve, reject, isApproving, isRejecting } = useRefundActions()
  const { errorMess } = useMessage()
  const [open, setOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [error, setError] = useState('')
  const isLoading = isApproving || isRejecting

  const handleOpenChange = (next: boolean): void => {
    if (isLoading) return
    setOpen(next)
    if (next) setError('')
  }

  const handleApprove = async (): Promise<void> => {
    if (isLoading) return
    setError('')
    const result = await approve(refund.id)
    if (result.ok) setOpen(false)
    else setError(result.message)
  }

  const handleReject = async (reason: string): Promise<void> => {
    if (isLoading) return
    const result = await reject(refund.id, reason)
    if (result.ok) {
      setIsRejectOpen(false)
      setOpen(false)
    } else errorMess(result.message)
  }

  const content = (
    <div className='flex w-80 max-w-full min-w-0 flex-col gap-3'>
      <p className='m-0 min-w-0 text-[13px] leading-5 break-words text-foreground'>
        Chọn kết quả xử lý cho yêu cầu{' '}
        <span className='font-semibold'>“{refund.refundCode}”</span>.
      </p>
      {error && <RefundNote tone='danger'>{error}</RefundNote>}
      <div className='grid grid-cols-1 gap-2 min-[384px]:grid-cols-2'>
        <ButtonComponent
          htmlType='button'
          type='default'
          danger
          content='Từ chối'
          className='order-2 w-full pointer-coarse:h-11! min-[384px]:order-none'
          disabled={isLoading}
          onClick={() => setIsRejectOpen(true)}
        />
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Duyệt'
          className='order-1 w-full pointer-coarse:h-11! min-[384px]:order-none'
          loading={isApproving}
          disabled={isLoading}
          onClick={handleApprove}
        />
      </div>
    </div>
  )

  return (
    <>
      <PopoverComponent
        open={open && !isRejectOpen}
        trigger='click'
        placement='bottomRight'
        destroyOnHidden
        styles={{ root: { maxWidth: 'calc(100vw - 24px)' } }}
        title='Phê duyệt hoàn tiền'
        content={content}
        onOpenChange={handleOpenChange}
      >
        {/* Popover cần phần tử DOM để gắn sự kiện; nút bọc ngoài không nhận props lạ. */}
        <span className='inline-flex'>{children(open)}</span>
      </PopoverComponent>
      <ReasonDialog
        open={isRejectOpen}
        title='Từ chối yêu cầu hoàn tiền'
        description={`Yêu cầu “${refund.refundCode}” sẽ chuyển sang trạng thái bị từ chối.`}
        label='Lý do từ chối'
        placeholder='Nhập lý do...'
        minLength={REASON_MIN}
        maxLength={REASON_MAX}
        okText='Xác nhận từ chối'
        danger
        confirmLoading={isRejecting}
        onConfirm={handleReject}
        onCancel={() => setIsRejectOpen(false)}
      />
    </>
  )
}
