import { useState } from 'react'

import { LockFilled, LockKeyOpenIcon } from '@components/icons'
import { ButtonComponent, DialogModal, TextArea } from '@components/index'
import { cn } from '@lib/utils/cn'

import type { EntityLockDialogProps } from './management.types'

const MIN_REASON_LENGTH = 10

export function EntityLockDialog({
  open,
  mode,
  entityLabel,
  blockedMessage,
  previousReason,
  onCancel,
  onConfirm
}: EntityLockDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const isLock = mode === 'lock'
  const actionLabel = isLock ? 'Khóa' : 'Mở khóa'
  const reasonLabel = `Lý do ${isLock ? 'khóa' : 'mở khóa'}`
  const isBlocked = Boolean(blockedMessage)

  if (!open) return null

  const handleSubmit = (): void => {
    const trimmedReason = reason.trim()

    if (trimmedReason.length < MIN_REASON_LENGTH) {
      setError(`Lý do cần có ít nhất ${MIN_REASON_LENGTH} ký tự.`)
      return
    }

    setError(undefined)
    onConfirm(trimmedReason)
  }

  return (
    <DialogModal
      footer={
        <div className='flex flex-col gap-2 md:flex-row md:justify-end'>
          <ButtonComponent
            block
            content='Hủy'
            htmlType='button'
            onClick={onCancel}
            type='default'
            className='md:w-auto!'
          />
          <ButtonComponent
            block
            content={actionLabel}
            danger={isLock}
            disabled={isBlocked}
            htmlType='button'
            onClick={handleSubmit}
            className='md:w-auto!'
          />
        </div>
      }
      mode={isLock ? 'DELETE' : 'CONFIRM'}
      onCancel={onCancel}
      onOk={handleSubmit}
      open={open}
      title={
        <span className='flex items-center gap-2 text-secondary-foreground'>
          {isLock ? <LockFilled aria-hidden /> : <LockKeyOpenIcon aria-hidden size={18} />}
          Xác nhận {isLock ? 'khóa' : 'mở khóa'}
        </span>
      }
    >
      <div className='flex flex-col gap-4'>
        <p className='text-sm text-foreground'>
          Thao tác với <strong className='font-semibold'>{entityLabel}</strong> sẽ được ghi Audit Log.
        </p>

        {blockedMessage ? (
          <p
            className='rounded-lg border border-warning-strong/30 bg-warning/10 p-3 text-sm text-warning-strong'
            role='alert'
          >
            {blockedMessage}
          </p>
        ) : (
          <>
            {previousReason && (
              <div className='rounded-lg border border-border bg-muted/50 p-3'>
                <p className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
                  Lý do khóa trước đó
                </p>
                <p className='mt-1 text-sm text-foreground'>{previousReason}</p>
              </div>
            )}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-foreground' htmlFor='entity-lock-reason'>
                {reasonLabel}{' '}
                <span aria-hidden className='text-danger-strong'>
                  *
                </span>
              </label>
              <TextArea
                aria-describedby={error ? 'entity-lock-reason-error' : undefined}
                aria-invalid={Boolean(error)}
                aria-label={reasonLabel}
                id='entity-lock-reason'
                maxLength={500}
                onChange={(event) => setReason(event.target.value)}
                placeholder={`Nêu lý do ${isLock ? 'khóa' : 'mở khóa'} (tối thiểu 10 ký tự)`}
                rows={4}
                value={reason}
              />
              {error && (
                <p
                  className={cn('text-xs font-medium text-danger-strong')}
                  id='entity-lock-reason-error'
                  role='alert'
                >
                  {error}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </DialogModal>
  )
}
