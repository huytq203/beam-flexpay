import type { ReactNode } from 'react'

import { EntityLockReasonForm } from './EntityLockReasonForm'

interface EntityLockDialogBodyProps {
  blockedMessage?: string
  entityLabel: string
  formId: string
  isLock: boolean
  onConfirm: (reason: string) => void
  previousReason?: string
  context?: ReactNode
  lockWarning?: string
}

export function EntityLockDialogBody({
  blockedMessage,
  entityLabel,
  formId,
  isLock,
  onConfirm,
  previousReason,
  context,
  lockWarning
}: EntityLockDialogBodyProps) {
  return (
    <div className='flex flex-col gap-4'>
      <p className='text-sm text-foreground'>
        Xác nhận {isLock ? 'khóa' : 'mở khóa'} <strong className='font-semibold'>{entityLabel}</strong>.
      </p>
      {context}
      {isLock && lockWarning && (
        <p className='rounded-lg border border-danger-strong/30 bg-danger/5 p-3 text-sm text-danger-strong' role='alert'>
          {lockWarning}
        </p>
      )}
      {blockedMessage ? (
        <p
          className='rounded-lg border border-warning-strong/30 bg-warning/10 p-3 text-sm text-warning-strong'
          role='alert'
        >
          {blockedMessage}
        </p>
      ) : (
        <EntityLockReasonForm
          formId={formId}
          isLock={isLock}
          onConfirm={onConfirm}
          previousReason={previousReason}
        />
      )}
    </div>
  )
}
