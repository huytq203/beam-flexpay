import type { ReactNode } from 'react'

export type ManagementListState = 'loading' | 'error' | 'empty' | 'success'

export type EntityStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'TERMINATED'
  | 'LOCKED'
  | 'SUSPENDED_BY_PARENT'
  | 'SUSPENDED_BY_SUB'

export type EntityLockMode = 'lock' | 'unlock'

export interface EntityLockDialogProps {
  open: boolean
  mode: EntityLockMode
  entityLabel: string
  blockedMessage?: string
  previousReason?: string
  context?: ReactNode
  lockWarning?: string
  onCancel: () => void
  onConfirm: (reason: string) => void
}

export interface ManagementPageHeaderProps {
  title: string
  description?: string
  total?: number
  primaryAction?: ReactNode
  actions?: ReactNode
}

export interface ManagementTableStateProps {
  state: ManagementListState
  entityName: string
  onRetry?: () => void
  emptyKind?: 'initial' | 'filtered'
  children?: ReactNode
}

export interface ManagementStatusTagProps {
  status: EntityStatus
  className?: string
}
