import { StatusToneBadge } from '@components/status-badge/StatusToneBadge'
import {
  SYNC_STATE_LABEL,
  SYNC_STATE_TONE
} from '../constants/rolePermissionMatrix.constants'
import type { AdminSyncState } from '../types/rolePermissionMatrix.types'

export function SyncStateTag({ state }: { state: AdminSyncState }) {
  return (
    <StatusToneBadge tone={SYNC_STATE_TONE[state] ?? 'normal'}>
      {SYNC_STATE_LABEL[state] ?? state}
    </StatusToneBadge>
  )
}
