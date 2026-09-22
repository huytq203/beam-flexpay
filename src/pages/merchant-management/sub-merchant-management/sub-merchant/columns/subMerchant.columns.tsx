import type { ReactNode } from 'react'
import type { ColumnType } from 'antd/es/table'
import { EyeIcon, LockIcon, LockOpenIcon, PencilSimpleIcon } from '@phosphor-icons/react'

import { Can } from '@/app/permissions'
import { ButtonComponent, TagComponent, TooltipComponent } from '@components/index'

import { ManagementStatusTag } from '../../shared/ManagementStatusTag'
import { SubMerchantTerminalCount } from '../components/SubMerchantTerminalCount'
import type { SubMerchantRow } from '../types/subMerchant.type'
import { formatVnd } from '../utils/subMerchant.utils'

interface SubMerchantColumnActions {
  onView: (row: SubMerchantRow) => void
  onEdit: (row: SubMerchantRow) => void
  onStatus: (row: SubMerchantRow) => void
}

const renderActionButton = (
  label: string,
  icon: ReactNode,
  onClick: () => void,
  tone: 'neutral' | 'danger' | 'success' = 'neutral'
) => (
  <TooltipComponent title={label}>
    <ButtonComponent
      aria-label={label}
      className={
        tone === 'danger'
          ? 'size-8! border-danger-strong/70! bg-background! p-0! text-danger-strong! shadow-none! hover:bg-danger/10!'
          : tone === 'success'
            ? 'size-8! border-success-strong/40! bg-background! p-0! text-success-strong! shadow-none! hover:bg-success-strong/10!'
            : 'size-8! border-border! bg-background! p-0! text-foreground! shadow-none! hover:bg-muted!'
      }
      danger={tone === 'danger'}
      htmlType='button'
      icon={icon}
      onClick={onClick}
      type='default'
    />
  </TooltipComponent>
)

const BASE_COLUMNS: ColumnType<SubMerchantRow>[] = [
  {
    title: 'Sub-merchant',
    width: 220,
    render: (_, row) => (
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span className='flex flex-wrap items-center gap-1'>
          <span className='truncate font-semibold text-foreground'>{row.name}</span>
          {row.isDefault && <TagComponent>Mặc định</TagComponent>}
        </span>
        <span className='text-xs text-muted-foreground tabular-nums'>{row.code}</span>
      </div>
    )
  },
  {
    title: 'Merchant cha',
    width: 210,
    render: (_, row) => (
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span className='truncate text-foreground'>{row.parentMerchantName}</span>
        <span className='text-xs text-muted-foreground'>{row.parentMerchantCode}</span>
      </div>
    )
  },
  {
    title: 'Liên hệ', width: 220,
    render: (_, row) => (
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span>{row.phone}</span>
        <span className='break-all text-xs text-muted-foreground'>{row.email}</span>
      </div>
    )
  },
  {
    title: 'Số dư khả dụng',
    dataIndex: 'availableBalance',
    align: 'right',
    width: 170,
    render: (value: number) => <span className='font-medium tabular-nums'>{formatVnd(value)}</span>
  },
  {
    title: 'Terminal',
    align: 'center',
    width: 90,
    render: (_, row) => <SubMerchantTerminalCount id={row.id} />
  },
  {
    title: 'Trạng thái',
    width: 170,
    render: (_, row) => <ManagementStatusTag status={row.status} />
  },
  { title: 'Ngày tạo', dataIndex: 'createdAt', width: 120 }
]

const createActionColumn = ({
  onView,
  onEdit,
  onStatus
}: SubMerchantColumnActions): ColumnType<SubMerchantRow> => ({
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 150,
    render: (_, row) => {
      const isActive = row.status === 'ACTIVE'
      const statusLabel = `${isActive ? 'Khóa' : 'Mở khóa'} Sub-merchant ${row.name}`

      return (
        <div className='flex items-center justify-center gap-1'>
          <Can screen='MERCHANT_SUB_MERCHANT' action='viewDetail'>
            {renderActionButton(`Xem Sub-merchant ${row.name}`, <EyeIcon aria-hidden size={18} />, () => onView(row))}
          </Can>
          {row.status !== 'SUSPENDED_BY_PARENT' && (
            <Can screen='MERCHANT_SUB_MERCHANT' action='edit'>
              {renderActionButton(`Sửa Sub-merchant ${row.name}`, <PencilSimpleIcon aria-hidden size={18} />, () => onEdit(row))}
            </Can>
          )}
          <Can screen='MERCHANT_SUB_MERCHANT' action={isActive ? 'lock' : 'unlock'}>
            {renderActionButton(
              statusLabel,
              isActive ? <LockIcon aria-hidden size={18} /> : <LockOpenIcon aria-hidden size={18} />,
              () => onStatus(row),
              isActive ? 'danger' : 'success'
            )}
          </Can>
        </div>
      )
    }
  })

export const createSubMerchantColumns = (
  actions: SubMerchantColumnActions
): ColumnType<SubMerchantRow>[] => [...BASE_COLUMNS, createActionColumn(actions)]
