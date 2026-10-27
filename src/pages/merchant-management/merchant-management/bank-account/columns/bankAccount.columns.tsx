import type { ReactNode } from 'react'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckIcon,
  EyeIcon,
  PauseCircleIcon,
  PencilSimpleIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  StarIcon,
  TrashIcon,
  XIcon
} from '@phosphor-icons/react'
import { Can } from '@/app/permissions'
import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  ButtonComponent,
  TagComponent,
  TooltipComponent
} from '@components/index'
import type { BankAccountDecisionType } from '../components/BankAccountDecisionDialog'
import { LINK_STATUS } from '../constants/bankAccount.constants'
import { maskAccountNumber } from '../utils/bankAccount.utils'

export type BankAccountActionType = 'default' | 'hold' | 'verify'

interface BankAccountColumnOptions {
  page: number
  size: number
  merchantName: (id?: string) => string
  onEdit: (row: BankAccountDto) => void
  onView: (row: BankAccountDto) => void
  onDelete: (row: BankAccountDto) => void
  onAction: (type: BankAccountActionType, row: BankAccountDto) => void
  onDecide: (type: BankAccountDecisionType, row: BankAccountDto) => void
  /** JWT subject của người đang đăng nhập; BE so với `requestedBy`. */
  currentUserId: string
}

const ICON_SIZE = 15

const renderIconAction = (
  label: string,
  icon: ReactNode,
  onClick: () => void,
  danger = false
) => (
  <TooltipComponent title={label}>
    <ButtonComponent
      aria-label={label}
      size='small'
      type='default'
      danger={danger}
      icon={icon}
      onClick={onClick}
    />
  </TooltipComponent>
)

/**
 * Có yêu cầu chờ duyệt thì chỉ còn Phê duyệt / Từ chối, các nút sửa bị ẩn.
 * Người gửi yêu cầu không được tự duyệt (BE trả 403) nên không thấy hai nút.
 */
const renderDecisionActions = (
  row: BankAccountDto,
  { onDecide, currentUserId }: BankAccountColumnOptions
) =>
  row.pendingChangeRequest?.requestedBy === currentUserId ? (
    <span className='text-xs text-muted-foreground'>Chờ người khác duyệt</span>
  ) : (
    <Can
      screen='MERCHANT_BANK_ACCOUNT'
      action='approve'
    >
      <div className='flex justify-center gap-1'>
        {renderIconAction(
          'Phê duyệt',
          <CheckIcon
            aria-hidden
            size={ICON_SIZE}
          />,
          () => onDecide('approve', row)
        )}
        {renderIconAction(
          'Từ chối',
          <XIcon
            aria-hidden
            size={ICON_SIZE}
          />,
          () => onDecide('reject', row),
          true
        )}
      </div>
    </Can>
  )

/** Tài khoản không có yêu cầu chờ duyệt: sửa, xác minh, mặc định, tạm giữ, xóa. */
const renderManageActions = (
  row: BankAccountDto,
  { onEdit, onAction, onDelete }: BankAccountColumnOptions
) => (
  <Can
    screen='MERCHANT_BANK_ACCOUNT'
    action='edit'
  >
    <div className='flex justify-center gap-1'>
      {renderIconAction(
        'Sửa',
        <PencilSimpleIcon
          aria-hidden
          size={ICON_SIZE}
        />,
        () => onEdit(row)
      )}
      {row.linkStatus === 'PENDING_VERIFICATION' &&
        renderIconAction(
          'Xác minh',
          <ShieldCheckIcon
            aria-hidden
            size={ICON_SIZE}
          />,
          () => onAction('verify', row)
        )}
      {!row.isDefault &&
        renderIconAction(
          'Mặc định',
          <StarIcon
            aria-hidden
            size={ICON_SIZE}
          />,
          () => onAction('default', row)
        )}
      {renderIconAction(
        row.holdMode ? 'Bỏ giữ' : 'Tạm giữ',
        row.holdMode ? (
          <PlayCircleIcon
            aria-hidden
            size={ICON_SIZE}
          />
        ) : (
          <PauseCircleIcon
            aria-hidden
            size={ICON_SIZE}
          />
        ),
        () => onAction('hold', row)
      )}
      <Can
        screen='MERCHANT_BANK_ACCOUNT'
        action='delete'
      >
        {renderIconAction(
          'Xóa',
          <TrashIcon
            aria-hidden
            size={ICON_SIZE}
          />,
          () => onDelete(row),
          true
        )}
      </Can>
    </div>
  </Can>
)

export const createBankAccountColumns = (
  options: BankAccountColumnOptions
): ColumnsType<BankAccountDto> => {
  const { page, size, merchantName } = options
  return [
    {
      title: '#',
      align: 'center',
      width: 60,
      render: (_value, _row, index) => (page - 1) * size + index + 1
    },
    { title: 'Merchant', render: (_, row) => merchantName(row.merchantId) },
    { title: 'Ngân hàng', dataIndex: 'bankCode' },
    {
      title: 'Số tài khoản',
      dataIndex: 'accountNumber',
      render: (value: string) => (
        <span className='font-mono tabular-nums'>
          {maskAccountNumber(value)}
        </span>
      )
    },
    { title: 'Chủ tài khoản', dataIndex: 'accountName' },
    { title: 'Cấp', dataIndex: 'level' },
    {
      title: 'Liên kết',
      dataIndex: 'linkStatus',
      render: (value: BankAccountDto['linkStatus']) => (
        <TagComponent color={LINK_STATUS[value].color}>
          {LINK_STATUS[value].label}
        </TagComponent>
      )
    },
    {
      title: 'Trạng thái',
      render: (_, row) => (
        <div className='flex gap-1'>
          <TagComponent
            color={row.status === 'INACTIVE' ? 'default' : 'success'}
          >
            {row.status === 'INACTIVE' ? 'Không hoạt động' : 'Hoạt động'}
          </TagComponent>
          {row.isDefault && <TagComponent>Mặc định</TagComponent>}
          {row.holdMode && <TagComponent color='warning'>Tạm giữ</TagComponent>}
          {row.pendingChangeRequest && (
            <TagComponent color='processing'>Chờ duyệt</TagComponent>
          )}
        </div>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (value?: string) => formatUTCToLocalDateTime(value) || '—'
    },
    {
      title: 'Thao tác',
      fixed: 'right',
      align: 'center',
      width: 220,
      render: (_, row) => (
        <div className='flex justify-center gap-1'>
          <Can
            screen='MERCHANT_BANK_ACCOUNT'
            action='viewDetail'
          >
            {renderIconAction(
              'Chi tiết',
              <EyeIcon
                aria-hidden
                size={ICON_SIZE}
              />,
              () => options.onView(row)
            )}
          </Can>
          {row.pendingChangeRequest
            ? renderDecisionActions(row, options)
            : renderManageActions(row, options)}
        </div>
      )
    }
  ]
}
