import { useState, type ReactNode } from 'react'
import { ButtonComponent, PopoverComponent } from '@components/index'
import type { RefundTarget } from '../schemas/refund.schema'

interface RefundPayoutDecisionPopoverProps {
  refund: RefundTarget
  /** Nhận trạng thái mở để nút kích hoạt tắt tooltip của nó khi popover đang hiện. */
  children: (isOpen: boolean) => ReactNode
  onApprove: (refund: RefundTarget) => void
  onReject: (refund: RefundTarget) => void
}

/** Duyệt chi và từ chối chi đều cần xác nhận riêng, nên popover chỉ chọn nhánh rồi mở dialog tương ứng. */
export function RefundPayoutDecisionPopover({
  refund,
  children,
  onApprove,
  onReject
}: RefundPayoutDecisionPopoverProps) {
  const [open, setOpen] = useState(false)

  const choose = (action: (target: RefundTarget) => void) => () => {
    setOpen(false)
    action(refund)
  }

  const content = (
    <div className='flex w-80 max-w-full min-w-0 flex-col gap-3'>
      <p className='m-0 min-w-0 text-[13px] leading-5 break-words text-foreground'>
        Chọn kết quả duyệt chi cho yêu cầu{' '}
        <span className='font-semibold'>“{refund.refundCode}”</span>.
      </p>
      <div className='grid grid-cols-1 gap-2 min-[384px]:grid-cols-2'>
        <ButtonComponent
          htmlType='button'
          type='default'
          danger
          content='Từ chối chi'
          className='order-2 w-full pointer-coarse:h-11! min-[384px]:order-none'
          onClick={choose(onReject)}
        />
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Duyệt chi'
          className='order-1 w-full pointer-coarse:h-11! min-[384px]:order-none'
          onClick={choose(onApprove)}
        />
      </div>
    </div>
  )

  return (
    <PopoverComponent
      open={open}
      trigger='click'
      placement='bottomRight'
      destroyOnHidden
      styles={{ root: { maxWidth: 'calc(100vw - 24px)' } }}
      title='Phê duyệt chi hoàn tiền'
      content={content}
      onOpenChange={setOpen}
    >
      {/* Popover cần phần tử DOM để gắn sự kiện; nút bọc ngoài không nhận props lạ. */}
      <span className='inline-flex'>{children(open)}</span>
    </PopoverComponent>
  )
}
