import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormCheckbox, FormInputNumber, FormTextArea } from '@components/form'
import { DialogModal } from '@components/index'
import { formatNumber } from '@utils/formatNumber'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { RefundChannel } from '@pages/transaction-management/refund-management/schemas/refund.schema'
import { REFUND_CHANNEL_LABELS } from '@pages/transaction-management/refund-management/constants/refund.constants'
import { RefundDialogFooter } from '@pages/transaction-management/refund-management/components/RefundDialogFooter'
import { RefundNote } from '@pages/transaction-management/refund-management/components/RefundNote'
import {
  REFUND_CHANNEL_BY_TYPE,
  REFUND_CHANNEL_HINT
} from '../constants/transactionRefund.constant'
import {
  TransactionType,
  type TransactionKey
} from '../constants/Transaction.constant'
import { getRefundOriginalType } from '../dto/transactionRefund.dto'
import { useCreateRefund } from '../hooks/useCreateRefund'
import {
  REFUND_REASON_MAX,
  createRefundFormSchema,
  type CreateRefundFormValues
} from '../schemas/createRefund.schema'

interface CreateRefundDialogProps {
  transaction: UnifiedContentJournal
  onClose: () => void
}

const FORM_ID = 'create-refund-form'

export function CreateRefundDialog({
  transaction,
  onClose
}: CreateRefundDialogProps) {
  const { submit, isSubmitting } = useCreateRefund()
  const [error, setError] = useState('')
  const { control, handleSubmit } = useForm<CreateRefundFormValues>({
    resolver: zodResolver(createRefundFormSchema),
    defaultValues: {
      requestedAmount: undefined,
      reason: '',
      sendNotification: true
    }
  })
  const originalType = getRefundOriginalType(transaction.transactionType)
  const channel = originalType ? REFUND_CHANNEL_BY_TYPE[originalType] : null

  const onSubmit = async (values: CreateRefundFormValues): Promise<void> => {
    if (isSubmitting) return
    setError('')
    const result = await submit(transaction, values)
    if (result.ok) onClose()
    else setError(result.message)
  }

  return (
    <DialogModal
      open
      title='Tạo yêu cầu hoàn tiền'
      width={{ xs: '100%', sm: 560 }}
      footer={null}
      onOk={onClose}
      onCancel={onClose}
    >
      <form
        id={FORM_ID}
        noValidate
        className='flex flex-col gap-3'
        onSubmit={handleSubmit(onSubmit)}
      >
        <dl className='grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm'>
          <dt className='text-muted-foreground'>Mã giao dịch</dt>
          <dd className='font-medium'>{transaction.transactionCode}</dd>
          <dt className='text-muted-foreground'>Loại giao dịch</dt>
          <dd>
            {TransactionType[transaction.transactionType as TransactionKey] ??
              transaction.transactionType}
          </dd>
          <dt className='text-muted-foreground'>Số tiền gốc</dt>
          <dd className='tabular-nums'>
            {formatNumber(transaction.amount)} {transaction.currency}
          </dd>
        </dl>

        {channel && originalType && (
          <div className='flex flex-col gap-1'>
            <span className='font-medium'>Kênh hoàn</span>
            <p className='rounded-xl border border-border bg-muted px-3 py-2 text-sm'>
              {REFUND_CHANNEL_LABELS[channel]}
            </p>
            <p className='text-xs text-muted-foreground'>
              {REFUND_CHANNEL_HINT[originalType]}
            </p>
          </div>
        )}

        {channel === RefundChannel.TO_BANK && (
          <RefundNote
            tone='info'
            title='Tài khoản nhận:'
          >
            Lấy từ lần nạp gốc
            {transaction.maskedAccount ? ` (${transaction.maskedAccount})` : ''}
            , không cần nhập.
          </RefundNote>
        )}

        <FormInputNumber<CreateRefundFormValues>
          control={control}
          name='requestedAmount'
          label='Số tiền hoàn'
          required
          allowEmpty
          suffix={transaction.currency}
          placeholder='Nhập số tiền, không rút gọn'
          formatter={(value) =>
            `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
          parser={(value) => Number(value?.replace(/,/g, ''))}
          className='flex flex-col gap-1'
        />

        <FormTextArea<CreateRefundFormValues>
          control={control}
          name='reason'
          label='Lý do hoàn tiền'
          required
          rows={3}
          maxLength={REFUND_REASON_MAX}
          placeholder='Nhập lý do (10 đến 500 ký tự)'
          className='flex flex-col gap-1'
        />

        <FormCheckbox<CreateRefundFormValues>
          control={control}
          name='sendNotification'
          label={
            <span>
              Gửi thông báo cho khách hàng
              <span className='block text-xs text-muted-foreground'>
                Bỏ chọn thì khách và merchant không nhận thông báo kết quả.
              </span>
            </span>
          }
        />

        {error && <RefundNote tone='danger'>{error}</RefundNote>}
      </form>
      <RefundDialogFooter
        formId={FORM_ID}
        okText='Gửi yêu cầu'
        loading={isSubmitting}
        onCancel={onClose}
      />
    </DialogModal>
  )
}
