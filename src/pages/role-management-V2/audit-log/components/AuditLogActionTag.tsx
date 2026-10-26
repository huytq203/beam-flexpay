import { TagComponent } from '@components/index'
import {
  AUDIT_ACTION_TONES,
  AUDIT_ACTION_LABELS
} from '../constants/auditLog.constants'
import type { AuditLogAction } from '../types/auditLog.types'
import { actionLabel } from '../utils/auditLog.utils'

export function AuditLogActionTag({ action }: { action: string }) {
  const known = action in AUDIT_ACTION_LABELS
  return (
    <TagComponent
      color={known ? AUDIT_ACTION_TONES[action as AuditLogAction] : undefined}
    >
      {actionLabel(action)}
    </TagComponent>
  )
}
