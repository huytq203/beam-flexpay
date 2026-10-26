import { useGetSettlementItemDetailQuery } from '@/app/services/merchantSettlementItemApi'
import { ButtonComponent, DrawerComponent } from '@components/index'
import { describeSettlementError } from '../utils/settlementItem.utils'
import {
  IntegrityChecks,
  SettlementItemInfo,
  SnapshotSection
} from './SettlementItemDetailSections'
import { SettlementItemLines } from './SettlementItemLines'

interface Props {
  itemId: string
  onClose: () => void
}

/** FR-MER-0623: chi tiết một mục quyết toán, chỉ đọc. */
export function SettlementItemDetailDrawer({ itemId, onClose }: Props) {
  const { data, isFetching, isError, error, refetch } =
    useGetSettlementItemDetailQuery(itemId)
  const item = data?.id === itemId ? data : undefined

  return (
    <DrawerComponent
      open
      width={640}
      title='Chi tiết mục quyết toán'
      onClose={onClose}
      loading={isFetching && !item}
    >
      {isError && !item && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
        >
          {describeSettlementError(error, 'detail')}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void refetch()}
          />
        </div>
      )}
      {item && (
        <>
          <IntegrityChecks item={item} />
          <SettlementItemInfo item={item} />
          <SettlementItemLines lines={item.lines} />
          <SnapshotSection
            title='Căn cứ phí lúc thanh toán'
            data={item.feeQuoteSnapshot}
          />
          <SnapshotSection
            title='Căn cứ tạm giữ lúc thanh toán'
            data={item.holdRuleSnapshot}
          />
        </>
      )}
    </DrawerComponent>
  )
}
