import { FireIcon } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { getFreezeRowActionFlags } from '@utils/freeze'
import type { FreezeItem } from '@type/freeze.type'

interface FreezeRowActionsProps {
  item: FreezeItem
  onRequestUnfreeze?: (item: FreezeItem) => void
}

const EMPTY = <span className='text-muted-foreground'>--</span>

export const FreezeRowActions = ({
  item,
  onRequestUnfreeze
}: FreezeRowActionsProps) => {
  const { canRequestUnfreeze } = getFreezeRowActionFlags(item)

  if (!canRequestUnfreeze) return EMPTY

  return (
    <div className='flex flex-wrap items-center justify-center gap-1'>
      <TooltipComponent title='Mở băng'>
        <ButtonComponent
          htmlType='button'
          size='small'
          type='default'
          aria-label='Mở băng'
          icon={
            <FireIcon
              aria-hidden
              size={16}
            />
          }
          onClick={() => onRequestUnfreeze?.(item)}
        />
      </TooltipComponent>
    </div>
  )
}
