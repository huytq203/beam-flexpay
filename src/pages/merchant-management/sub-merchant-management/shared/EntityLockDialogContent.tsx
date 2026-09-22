import { LockFilled, LockKeyOpenIcon } from '@components/icons'
import { DialogModal } from '@components/index'

import { EntityLockDialogBody } from './EntityLockDialogBody'
import { EntityLockDialogFooter } from './EntityLockDialogFooter'
import { ENTITY_LOCK_FORM_ID } from './entityLock.constants'
import type { EntityLockDialogProps } from './management.types'

export function EntityLockDialogContent({
  mode,
  entityLabel,
  blockedMessage,
  previousReason,
  onCancel,
  onConfirm
}: EntityLockDialogProps) {
  const isLock = mode === 'lock'

  return (
    <DialogModal
      footer={
        <EntityLockDialogFooter
          blocked={Boolean(blockedMessage)}
          formId={ENTITY_LOCK_FORM_ID}
          isLock={isLock}
          onCancel={onCancel}
        />
      }
      mode={isLock ? 'DELETE' : 'CONFIRM'}
      onCancel={onCancel}
      onOk={() => undefined}
      open
      title={
        <span className='flex items-center gap-2 text-secondary-foreground'>
          {isLock ? <LockFilled aria-hidden /> : <LockKeyOpenIcon aria-hidden size={18} />}
          Xác nhận {isLock ? 'khóa' : 'mở khóa'}
        </span>
      }
    >
      <EntityLockDialogBody
        blockedMessage={blockedMessage}
        entityLabel={entityLabel}
        formId={ENTITY_LOCK_FORM_ID}
        isLock={isLock}
        onConfirm={onConfirm}
        previousReason={previousReason}
      />
    </DialogModal>
  )
}
