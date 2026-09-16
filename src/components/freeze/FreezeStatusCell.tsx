import StatusBadge from '@components/status-badge/StatusBadge'
import { FREEZE_STATUS_CONFIG } from '@constants/freeze.constant'
import type { FreezeItem } from '@type/freeze.type'

interface FreezeStatusCellProps {
  item: FreezeItem
}

export const FreezeStatusCell = ({ item }: FreezeStatusCellProps) => (
  <StatusBadge
    status={item.displayStatus}
    config={FREEZE_STATUS_CONFIG}
  />
)
