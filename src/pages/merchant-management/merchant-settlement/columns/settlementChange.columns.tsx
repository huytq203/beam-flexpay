import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, TagComponent } from '@components/index'
import {
  FREQUENCY_LABEL,
  MODE_LABEL
} from '../constants/settlementConfig.constants'
import type {
  AutoFrequency,
  SettlementChangeDto,
  SettlementMode
} from '../types/settlementConfig.types'

type Columns = NonNullable<TableProps<SettlementChangeDto>['columns']>

const STATUS: Record<
  SettlementChangeDto['status'],
  { label: string; color: 'warning' | 'success' | 'error' }
> = {
  PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'warning' },
  APPROVED: { label: 'Đã duyệt', color: 'success' },
  REJECTED: { label: 'Đã từ chối', color: 'error' }
}

/** Tóm tắt phần đề xuất thay đổi từ bản request đã gửi (field null đã bị bỏ). */
export const describeProposal = (
  proposal: SettlementChangeDto['proposedRequest']
): string => {
  const parts: string[] = []
  if (proposal.inherit === true) parts.push('Kế thừa cấu hình Master')
  if (typeof proposal.settlementMode === 'string')
    parts.push(
      `Chế độ: ${MODE_LABEL[proposal.settlementMode as SettlementMode] ?? proposal.settlementMode}`
    )
  if (typeof proposal.autoFrequency === 'string')
    parts.push(
      `Tần suất: ${FREQUENCY_LABEL[proposal.autoFrequency as AutoFrequency] ?? proposal.autoFrequency}`
    )
  if (typeof proposal.holdbackDays === 'number')
    parts.push(`T+N: ${proposal.holdbackDays} ngày`)
  return parts.join(' · ') || '—'
}

interface ColumnOptions {
  onApprove: (row: SettlementChangeDto) => void
  onReject: (row: SettlementChangeDto) => void
}

export const createSettlementChangeColumns = ({
  onApprove,
  onReject
}: ColumnOptions): Columns => [
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    render: (value: SettlementChangeDto['status']) => (
      <TagComponent color={STATUS[value].color}>
        {STATUS[value].label}
      </TagComponent>
    )
  },
  {
    title: 'Thay đổi đề xuất',
    render: (_, row) => describeProposal(row.proposedRequest)
  },
  {
    title: 'Lý do',
    dataIndex: 'reason',
    render: (value?: string) => value || '—'
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
    render: (_, row) =>
      row.status === 'PENDING_APPROVAL' ? (
        <Can
          screen='MERCHANT_SETTLEMENT_CONFIG'
          action='approve'
        >
          <div className='flex justify-center gap-1'>
            <ButtonComponent
              aria-label='Duyệt đề xuất'
              content='Duyệt'
              htmlType='button'
              onClick={() => onApprove(row)}
              size='small'
              type='default'
            />
            <ButtonComponent
              aria-label='Từ chối đề xuất'
              content='Từ chối'
              danger
              htmlType='button'
              onClick={() => onReject(row)}
              size='small'
              type='default'
            />
          </div>
        </Can>
      ) : null
  }
]
