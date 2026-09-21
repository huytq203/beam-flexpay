import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form'

import { FormInput, FormSelect } from '@components/form'
import { ButtonComponent, DialogModal } from '@components/index'

import { NOTIFICATION_CHANNEL_OPTIONS, NOTIFICATION_EVENT_OPTIONS, NOTIFICATION_SCOPE_OPTIONS, NOTIFICATION_STATUS_OPTIONS, notificationSchema, type NotificationFormValues } from '../schemas/notification.schema'
import type { NotificationRow } from '../types/notification.type'

interface Props { open: boolean; row: NotificationRow | null; onCancel: () => void; onSave: (values: NotificationFormValues & { id?: string }) => void }
const FORM_ID = 'merchant-notification-form'
const defaults = (row: NotificationRow | null): NotificationFormValues => ({ scope: row?.scope ?? 'MASTER', merchantCode: row?.merchantCode ?? '', event: row?.event ?? 'PAYMENT_SUCCESS', channel: row?.channel ?? 'EMAIL', destination: row?.destination ?? '', status: row?.status ?? 'ACTIVE' })

function NotificationDialogContent({ row, onCancel, onSave }: Omit<Props, 'open'>) {
  const form = useForm<NotificationFormValues>({ resolver: zodResolver(notificationSchema), defaultValues: defaults(row) })
  const channel = useWatch({ control: form.control, name: 'channel' })
  useEffect(() => { form.clearErrors('destination') }, [channel, form])
  const submit: SubmitHandler<NotificationFormValues> = (values) => onSave({ ...values, id: row?.id })
  const destinationMeta = channel === 'EMAIL' ? ['Email nhận thông báo', 'ops@merchant.vn'] : channel === 'SMS' ? ['Số điện thoại nhận SMS', '0909123456'] : ['Webhook URL', 'https://merchant.vn/events']

  return <DialogModal destroyOnHidden footer={<div className='flex justify-end gap-2'><ButtonComponent content='Hủy' htmlType='button' onClick={onCancel} type='default' /><ButtonComponent content={row ? 'Lưu thay đổi' : 'Thêm thông báo'} form={FORM_ID} htmlType='submit' /></div>} onCancel={onCancel} onOk={() => {}} open title={row ? 'Sửa cấu hình thông báo' : 'Thêm cấu hình thông báo'} width={{ xs: 'calc(100vw - 24px)', md: 640 }}>
    <form className='grid grid-cols-1 gap-4 md:grid-cols-2' id={FORM_ID} noValidate onSubmit={form.handleSubmit(submit)}>
      <FormSelect className='flex flex-col gap-1.5' control={form.control} label='Cấp áp dụng' name='scope' options={NOTIFICATION_SCOPE_OPTIONS} required />
      <FormInput className='flex flex-col gap-1.5' control={form.control} label='Mã merchant' name='merchantCode' required />
      <FormSelect className='flex flex-col gap-1.5' control={form.control} label='Sự kiện' name='event' options={NOTIFICATION_EVENT_OPTIONS} required />
      <FormSelect className='flex flex-col gap-1.5' control={form.control} label='Kênh' name='channel' options={NOTIFICATION_CHANNEL_OPTIONS} required />
      <FormInput className='flex flex-col gap-1.5 md:col-span-2' control={form.control} label={destinationMeta[0]} name='destination' placeholder={destinationMeta[1]} required />
      <FormSelect className='flex flex-col gap-1.5' control={form.control} label='Trạng thái' name='status' options={NOTIFICATION_STATUS_OPTIONS} required />
    </form>
  </DialogModal>
}

export function NotificationDialog({ open, ...props }: Props) { return open ? <NotificationDialogContent {...props} /> : null }
