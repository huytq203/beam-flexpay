import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, TagComponent } from '@components/index'
import { AdminUserName } from '../../merchant-assignment/components/AdminUserName'
import { HoldRuleConfigList } from '../components/HoldRuleConfigList'
import { HoldRuleTargetCell } from '../components/HoldRuleTargetCell'
import { STATUS_LABEL } from '../constants/holdRule.constants'
import type { HoldRuleChange } from '../types/holdRule.types'
import { deriveDisplayStatus } from '../utils/holdRuleFormat.utils'

type Columns = NonNullable<TableProps<HoldRuleChange>['columns']>

export interface HoldRuleColumnOptions {
  page: number
  pageSize: number
  /** Hàng đợi chứa nhiều đối tượng nên cần cột Đối tượng; lịch sử chỉ có một. */
  showTarget: boolean
  /** Lịch sử có thêm người duyệt/từ chối và thời điểm hết hiệu lực. */
  showDecision: boolean
  onApprove: (row: HoldRuleChange) => void
  onReject: (row: HoldRuleChange) => void
}

const date = (value?: string | null) => formatUTCToLocalDateTime(value) || '—'

const decisionColumns: Columns = [
  {
    title: 'Hiệu lực đến',
    dataIndex: 'activeUntil',
    render: date
  },
  {
    title: 'Người duyệt/từ chối',
    render: (_, row) =>
      row.approverId ? <AdminUserName userId={row.approverId} /> : '—'
  },
  {
    title: 'Thời điểm duyệt/từ chối',
    dataIndex: 'approvedAt',
    render: date
  }
]

export const createHoldRuleColumns = ({
  page,
  pageSize,
  showTarget,
  showDecision,
  onApprove,
  onReject
}: HoldRuleColumnOptions): Columns => [
  {
    title: '#',
    width: 56,
    align: 'center',
    render: (_, __, index) => (page - 1) * pageSize + index + 1
  },
  ...(showTarget
    ? ([
        {
          title: 'Đối tượng',
          render: (_, row) => (
            <HoldRuleTargetCell
              level={row.targetLevel}
              targetId={row.targetId}
            />
          )
        }
      ] satisfies Columns)
    : []),
  { title: 'Phiên bản', dataIndex: 'version', align: 'center', width: 90 },
  {
    title: 'Trạng thái',
    render: (_, row) => {
      const status = STATUS_LABEL[deriveDisplayStatus(row)]
      return <TagComponent color={status.color}>{status.label}</TagComponent>
    }
  },
  {
    title: 'Cấu hình',
    width: 320,
    render: (_, row) => <HoldRuleConfigList config={row.proposedConfig} />
  },
  { title: 'Hiệu lực từ', dataIndex: 'activeFrom', render: date },
  {
    title: 'Lý do',
    dataIndex: 'changeReason',
    render: (value?: string | null) => value || '—'
  },
  {
    title: 'Người đề xuất',
    render: (_, row) => <AdminUserName userId={row.authorId} />
  },
  { title: 'Ngày đề xuất', dataIndex: 'createdAt', render: date },
  ...(showDecision ? decisionColumns : []),
  {
    title: 'Thao tác',
    fixed: 'right',
    align: 'center',
    render: (_, row) =>
      row.approvalStatus === 'PENDING_APPROVAL' && (
        <Can
          screen='MERCHANT_HOLD_RULE'
          action='approve'
        >
          <div className='flex justify-center gap-1'>
            <ButtonComponent
              aria-label={`Duyệt đề xuất phiên bản ${row.version}`}
              content='Duyệt'
              htmlType='button'
              onClick={() => onApprove(row)}
              size='small'
              type='default'
            />
            <ButtonComponent
              aria-label={`Từ chối đề xuất phiên bản ${row.version}`}
              content='Từ chối'
              danger
              htmlType='button'
              onClick={() => onReject(row)}
              size='small'
              type='default'
            />
          </div>
        </Can>
      )
  }
]
