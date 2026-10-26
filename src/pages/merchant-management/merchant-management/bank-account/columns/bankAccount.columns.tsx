import type { ColumnsType } from 'antd/es/table'
import { Can } from '@/app/permissions'
import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, TagComponent } from '@components/index'
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
        <ButtonComponent
          size='small'
          type='primary'
          content='Phê duyệt'
          onClick={() => onDecide('approve', row)}
        />
        <ButtonComponent
          size='small'
          danger
          content='Từ chối'
          onClick={() => onDecide('reject', row)}
        />
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
      <ButtonComponent
        size='small'
        type='default'
        content='Sửa'
        onClick={() => onEdit(row)}
      />
      {row.linkStatus === 'PENDING_VERIFICATION' && (
        <ButtonComponent
          size='small'
          type='default'
          content='Xác minh'
          onClick={() => onAction('verify', row)}
        />
      )}
      {!row.isDefault && (
        <ButtonComponent
          size='small'
          type='default'
          content='Mặc định'
          onClick={() => onAction('default', row)}
        />
      )}
      <ButtonComponent
        size='small'
        type='default'
        content={row.holdMode ? 'Bỏ giữ' : 'Tạm giữ'}
        onClick={() => onAction('hold', row)}
      />
      <Can
        screen='MERCHANT_BANK_ACCOUNT'
        action='delete'
      >
        <ButtonComponent
          size='small'
          danger
          content='Xóa'
          onClick={() => onDelete(row)}
        />
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
      width: 360,
      render: (_, row) => (
        <div className='flex justify-center gap-1'>
          <Can
            screen='MERCHANT_BANK_ACCOUNT'
            action='viewDetail'
          >
            <ButtonComponent
              size='small'
              type='default'
              content='Chi tiết'
              onClick={() => options.onView(row)}
            />
          </Can>
          {row.pendingChangeRequest
            ? renderDecisionActions(row, options)
            : renderManageActions(row, options)}
        </div>
      )
    }
  ]
}
