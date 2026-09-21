import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { FormInput, FormSelect, FormTextArea } from '@components/form'
import { ButtonComponent, DialogModal } from '@components/index'

import {
  KEY_CONNECTION_SCOPE_OPTIONS,
  KEY_CONNECTION_STATUS_OPTIONS,
  keyConnectionDialogSchema,
  parseIpWhitelist
} from '../schemas/keyConnection.schema'
import type { KeyConnectionFormValues } from '../schemas/keyConnection.schema'
import type { KeyConnectionRow } from '../types/keyConnection.type'

const FORM_ID = 'key-connection-form'

interface KeyConnectionDialogProps {
  open: boolean
  row: KeyConnectionRow | null
  onSave: (record: KeyConnectionFormValues & { id?: string }) => void
  onCancel: () => void
}

const getDefaultValues = (row: KeyConnectionRow | null) => ({
  scope: row?.scope ?? 'MASTER',
  merchantCode: row?.merchantCode ?? '',
  clientId: row?.clientId ?? '',
  maskedSecret: row?.maskedSecret ?? '',
  ipWhitelist: row?.ipWhitelist.join('\n') ?? '',
  webhookUrl: row?.webhookUrl ?? '',
  status: row?.status ?? 'ACTIVE'
})

function KeyConnectionDialogContent({
  row,
  onSave,
  onCancel
}: Omit<KeyConnectionDialogProps, 'open'>) {
  const form = useForm({
    resolver: zodResolver(keyConnectionDialogSchema),
    defaultValues: getDefaultValues(row)
  })
  const isEditing = row !== null

  const handleSubmit: SubmitHandler<ReturnType<typeof getDefaultValues>> = (
    values
  ) => {
    onSave({
      ...values,
      ipWhitelist: parseIpWhitelist(values.ipWhitelist),
      id: row?.id
    })
  }

  return (
    <DialogModal
      destroyOnHidden
      footer={
        <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          <ButtonComponent
            block
            className='sm:w-auto!'
            content='Hủy'
            htmlType='button'
            onClick={onCancel}
            type='default'
          />
          <ButtonComponent
            block
            className='sm:w-auto!'
            content={isEditing ? 'Lưu thay đổi' : 'Thêm mới Key'}
            form={FORM_ID}
            htmlType='submit'
          />
        </div>
      }
      onCancel={onCancel}
      onOk={() => {}}
      open
      title={isEditing ? 'Sửa key kết nối' : 'Thêm mới Key'}
      width={{ xs: 'calc(100vw - 24px)', md: 640 }}
    >
      <form
        id={FORM_ID}
        noValidate
        className='grid grid-cols-1 gap-4 md:grid-cols-2'
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormSelect
          className='flex flex-col gap-1.5'
          control={form.control}
          label='Cấp áp dụng'
          name='scope'
          options={KEY_CONNECTION_SCOPE_OPTIONS}
          required
        />
        <FormSelect
          className='flex flex-col gap-1.5'
          control={form.control}
          label='Trạng thái'
          name='status'
          options={KEY_CONNECTION_STATUS_OPTIONS}
          required
        />
        <FormInput
          className='flex flex-col gap-1.5'
          control={form.control}
          label='Mã merchant'
          name='merchantCode'
          required
        />
        <FormInput
          className='flex flex-col gap-1.5'
          control={form.control}
          label='Client ID'
          name='clientId'
          required
        />
        <FormInput
          className='flex flex-col gap-1.5'
          control={form.control}
          label='Secret đã che'
          name='maskedSecret'
          placeholder='••••••••••••4F2A'
          required
        />
        <FormInput
          className='flex flex-col gap-1.5'
          control={form.control}
          label='Webhook URL'
          name='webhookUrl'
          placeholder='https://merchant.example.vn/ipn'
          required
        />
        <FormTextArea
          className='flex flex-col gap-1.5 md:col-span-2'
          control={form.control}
          label='IP whitelist'
          name='ipWhitelist'
          placeholder='Mỗi IP một dòng hoặc ngăn cách bằng dấu phẩy'
          rows={3}
        />
      </form>
    </DialogModal>
  )
}

export function KeyConnectionDialog({
  open,
  ...rest
}: KeyConnectionDialogProps) {
  if (!open) return null

  return <KeyConnectionDialogContent {...rest} />
}
