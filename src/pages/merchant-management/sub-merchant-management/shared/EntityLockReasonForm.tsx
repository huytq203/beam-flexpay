import { zodResolver } from '@hookform/resolvers/zod'
import { FormTextArea } from '@components/form'
import { useForm } from 'react-hook-form'

import {
  entityLockReasonSchema,
  type EntityLockReasonValues
} from './entityLock.schema'

interface EntityLockReasonFormProps {
  formId: string
  isLock: boolean
  onConfirm: (reason: string) => void
  previousReason?: string
}

export function EntityLockReasonForm({
  formId,
  isLock,
  onConfirm,
  previousReason
}: EntityLockReasonFormProps) {
  const { control, handleSubmit } = useForm<EntityLockReasonValues>({
    defaultValues: { reason: '' },
    resolver: zodResolver(entityLockReasonSchema)
  })
  const reasonLabel = `Lý do ${isLock ? 'khóa' : 'mở khóa'}`

  return (
    <form id={formId} noValidate onSubmit={handleSubmit(({ reason }) => onConfirm(reason.trim()))}>
      <div className='flex flex-col gap-4'>
        {previousReason && <EntityLockPreviousReason reason={previousReason} />}
        <FormTextArea
          aria-label={reasonLabel}
          aria-required
          className='flex flex-col gap-2'
          classNameLable='text-sm font-medium text-foreground'
          control={control}
          label={
            <span>
              {reasonLabel} <span aria-hidden className='text-danger-strong'>*</span>
            </span>
          }
          maxLength={500}
          name='reason'
          placeholder={`Nêu lý do ${isLock ? 'khóa' : 'mở khóa'} (tối thiểu 10 ký tự)`}
          rows={4}
        />
      </div>
    </form>
  )
}

function EntityLockPreviousReason({ reason }: { reason: string }) {
  return (
    <div className='rounded-lg border border-border bg-muted/50 p-3'>
      <p className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
        Lý do khóa trước đó
      </p>
      <p className='mt-1 text-sm text-foreground'>{reason}</p>
    </div>
  )
}
