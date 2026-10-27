import type { ReactNode } from 'react'
import type { ColumnType } from 'antd/es/table'
import {
  EyeIcon,
  LockIcon,
  LockOpenIcon,
  PencilSimpleIcon
} from '@phosphor-icons/react'

import { Can } from '@/app/permissions'
import {
  ButtonComponent,
  TagComponent,
  TooltipComponent
} from '@components/index'

import { ManagementStatusTag } from '../../shared/ManagementStatusTag'
import type { SubMerchantRow } from '../types/subMerchant.type'

interface SubMerchantColumnActions {
  page: number
  pageSize: number
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
          ? 'border-danger-strong/70! bg-background!  text-danger-strong! shadow-none! hover:bg-danger/10!'
          : tone === 'success'
            ? 'border-success-strong/40! bg-background!  text-success-strong! shadow-none! hover:bg-success-strong/10!'
            : 'border-border! bg-background!  text-foreground! shadow-none! hover:bg-muted!'
      }
      danger={tone === 'danger'}
      htmlType='button'
      icon={icon}
      onClick={onClick}
      size='small'
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
          <span className='truncate font-semibold text-foreground'>
            {row.name}
          </span>
          {row.isDefault && <TagComponent>Mặc định</TagComponent>}
        </span>
        <span className='text-xs text-muted-foreground tabular-nums'>
          {row.code}
        </span>
      </div>
    )
  },
  {
    title: 'Merchant cha',
    width: 210,
    render: (_, row) => (
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span className='truncate text-foreground'>
          {row.parentMerchantName}
        </span>
        <span className='text-xs text-muted-foreground'>
          {row.parentMerchantCode}
        </span>
      </div>
    )
  },
  {
    title: 'Liên hệ',
    width: 220,
    render: (_, row) => (
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span>{row.phone}</span>
      </div>
    )
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
  width: 140,
  render: (_, row) => {
    const isActive = row.status === 'ACTIVE'
    const statusLabel = `${isActive ? 'Khóa' : 'Mở khóa'} Sub-merchant ${row.name}`

    return (
      <div className='flex items-center justify-center gap-1'>
        <Can
          screen='MERCHANT_SUB_MERCHANT'
          action='viewDetail'
        >
          {renderActionButton(
            `Xem Sub-merchant ${row.name}`,
            <EyeIcon
              aria-hidden
              size={15}
            />,
            () => onView(row)
          )}
        </Can>
        {row.status !== 'SUSPENDED_BY_PARENT' && (
          <Can
            screen='MERCHANT_SUB_MERCHANT'
            action='edit'
          >
            {renderActionButton(
              `Sửa Sub-merchant ${row.name}`,
              <PencilSimpleIcon
                aria-hidden
                size={15}
              />,
              () => onEdit(row)
            )}
          </Can>
        )}
        <Can
          screen='MERCHANT_SUB_MERCHANT'
          action={isActive ? 'lock' : 'unlock'}
        >
          {renderActionButton(
            statusLabel,
            isActive ? (
              <LockIcon
                aria-hidden
                size={15}
              />
            ) : (
              <LockOpenIcon
                aria-hidden
                size={15}
              />
            ),
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
): ColumnType<SubMerchantRow>[] => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) =>
      (actions.page - 1) * actions.pageSize + index + 1
  },
  ...BASE_COLUMNS,
  createActionColumn(actions)
]
