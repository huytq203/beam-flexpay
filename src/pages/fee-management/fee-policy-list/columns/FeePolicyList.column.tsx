import { Can } from '@/app/permissions'
import { FeeStatusPill } from '@components/fee/FeeStatusPill'
import {
  CheckCircleOutlined,
  NotePencilIcon,
  StopOutlined
} from '@components/icons'
import {
  ButtonComponent,
  FeePolicyApprovalAction,
  TooltipComponent
} from '@components/index'
import { SERVICE_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import type { CustomerSegmentNames } from '@hooks/useCustomerSegmentNames'
import type { FeePolicyRow } from '@pages/fee-management/fee-policy-list/hooks/useFeePolicyList'
import type { AppliedTarget } from '@type/fee.type'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  FEE_SCOPE_LABEL,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { AppliedTargetCell } from '../components/AppliedTargetCell'
import { ChannelCell } from '../components/ChannelCell'
import { FeePolicyScheduleRowAction } from '../components/FeePolicyScheduleRowAction'
import { ScopeComponentsCell } from '../components/ScopeComponentsCell'
import { formatDateTimeUTC } from '@/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/utils/applicable-fee-rule'

interface FeePolicyColumnArgs {
  /** Luồng phí đang xem; quyết định cột thành phần phí hiện thành phần nào. */
  feeScope: FeeScope
  onEdit: (id: string) => void
  onActivate: (id: string, name: string) => void
  onDeactivate: (id: string) => void
  onSchedule: (id: string, name: string, status: string) => void
  /** Dòng đang có lệnh bật/tắt chạy dở. */
  busyId: string | null
  customerSegmentNames: CustomerSegmentNames
}

const formatDay = (value: string | null): string =>
  value ? formatDateTimeUTC(value) : 'Vô thời hạn'

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
  feeScope,
  onEdit,
  onActivate,
  onDeactivate,
  onSchedule,
  busyId,
  customerSegmentNames
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
    title: 'Loại giao dịch',
    dataIndex: 'serviceType',
    width: 200,
    render: (serviceType: string) =>
      getFeeLabel(serviceType, SERVICE_TYPE_LABELS)
  },
  {
    title: 'Ngân hàng / Merchant',
    dataIndex: 'configuration',
    key: 'channel',
    width: 190,
    render: (_configuration, row) => (
      <ChannelCell
        serviceType={row.serviceType}
        assignments={row.configuration?.assignments}
      />
    )
  },
  {
    title: FEE_SCOPE_LABEL[feeScope],
    dataIndex: 'configuration',
    key: `scope-${feeScope}`,
    width: 340,
    render: (_configuration, row) => (
      <ScopeComponentsCell
        configuration={row.configuration}
        feeScope={feeScope}
      />
    )
  },
  {
    title: 'Đối tượng áp dụng',
    dataIndex: 'appliedTargets',
    width: 250,
    render: (appliedTargets: AppliedTarget[] | undefined) => (
      <AppliedTargetCell
        targets={appliedTargets}
        customerSegmentNames={customerSegmentNames}
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
    title: 'Thời gian áp dụng',
    dataIndex: 'validFrom',
    width: 300,
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
    render: (status: string, row) => (
      <FeeStatusPill
        status={status}
        effectiveStatus={row.effectiveStatus}
        validTo={row.validTo}
      />
    )
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    width: 170,
    render: (createdAt: string | undefined, row) => (
      <div className='flex flex-col gap-0.5'>
        <span className='tabular-nums text-[13px] text-foreground'>
          {createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
        </span>
        {row.updatedBy && (
          <span className='text-xs text-muted-foreground'>{row.createdBy}</span>
        )}
      </div>
    )
  },
  {
    title: 'Ngày cập nhật',
    dataIndex: 'updatedAt',
    width: 170,
    render: (updatedAt: string | undefined, row) => (
      <div className='flex flex-col gap-0.5'>
        <span className='tabular-nums text-[13px] text-foreground'>
          {updatedAt ? dayjs(updatedAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
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
    // Bảng này giữ bố cục cố định: tối đa 2 nút (Sửa + Duyệt, hoặc Bật/Tắt + Hẹn giờ) nên chỉ chừa đúng chỗ đó.
    width: 96,
    fixed: 'right',
    align: 'center',
    render: (id: string, row) => {
      const isEditable = row.status === 'INIT' || row.status === 'REJECTED'

      return (
        <div className='flex items-center justify-center gap-2'>
          {isEditable && (
            <Can
              screen='FEE_CONFIG'
              action='edit'
            >
              <TooltipComponent title='Sửa cấu hình'>
                <ButtonComponent
                  type='default'
                  htmlType='button'
                  size='small'
                  aria-label='Sửa cấu hình'
                  icon={
                    <NotePencilIcon
                      size={16}
                      weight='bold'
                      aria-hidden
                    />
                  }
                  onClick={() => onEdit(id)}
                />
              </TooltipComponent>
            </Can>
          )}

          {/* Chỉ bản ghi chưa qua duyệt mới có gì để duyệt. */}
          {row.status === 'INIT' && (
            <Can
              screen='FEE_CONFIG'
              action='approve'
            >
              <FeePolicyApprovalAction policy={row} />
            </Can>
          )}

          {row.status === 'INACTIVE' && (
            <Can
              screen='FEE_CONFIG'
              action='activate'
            >
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
            <Can
              screen='FEE_CONFIG'
              action='deactivate'
            >
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

          <FeePolicyScheduleRowAction
            status={row.status}
            onClick={() => onSchedule(id, row.name, row.status)}
          />
        </div>
      )
    }
  }
]
