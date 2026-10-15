import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, TagComponent } from '@components/index'
import {
  APPROVAL_LABEL,
  LEVEL_LABEL
} from '../constants/withdrawalLimit.constants'
import { LimitConfigList } from '../components/LimitConfigList'
import type { LimitChangeDto, LimitLevel } from '../types/withdrawalLimit.types'

type Columns = NonNullable<TableProps<LimitChangeDto>['columns']>

export interface LimitColumnOptions {
  onApprove: (row: LimitChangeDto) => void
  onReject: (row: LimitChangeDto) => void
  onDeactivate: (row: LimitChangeDto) => void
}

export const createLimitChangeColumns = ({
  onApprove,
  onReject,
  onDeactivate
}: LimitColumnOptions): Columns => [
  {
    title: 'Trạng thái',
    dataIndex: 'approvalStatus',
    render: (value: LimitChangeDto['approvalStatus']) => (
      <TagComponent color={APPROVAL_LABEL[value].color}>
        {APPROVAL_LABEL[value].label}
      </TagComponent>
    )
  },
  {
    title: 'Cấp',
    dataIndex: 'targetLevel',
    render: (value: LimitLevel) => LEVEL_LABEL[value] ?? value
  },
  {
    title: 'Hạn mức đề xuất',
    render: (_, row) => <LimitConfigList config={row.proposedConfig} />
  },
  {
    title: 'Lý do',
    dataIndex: 'changeReason',
    render: (value?: string) => value || '—'
  },
  {
    title: 'Hiệu lực từ',
    dataIndex: 'activeFrom',
    render: (value?: string) => formatUTCToLocalDateTime(value) || '—'
  },
  {
    title: 'Thao tác',
    fixed: 'right',
    align: 'center',
    render: (_, row) => (
      <Can
        screen='MERCHANT_WITHDRAWAL_LIMIT'
        action='approve'
      >
        <div className='flex justify-center gap-1'>
          {row.approvalStatus === 'PENDING_APPROVAL' && (
            <>
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
            </>
          )}
          {row.approvalStatus === 'APPROVED' && (
            <ButtonComponent
              aria-label='Gỡ hạn mức'
              content='Gỡ'
              danger
              htmlType='button'
              onClick={() => onDeactivate(row)}
              size='small'
              type='default'
            />
          )}
        </div>
      </Can>
    )
  }
]
