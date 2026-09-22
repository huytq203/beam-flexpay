import { EntityLockDialog } from '../../shared/EntityLockDialog'
import type { SubMerchantRow } from '../types/subMerchant.type'
import { formatVnd } from '../utils/subMerchant.utils'

interface SubMerchantLockDialogProps {
  record: SubMerchantRow | null
  open: boolean
  onCancel: () => void
  onConfirm: (reason: string) => void
}

export function SubMerchantLockDialog({ record, ...props }: SubMerchantLockDialogProps) {
  return (
    <EntityLockDialog
      {...props}
      blockedMessage={record?.status === 'SUSPENDED_BY_PARENT' ? 'Cần mở khóa Merchant cha trước' : undefined}
      context={record && (
        <dl className='flex flex-wrap items-center justify-between gap-2 text-sm'>
          <dt className='text-muted-foreground'>Số dư hiện tại</dt>
          <dd className='font-semibold text-foreground tabular-nums'>{formatVnd(record.availableBalance)}</dd>
        </dl>
      )}
      entityLabel={record ? `${record.name} (${record.code})` : ''}
      lockWarning='Khóa Sub-merchant sẽ làm gián đoạn thanh toán và rút tiền tại điểm bán, bao gồm các Terminal trực thuộc.'
      mode={record?.status === 'ACTIVE' ? 'lock' : 'unlock'}
      previousReason={record?.lastLockReason}
    />
  )
}
