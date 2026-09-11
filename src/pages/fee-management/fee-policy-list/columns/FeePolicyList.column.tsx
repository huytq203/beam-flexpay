import { Can } from '@/app/permissions'
import { FeeStatusPill } from '@components/fee/FeeStatusPill'
import { CheckCircleOutlined, NotePencilIcon, StopOutlined } from '@components/icons'
import {
  ButtonComponent,
  FeeDirectionBadge,
  FeePolicyApprovalAction,
  TooltipComponent
} from '@components/index'
import { SERVICE_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import type { FeePolicyRow } from '@pages/fee-management/fee-policy-list/hooks/useFeePolicyList'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

interface FeePolicyColumnArgs {
  onEdit: (id: string) => void
  onActivate: (id: string, name: string) => void
  onDeactivate: (id: string) => void
  /** Dòng đang có lệnh bật/tắt chạy dở. */
  busyId: string | null
}

const formatDay = (value: string | null): string =>
  value ? dayjs(value).format('DD/MM/YYYY') : 'Vô thời hạn'

/**
 * Mức ưu tiên là số nhỏ thắng, ngược trực giác của phần lớn người đọc bảng.
 * Nhãn cột nói thẳng điều đó thay vì để người vận hành đoán.
 */
const PRIORITY_LABEL: Readonly<Record<number, string>> = {
  1: 'Cao',
  2: 'Trung bình',
  3: 'Thấp',
  4: 'Mặc định'
}

export const getFeePolicyColumns = ({
  onEdit,
  onActivate,
  onDeactivate,
  busyId
}: FeePolicyColumnArgs): ColumnsType<FeePolicyRow> => [
  {
    title: '#',
    dataIndex: 'no',
    width: 56,
    align: 'center'
  },
  {
    title: 'Tên chính sách',
    dataIndex: 'name',
    width: 260,
    render: (name: string, row) => (
      <div className='flex flex-col gap-0.5'>
        <span className='font-semibold text-foreground'>{name}</span>
        {row.description && (
          <TooltipComponent title={row.description}>
            <span className='line-clamp-1 text-xs text-muted-foreground'>
              {row.description}
            </span>
          </TooltipComponent>
        )}
      </div>
    )
  },
  {
    title: 'Chiều tiền · Loại giao dịch',
    dataIndex: 'serviceType',
    width: 200,
    render: (serviceType: string) => (
      <FeeDirectionBadge
        serviceType={serviceType}
        caption={getFeeLabel(serviceType, SERVICE_TYPE_LABELS)}
      />
    )
  },
  {
    title: 'Mức ưu tiên',
    dataIndex: 'priority',
    width: 150,
    align: 'right',
    render: (priority: number) => (
      <span className='tabular-nums font-semibold text-foreground'>
        <span className='ml-1.5 font-normal text-muted-foreground'>
          {PRIORITY_LABEL[priority] ?? ''}
        </span>
      </span>
    )
  },
  {
    title: 'Hiệu lực',
    dataIndex: 'validFrom',
    width: 190,
    render: (validFrom: string, row) => (
      <span className='tabular-nums text-[13px] text-foreground'>
        {formatDay(validFrom)}
        <span className='mx-1 text-muted-foreground'>→</span>
        {formatDay(row.validTo)}
      </span>
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 140,
    render: (status: string) => <FeeStatusPill status={status} />
  },
  {
    title: 'Cập nhật',
    dataIndex: 'updatedAt',
    width: 170,
    render: (updatedAt: string | undefined, row) => (
      <div className='flex flex-col gap-0.5'>
        <span className='tabular-nums text-[13px] text-foreground'>
          {updatedAt ? dayjs(updatedAt).format('DD/MM/YYYY HH:mm') : '—'}
        </span>
        {row.updatedBy && (
          <span className='text-xs text-muted-foreground'>{row.updatedBy}</span>
        )}
      </div>
    )
  },
  {
    title: 'Hành động',
    dataIndex: 'id',
    width: 190,
    fixed: 'right',
    align: 'center',
    render: (id: string, row) => (
      <div className='flex items-center justify-center gap-2'>
        <Can screen='FEE_CONFIG' action='edit'>
          <TooltipComponent title='Mở màn cấu hình'>
            <ButtonComponent
              type='default'
              htmlType='button'
              size='small'
              aria-label='Mở màn cấu hình'
              icon={<NotePencilIcon size={16} weight='bold' aria-hidden />}
              onClick={() => onEdit(id)}
            />
          </TooltipComponent>
        </Can>

        {/* Chỉ bản ghi chưa qua duyệt mới có gì để duyệt. */}
        {row.status === 'INIT' && (
          <Can screen='FEE_CONFIG' action='approve'>
            <FeePolicyApprovalAction policy={row} />
          </Can>
        )}

        {row.status === 'INACTIVE' && (
          <Can screen='FEE_CONFIG' action='toggleActive'>
            <TooltipComponent title='Kích hoạt chính sách'>
              <ButtonComponent
                type='default'
                htmlType='button'
                size='small'
                aria-label='Kích hoạt chính sách'
                icon={<CheckCircleOutlined />}
                loading={busyId === id}
                onClick={() => onActivate(id, row.name)}
              />
            </TooltipComponent>
          </Can>
        )}

        {row.status === 'ACTIVE' && (
          <Can screen='FEE_CONFIG' action='toggleActive'>
            <TooltipComponent title='Ngừng áp dụng chính sách'>
              <ButtonComponent
                type='default'
                htmlType='button'
                size='small'
                danger
                aria-label='Ngừng áp dụng chính sách'
                icon={<StopOutlined />}
                loading={busyId === id}
                onClick={() => onDeactivate(id)}
              />
            </TooltipComponent>
          </Can>
        )}
      </div>
    )
  }
]
