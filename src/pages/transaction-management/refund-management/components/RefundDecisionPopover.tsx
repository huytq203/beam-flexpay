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
  /** `payout` là bước Kế toán duyệt chi sau khi hoàn tiền đã được duyệt. */
  mode?: 'refund' | 'payout'
  children: ReactNode
}

const POPOVER_TEXT = {
  refund: {
    title: 'Phê duyệt hoàn tiền',
    approve: 'Duyệt',
    reject: 'Từ chối',
    dialogTitle: 'Từ chối yêu cầu hoàn tiền',
    dialogOk: 'Xác nhận từ chối',
    placeholder: `Nhập lý do (${REASON_MIN} đến ${REASON_MAX} ký tự)`,
    consequence: 'sẽ chuyển sang trạng thái bị từ chối.'
  },
  payout: {
    title: 'Duyệt chi hoàn tiền',
    approve: 'Duyệt chi',
    reject: 'Từ chối chi',
    dialogTitle: 'Từ chối chi hoàn tiền',
    dialogOk: 'Xác nhận từ chối chi',
    placeholder: `Nhập lý do (tối đa ${REASON_MAX} ký tự)`,
    consequence: 'sẽ chuyển sang bị từ chối và nhả khoản tiền đang giữ.'
  }
} as const

export function RefundDecisionPopover({
  refund,
  mode = 'refund',
  children
}: RefundDecisionPopoverProps) {
  const {
    approve,
    reject,
    approveRefundPayout,
    rejectRefundPayout,
    isApproving,
    isRejecting,
    isApprovingPayout,
    isRejectingPayout
  } = useRefundActions()
  const text = POPOVER_TEXT[mode]
  const isPayout = mode === 'payout'
  const approving = isPayout ? isApprovingPayout : isApproving
  const rejecting = isPayout ? isRejectingPayout : isRejecting
  const { errorMess } = useMessage()
  const [open, setOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [error, setError] = useState('')
  const isLoading = approving || rejecting

  const handleOpenChange = (next: boolean): void => {
    if (isLoading) return
    setOpen(next)
    if (next) setError('')
  }

  const handleApprove = async (): Promise<void> => {
    if (isLoading) return
    setError('')
    const result = await (isPayout ? approveRefundPayout : approve)(refund.id)
    if (result.ok) setOpen(false)
    else setError(result.message)
  }

  const handleReject = async (reason: string): Promise<void> => {
    if (isLoading) return
    const result = await (isPayout ? rejectRefundPayout : reject)(
      refund.id,
      reason
    )
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
          content={text.reject}
          className='order-2 w-full pointer-coarse:h-11! min-[384px]:order-none'
          disabled={isLoading}
          onClick={() => setIsRejectOpen(true)}
        />
        <ButtonComponent
          htmlType='button'
          type='default'
          content={text.approve}
          className='order-1 w-full pointer-coarse:h-11! min-[384px]:order-none'
          loading={approving}
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
        title={text.title}
        content={content}
        onOpenChange={handleOpenChange}
      >
        {/* Popover cần phần tử DOM để gắn sự kiện; nút bọc ngoài không nhận props lạ. */}
        <span className='inline-flex'>{children}</span>
      </PopoverComponent>
      <ReasonDialog
        open={isRejectOpen}
        title={text.dialogTitle}
        description={`Yêu cầu “${refund.refundCode}” ${text.consequence}`}
        label='Lý do từ chối'
        placeholder={text.placeholder}
        minLength={REASON_MIN}
        maxLength={REASON_MAX}
        okText={text.dialogOk}
        danger
        confirmLoading={rejecting}
        onConfirm={handleReject}
        onCancel={() => setIsRejectOpen(false)}
      />
    </>
  )
}
