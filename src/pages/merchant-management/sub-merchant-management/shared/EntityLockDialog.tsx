import { EntityLockDialogContent } from './EntityLockDialogContent'
import type { EntityLockDialogProps } from './management.types'

export function EntityLockDialog(props: EntityLockDialogProps) {
  if (!props.open) return null

  return <EntityLockDialogContent {...props} />
}
