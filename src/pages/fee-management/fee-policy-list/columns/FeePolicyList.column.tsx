import { isPolicyExpired } from '@components/fee/feeExpiry'
import { Can } from '@/app/permissions'
import { FeeStatusPill } from '@components/fee/FeeStatusPill'
import { NotePencilIcon } from '@components/icons'
import {
  ButtonComponent,
  CopyableText,
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
  FEE_SCOPE,
  FEE_SCOPE_LABEL,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { AppliedTargetCell } from '../components/AppliedTargetCell'
import { ChannelCell } from '../components/ChannelCell'
import { FeePolicyStatusButton } from '../components/FeePolicyStatusButton'
import { ScopeComponentsCell } from '../components/ScopeComponentsCell'
import { formatDateTimeUTC } from '@/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/utils/applicable-fee-rule'

interface FeePolicyColumnArgs {
  /** Luồng phí đang xem; quyết định cột thành phần phí hiện thành phần nào. */
  feeScope: FeeScope
  /** Màn cấp quyền thao tác: Cấu hình phí, Cấu hình phí đầu vào hoặc Cấu hình phí ĐVCNTT. */
  screen?: 'FEE_CONFIG' | 'FEE_INPUT_COST' | 'MERCHANT_FEE_CONFIG'
  onEdit: (id: string) => void
  /** Mở dialog khóa / mở (ngay hoặc hẹn giờ) cho một chính sách. */
  onChangeStatus: (id: string, name: string, status: string) => void
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

const buildColumns = ({
  feeScope,
  screen = 'FEE_CONFIG',
  onEdit,
  onChangeStatus,
  customerSegmentNames
}: FeePolicyColumnArgs): ColumnsType<FeePolicyRow> => [
  {
    title: '#',
    dataIndex: 'no',
    width: 56,
    align: 'center'
  },
  {
    title: 'Mã phí',
    dataIndex: 'feeCode',
    width: 140,
    render: (feeCode: string | null | undefined) =>
      feeCode ? (
        <CopyableText
          value={feeCode}
          className='tabular-nums'
        />
      ) : (
        '--'
      )
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
    title: 'NCC / Ngân hàng',
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
        serviceType={row.serviceType}
      />
    )
  },
  {
    title: 'Đối tượng áp dụng',
    dataIndex: 'appliedTargets',
    width: 250,
    render: (appliedTargets: AppliedTarget[] | undefined, row) => (
      <AppliedTargetCell
        targets={appliedTargets}
        customerSegmentNames={customerSegmentNames}
        serviceType={row.serviceType}
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
    // Bảng này giữ bố cục cố định: tối đa 1 nút (Sửa, Duyệt, hoặc menu Bật/Tắt/Hẹn giờ) nên chỉ chừa đúng chỗ đó.
    width: 96,
    fixed: 'right',
    align: 'center',
    render: (id: string, row) => {
      // Biểu phí đã hết hạn (đúng như nhãn "Hết hạn") không còn thao tác nào để làm.
      if (isPolicyExpired(row)) return null

      const isEditable = row.status === 'INIT'

      return (
        <div className='flex items-center justify-center gap-2'>
          {isEditable && (
            <Can
              screen={screen}
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
              screen={screen}
              action='approve'
            >
              <FeePolicyApprovalAction policy={row} />
            </Can>
          )}

          <FeePolicyStatusButton
            status={row.status}
            onChangeStatus={() => onChangeStatus(id, row.name, row.status)}
          />
        </div>
      )
    }
  }
]

/** Chính sách phí đầu vào không gán theo đối tượng khách nên bỏ cột Đối tượng áp dụng. */
export const getFeePolicyColumns = (
  args: FeePolicyColumnArgs
): ColumnsType<FeePolicyRow> => {
  const columns = buildColumns(args)
  return args.feeScope === FEE_SCOPE.INPUT_COST
    ? columns.filter(({ title }) => title !== 'Đối tượng áp dụng')
    : columns
}
