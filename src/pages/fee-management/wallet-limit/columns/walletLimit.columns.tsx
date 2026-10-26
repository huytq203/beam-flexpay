import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import { EyeIcon, PencilLineIcon } from '@components/icons'
import {
  ButtonComponent,
  TagComponent,
  TooltipComponent
} from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import type {
  WalletLimitBankOverride,
  WalletLimitPolicy,
  WalletLimitScope
} from '@type/walletLimit.type'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  PAYMENT_METHOD_LABELS,
  SCOPE_LABELS,
  TRANSACTION_TYPE_LABELS
} from '../constants/walletLimit.constants'
import { formatLimitMoney, getRowNumber } from '../utils/walletLimit.format'
import { describePolicyTarget } from '../utils/walletLimit.paths'

type Columns = NonNullable<TableProps<WalletLimitPolicy>['columns']>

interface WalletLimitColumnOptions {
  page: number
  size: number
  onView: (id: string) => void
  onEdit: (id: string) => void
}

const SCOPE_COLORS: Record<WalletLimitScope, string> = {
  SYSTEM: 'geekblue',
  GROUP: 'purple',
  WALLET: 'cyan'
}

const subTextClass = 'block text-xs text-muted-foreground'

const renderMoney = (value: number | null) => (
  <span
    className={
      value == null
        ? 'whitespace-nowrap text-xs text-muted-foreground'
        : 'whitespace-nowrap font-medium tabular-nums'
    }
  >
    {formatLimitMoney(value)}
  </span>
)

const moneyColumn = (
  title: string,
  pick: (record: WalletLimitPolicy) => number | null,
  width: number
): Columns[number] => ({
  title,
  align: 'right',
  width,
  render: (_value, record) => renderMoney(pick(record))
})

const overrideLabel = (override: WalletLimitBankOverride): string => {
  const target =
    override.bankCode ??
    (override.paymentMethod
      ? PAYMENT_METHOD_LABELS[override.paymentMethod]
      : '')
  return [target, TRANSACTION_TYPE_LABELS[override.transactionType]]
    .filter(Boolean)
    .join(' · ')
}

const overrideKey = (override: WalletLimitBankOverride, index: number) =>
  override.id ?? `${override.transactionType}-${override.bankCode}-${index}`

const renderStatus = (record: WalletLimitPolicy) => (
  <StatusBadge status={record.status} />
)

const renderUpdated = (record: WalletLimitPolicy) => {
  const hasUpdate = Boolean(record.updatedAt)
  const at = hasUpdate ? record.updatedAt : record.createdAt
  const by = hasUpdate ? record.updatedByUsername : record.createdByUsername
  return (
    <>
      <span className='whitespace-nowrap tabular-nums'>
        {formatUTCToLocalDateTime(at)}
      </span>
      {by && <span className={subTextClass}>{by}</span>}
    </>
  )
}

const renderActions = (
  record: WalletLimitPolicy,
  onView: (id: string) => void,
  onEdit: (id: string) => void
) => {
  const target = describePolicyTarget(
    SCOPE_LABELS[record.scopeType],
    record.targetDisplay,
    TRANSACTION_TYPE_LABELS[record.transactionType]
  )
  return (
    <div className='flex items-center justify-center gap-1'>
      <TooltipComponent title='Xem chi tiết'>
        <ButtonComponent
          type='default'
          size='small'
          htmlType='button'
          aria-label={`Xem chi tiết ${target}`}
          icon={
            <EyeIcon
              aria-hidden
              size={18}
            />
          }
          onClick={() => onView(record.id)}
        />
      </TooltipComponent>
      <Can
        screen='WALLET_LIMIT'
        action='edit'
      >
        <TooltipComponent title='Cập nhật'>
          <ButtonComponent
            type='default'
            size='small'
            htmlType='button'
            aria-label={`Cập nhật ${target}`}
            icon={
              <PencilLineIcon
                aria-hidden
                size={18}
              />
            }
            onClick={() => onEdit(record.id)}
          />
        </TooltipComponent>
      </Can>
    </div>
  )
}

export const createWalletLimitColumns = ({
  page,
  size,
  onView,
  onEdit
}: WalletLimitColumnOptions): Columns => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _record, index) => getRowNumber(page, size, index)
  },
  {
    title: 'Đối tượng',
    width: 110,
    render: (_value, record) => (
      <TagComponent color={SCOPE_COLORS[record.scopeType]}>
        {SCOPE_LABELS[record.scopeType]}
      </TagComponent>
    )
  },
  {
    title: 'Mã định danh',
    width: 170,
    render: (_value, record) =>
      record.targetDisplay ? (
        <span className='font-medium'>{record.targetDisplay}</span>
      ) : (
        <span className='text-xs text-muted-foreground'>Toàn hệ thống</span>
      )
  },
  {
    title: 'Loại giao dịch',
    width: 150,
    render: (_value, record) => (
      <>
        {TRANSACTION_TYPE_LABELS[record.transactionType]}
        {record.walletType === 'ALL' && (
          <span className={subTextClass}>Loại ví: Tất cả</span>
        )}
      </>
    )
  },
  moneyColumn('Tối thiểu/GD', (record) => record.minPerTransaction, 140),
  moneyColumn('Tối đa/GD', (record) => record.maxPerTransaction, 150),
  moneyColumn('Hạn mức ngày', (record) => record.dailyMaximum, 160),
  moneyColumn('Tháng thường', (record) => record.normalMonthlyMaximum, 160),
  moneyColumn('Tháng đặc biệt', (record) => record.specialMonthlyMaximum, 160),
  {
    title: 'Theo ngân hàng / phương thức',
    width: 260,
    render: (_value, record) =>
      record.bankOverrides.length ? (
        <div className='flex flex-wrap gap-1'>
          {record.bankOverrides.map((override, index) => (
            <TagComponent
              key={overrideKey(override, index)}
              className='m-0'
            >
              {overrideLabel(override)}
            </TagComponent>
          ))}
        </div>
      ) : (
        <span className='text-xs text-muted-foreground'>Không có</span>
      )
  },
  {
    title: 'Trạng thái',
    width: 130,
    render: (_value, record) => renderStatus(record)
  },
  {
    title: 'Cập nhật',
    width: 180,
    render: (_value, record) => renderUpdated(record)
  },
  {
    title: 'Thao tác',
    fixed: 'right',
    align: 'center',
    width: 100,
    render: (_value, record) => renderActions(record, onView, onEdit)
  }
]
