import type { ColumnsType } from 'antd/es/table'
import { Can } from '@/app/permissions'
import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, TagComponent } from '@components/index'
import { LINK_STATUS } from '../constants/bankAccount.constants'
import { maskAccountNumber } from '../utils/bankAccount.utils'

export type BankAccountActionType = 'default' | 'hold'

interface BankAccountColumnOptions {
  page: number
  size: number
  merchantName: (id?: string) => string
  onEdit: (row: BankAccountDto) => void
  onAction: (type: BankAccountActionType, row: BankAccountDto) => void
}

export const createBankAccountColumns = ({
  page,
  size,
  merchantName,
  onEdit,
  onAction
}: BankAccountColumnOptions): ColumnsType<BankAccountDto> => [
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
      <span className='font-mono tabular-nums'>{maskAccountNumber(value)}</span>
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
        <TagComponent color={row.status === 'INACTIVE' ? 'default' : 'success'}>
          {row.status === 'INACTIVE' ? 'Không hoạt động' : 'Hoạt động'}
        </TagComponent>
        {row.isDefault && <TagComponent>Mặc định</TagComponent>}
        {row.holdMode && <TagComponent color='warning'>Tạm giữ</TagComponent>}
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
    width: 240,
    render: (_, row) => (
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
        </div>
      </Can>
    )
  }
]
