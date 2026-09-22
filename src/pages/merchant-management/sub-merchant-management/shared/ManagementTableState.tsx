import type { ManagementTableStateProps } from './management.types'
import {
  ManagementEmptyState,
  ManagementErrorState,
  ManagementLoadingState
} from './ManagementTableStateViews'

export function ManagementTableState({
  state,
  entityName,
  onRetry,
  emptyKind = 'initial',
  children
}: ManagementTableStateProps) {
  if (state === 'success') return <>{children}</>
  if (state === 'loading') return <ManagementLoadingState entityName={entityName} />
  if (state === 'error') return <ManagementErrorState entityName={entityName} onRetry={onRetry} />

  return <ManagementEmptyState entityName={entityName} kind={emptyKind} onRetry={onRetry} />
}
