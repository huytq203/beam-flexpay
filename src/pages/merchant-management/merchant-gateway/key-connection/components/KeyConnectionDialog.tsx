import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { ButtonComponent, DialogModal } from '@components/index'

import {
  keyConnectionDialogSchema,
  parseIpWhitelist
} from '../schemas/keyConnection.schema'
import type { KeyConnectionFormValues } from '../schemas/keyConnection.schema'
import type { KeyConnectionRow } from '../types/keyConnection.type'
import {
  KeyConnectionEndpointFields,
  KeyConnectionMetadataFields
} from './KeyConnectionFormFields'

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

interface KeyConnectionDialogFooterProps {
  isEditing: boolean
  onCancel: () => void
}

function KeyConnectionDialogFooter({
  isEditing,
  onCancel
}: KeyConnectionDialogFooterProps) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
      <ButtonComponent block className='sm:w-auto!' content='Hủy' htmlType='button' onClick={onCancel} type='default' />
      <ButtonComponent block className='sm:w-auto!' content={isEditing ? 'Lưu thay đổi' : 'Thêm mới Key'} form={FORM_ID} htmlType='submit' />
    </div>
  )
}

function KeyConnectionDialogContent({ row, onSave, onCancel }: Omit<KeyConnectionDialogProps, 'open'>) {
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
      footer={<KeyConnectionDialogFooter isEditing={isEditing} onCancel={onCancel} />}
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
        <KeyConnectionMetadataFields control={form.control} />
        <KeyConnectionEndpointFields control={form.control} />
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
