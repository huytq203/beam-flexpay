import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import type { ApiCredential } from '@/app/services/merchantGatewayApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ArrowsCounterClockwiseIcon, StopOutlined } from '@components/icons'
import {
  ButtonComponent,
  TagComponent,
  TooltipComponent,
  TypographyText
} from '@components/index'

type Columns = NonNullable<TableProps<ApiCredential>['columns']>

interface CredentialColumnOptions {
  page: number
  size: number
  merchantName: (id: string) => string
  onRotate: (credential: ApiCredential) => void
  onRevoke: (credential: ApiCredential) => void
}

const dateLabel = (value?: string | null) =>
  value ? formatUTCToLocalDateTime(value) : 'Chưa có'

export const createApiCredentialColumns = ({
  page,
  size,
  merchantName,
  onRotate,
  onRevoke
}: CredentialColumnOptions): Columns => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _record, index) => (page - 1) * size + index + 1
  },
  {
    title: 'Key kết nối',
    width: 260,
    render: (_, record) => (
      <div className='flex min-w-0 flex-col gap-1'>
        <strong className='text-sm text-foreground'>
          {record.name || 'Key chưa đặt tên'}
        </strong>
        <TypographyText
          className='max-w-full text-xs! font-mono! text-muted-foreground!'
          copyable={{
            text: record.clientId,
            tooltips: ['Sao chép Client ID', 'Đã sao chép']
          }}
        >
          {record.clientId}
        </TypographyText>
      </div>
    )
  },
  {
    title: 'Phạm vi áp dụng',
    width: 215,
    render: (_, record) => (
      <div className='flex flex-col gap-1'>
        <span className='font-medium text-foreground'>
          {merchantName(record.merchantId)}
        </span>
        <span className='text-xs text-muted-foreground'>
          Master · Sub / Terminal kế thừa
        </span>
      </div>
    )
  },
  {
    title: 'Trạng thái',
    width: 125,
    render: (_, record) => (
      <div className='flex flex-col items-start gap-1'>
        <TagComponent
          color={
            record.status === 'ACTIVE'
              ? 'success'
              : record.status === 'REVOKED'
                ? 'error'
                : 'default'
          }
        >
          {record.status === 'ACTIVE'
            ? 'Hoạt động'
            : record.status === 'REVOKED'
              ? 'Đã thu hồi'
              : 'Hết hạn'}
        </TagComponent>
        <span className='text-xs text-muted-foreground'>
          Phiên bản v{record.version ?? 1}
        </span>
      </div>
    )
  },
  {
    title: 'IP được phép',
    width: 155,
    render: (_, record) =>
      record.ipWhitelist?.length ? (
        <div className='flex flex-col'>
          <span className='font-medium'>
            {record.ipWhitelist.length} IP / dải
          </span>
          <span className='text-xs text-muted-foreground'>
            {record.ipWhitelist[0]}
            {record.ipWhitelist.length > 1 &&
              ` và ${record.ipWhitelist.length - 1} IP khác`}
          </span>
        </div>
      ) : (
        <span className='text-xs text-muted-foreground'>Không giới hạn IP</span>
      )
  },
  {
    title: 'Hoạt động gần nhất',
    width: 190,
    render: (_, record) => (
      <div className='flex flex-col gap-1'>
        <span className='text-sm'>
          {record.status === 'REVOKED'
            ? dateLabel(record.revokedAt)
            : record.rotatedAt
              ? dateLabel(record.rotatedAt)
              : dateLabel(record.createdAt)}
        </span>
        <span className='text-xs text-muted-foreground'>
          {record.status === 'REVOKED'
            ? 'Thu hồi'
            : record.rotatedAt
              ? 'Xoay key'
              : 'Tạo key'}
        </span>
      </div>
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 100,
    render: (_, record) =>
      record.status === 'ACTIVE' ? (
        <Can
          screen='MERCHANT_KEY_CONNECTION'
          action='edit'
        >
          <div className='flex justify-center gap-1'>
            <TooltipComponent title='Xoay key'>
              <ButtonComponent
                aria-label='Xoay key'
                size='small'
                type='default'
                icon={
                  <ArrowsCounterClockwiseIcon
                    aria-hidden
                    size={16}
                  />
                }
                onClick={() => onRotate(record)}
              />
            </TooltipComponent>
            <TooltipComponent title='Thu hồi'>
              <ButtonComponent
                aria-label='Thu hồi'
                size='small'
                type='default'
                danger
                icon={<StopOutlined aria-hidden />}
                onClick={() => onRevoke(record)}
              />
            </TooltipComponent>
          </div>
        </Can>
      ) : (
        <span className='text-xs text-muted-foreground'>Đã kết thúc</span>
      )
  }
]
