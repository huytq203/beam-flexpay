import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { FormInput, FormInputNumber, FormSelect } from '@components/form'
import { ButtonComponent, DialogModal } from '@components/index'

import {
  PAYMENT_METHOD_CHANNEL_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_SCOPE_OPTIONS,
  PAYMENT_METHOD_STATUS_OPTIONS,
  paymentMethodSchema
} from '../schemas/paymentMethod.schema'
import type { PaymentMethodFormValues } from '../schemas/paymentMethod.schema'
import type { PaymentMethodRow } from '../types/paymentMethod.type'

const formId = 'payment-method-form'

interface PaymentMethodDialogProps {
  open: boolean
  row: PaymentMethodRow | null
  onSave: (record: PaymentMethodFormValues & { id?: string }) => void
  onCancel: () => void
}

const getDefaultValues = (row: PaymentMethodRow | null) => ({
  scope: row?.scope ?? 'MASTER',
  merchantCode: row?.merchantCode ?? '',
  method: row?.method,
  channel: row?.channel ?? 'WEB',
  minAmount: row?.minAmount,
  maxAmount: row?.maxAmount,
  feeLabel: row?.feeLabel ?? '',
  status: row?.status ?? 'ACTIVE'
})

interface PaymentMethodDialogFooterProps {
  isEditing: boolean
  onCancel: () => void
}

function PaymentMethodDialogFooter({
  isEditing,
  onCancel
}: PaymentMethodDialogFooterProps) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
      <ButtonComponent block className='sm:w-auto!' content='Hủy' htmlType='button' onClick={onCancel} type='default' />
      <ButtonComponent block className='sm:w-auto!' content={isEditing ? 'Lưu thay đổi' : 'Lưu hình thức'} form={formId} htmlType='submit' />
    </div>
  )
}

function PaymentMethodDialogContent({
  row,
  onSave,
  onCancel
}: Omit<PaymentMethodDialogProps, 'open'>) {
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: getDefaultValues(row)
  })
  const isEditing = row !== null
  const handleSubmit: SubmitHandler<PaymentMethodFormValues> = (values) => {
    onSave({ ...values, id: row?.id })
  }

  return (
    <DialogModal destroyOnHidden footer={<PaymentMethodDialogFooter isEditing={isEditing} onCancel={onCancel} />} onCancel={onCancel} onOk={() => {}} open title={isEditing ? 'Sửa hình thức thanh toán' : 'Thêm hình thức thanh toán'} width={{ xs: 'calc(100vw - 24px)', md: 680 }}>
      <form className='grid grid-cols-1 gap-4 md:grid-cols-2' id={formId} noValidate onSubmit={form.handleSubmit(handleSubmit)}>
        <FormSelect className='flex flex-col gap-1.5' control={form.control} label='Cấp áp dụng' name='scope' options={PAYMENT_METHOD_SCOPE_OPTIONS} required />
        <FormInput className='flex flex-col gap-1.5' control={form.control} label='Mã merchant' name='merchantCode' required />
        <FormSelect className='flex flex-col gap-1.5' control={form.control} label='Hình thức' name='method' options={PAYMENT_METHOD_OPTIONS} required />
        <FormSelect className='flex flex-col gap-1.5' control={form.control} label='Kênh thanh toán' name='channel' options={PAYMENT_METHOD_CHANNEL_OPTIONS} required />
        <FormInputNumber allowEmpty className='flex flex-col gap-1.5' control={form.control} label='Hạn mức tối thiểu' min={0} name='minAmount' precision={0} required />
        <FormInputNumber allowEmpty className='flex flex-col gap-1.5' control={form.control} label='Hạn mức tối đa' min={0} name='maxAmount' precision={0} required />
        <FormInput className='flex flex-col gap-1.5 md:col-span-2' control={form.control} label='Biểu phí' name='feeLabel' placeholder='Ví dụ: 0,8% / giao dịch' required />
        <FormSelect className='flex flex-col gap-1.5' control={form.control} label='Trạng thái' name='status' options={PAYMENT_METHOD_STATUS_OPTIONS} required />
      </form>
    </DialogModal>
  )
}

export function PaymentMethodDialog({ open, ...rest }: PaymentMethodDialogProps) {
  if (!open) return null

  return <PaymentMethodDialogContent {...rest} />
}
