import type { Control } from 'react-hook-form'

import { FormInput, FormSelect, FormTextArea } from '@components/form'

import {
  KEY_CONNECTION_SCOPE_OPTIONS,
  KEY_CONNECTION_STATUS_OPTIONS
} from '../schemas/keyConnection.schema'
import type { KeyConnectionDialogValues } from '../schemas/keyConnection.schema'

interface KeyConnectionFormFieldsProps {
  control: Control<KeyConnectionDialogValues>
}

export function KeyConnectionMetadataFields({
  control
}: KeyConnectionFormFieldsProps) {
  return (
    <>
      <FormSelect className='flex flex-col gap-1.5' control={control} label='Cấp áp dụng' name='scope' options={KEY_CONNECTION_SCOPE_OPTIONS} required />
      <FormSelect className='flex flex-col gap-1.5' control={control} label='Trạng thái' name='status' options={KEY_CONNECTION_STATUS_OPTIONS} required />
      <FormInput className='flex flex-col gap-1.5' control={control} label='Mã merchant' name='merchantCode' required />
      <FormInput className='flex flex-col gap-1.5' control={control} label='Client ID' name='clientId' required />
    </>
  )
}

export function KeyConnectionEndpointFields({
  control
}: KeyConnectionFormFieldsProps) {
  return (
    <>
      <FormInput className='flex flex-col gap-1.5' control={control} label='Secret đã che' name='maskedSecret' placeholder='••••••••••••4F2A' required />
      <FormInput className='flex flex-col gap-1.5' control={control} label='Webhook URL' name='webhookUrl' placeholder='https://merchant.example.vn/ipn' required />
      <FormTextArea className='flex flex-col gap-1.5 md:col-span-2' control={control} label='IP whitelist' name='ipWhitelist' placeholder='Mỗi IP một dòng hoặc ngăn cách bằng dấu phẩy' rows={3} />
    </>
  )
}
