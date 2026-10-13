import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormTextArea } from '@components/form'
import { ButtonComponent, PopoverComponent } from '@components/index'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundTarget } from '../schemas/refund.schema'
import {
  REASON_MAX,
  rejectRefundSchema,
  type RejectRefundValues
} from '../schemas/refundForm.schema'
import { RefundNote } from './RefundNote'

interface RejectRefundPopoverProps {
  refund: RefundTarget
  children: ReactNode
}

interface RejectFormProps {
  refund: RefundTarget
  onDone: () => void
}

/** Tách form để `destroyOnHidden` dựng lại mỗi lần mở: lý do và lỗi cũ tự mất. */
function RejectForm({ refund, onDone }: RejectFormProps) {
  const { reject, isRejecting } = useRefundActions()
  const [error, setError] = useState('')
  const { control, handleSubmit } = useForm<RejectRefundValues>({
    resolver: zodResolver(rejectRefundSchema),
    defaultValues: { reason: '' }
  })

  const onSubmit = async ({ reason }: RejectRefundValues): Promise<void> => {
    setError('')
    const result = await reject(refund.id, reason)
    if (result.ok) onDone()
    else setError(result.message)
  }

  return (
    <form
      noValidate
      className='flex w-72 flex-col gap-2'
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormTextArea<RejectRefundValues>
        control={control}
        name='reason'
        label='Lý do từ chối'
        required
        rows={3}
        maxLength={REASON_MAX}
        placeholder='Nhập lý do (5 đến 500 ký tự)'
        className='flex flex-col gap-1'
      />
      {error && <RefundNote tone='danger'>{error}</RefundNote>}
      <div className='flex justify-end gap-2'>
        <ButtonComponent
          type='default'
          htmlType='button'
          size='small'
          content='Đóng'
          disabled={isRejecting}
          onClick={onDone}
        />
        <ButtonComponent
          danger
          htmlType='submit'
          size='small'
          loading={isRejecting}
          content='Từ chối'
        />
      </div>
    </form>
  )
}

export function RejectRefundPopover({
  refund,
  children
}: RejectRefundPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <PopoverComponent
      open={open}
      trigger='click'
      placement='bottomRight'
      destroyOnHidden
      onOpenChange={setOpen}
      title={`Từ chối ${refund.refundCode}`}
      content={
        <RejectForm
          refund={refund}
          onDone={() => setOpen(false)}
        />
      }
    >
      {/* Popover cần phần tử DOM để gắn sự kiện; nút bọc ngoài không nhận props lạ. */}
      <span className='inline-flex'>{children}</span>
    </PopoverComponent>
  )
}
