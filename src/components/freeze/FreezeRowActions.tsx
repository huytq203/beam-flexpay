import { ButtonComponent } from '@components/index'
import { getFreezeRowActionFlags } from '@utils/freeze'
import type { FreezeItem } from '@type/freeze.type'

interface FreezeRowActionsProps {
  item: FreezeItem
  onRequestUnfreeze?: (item: FreezeItem) => void
}

const EMPTY = <span className="text-muted-foreground">--</span>

export const FreezeRowActions = ({
  item,
  onRequestUnfreeze
}: FreezeRowActionsProps) => {
  const { canRequestUnfreeze } = getFreezeRowActionFlags(item)

  if (!canRequestUnfreeze) return EMPTY

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      <ButtonComponent
        size="small"
        type="default"
        onClick={() => onRequestUnfreeze?.(item)}
        content="Mở băng"
      />
    </div>
  )
}
