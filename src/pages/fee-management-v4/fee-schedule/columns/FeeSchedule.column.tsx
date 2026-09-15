import type {
  ApplicableFeeRule,
  FeeEffectiveStatus
} from '@/app/schemas/applicable-fee-rule.schema'
import { FeeDirectionBadge } from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import {
  CARD_TYPE_LABELS,
  COMPONENT_TYPE_LABELS,
  EFFECTIVE_STATUS_CONFIG,
  getFeeLabel,
  PAYMENT_METHOD_LABELS,
  SERVICE_TYPE_LABELS
} from '@constants/feeLabels'
import { formatFeeLimit } from '@utils/fee-format'
import { formatUTCDateTimeByOffset, UTC_OFFSET_HOURS } from '@utils/helper-functions/date'
import type { ColumnsType } from 'antd/es/table'

export interface FeeScheduleRow extends ApplicableFeeRule {
  rowKey: string
  no: number
}

const formatLocalDateTime = (value: string | null): string =>
  value ? formatUTCDateTimeByOffset(value, UTC_OFFSET_HOURS.VIETNAM) : '—'

const getChannel = (record: FeeScheduleRow): string => {
  const parts = [
    record.bankCode,
    record.cardType ? getFeeLabel(record.cardType, CARD_TYPE_LABELS) : null
  ].filter((value): value is string => Boolean(value))

  return parts.length > 0 ? parts.join(' · ') : 'Mọi ngân hàng/thẻ'
}

export const feeScheduleColumns: ColumnsType<FeeScheduleRow> = [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    width: 56
  },
  {
    title: 'Chiều tiền / Loại giao dịch',
    dataIndex: 'serviceType',
    width: 200,
    render: (value: string | null) => (
      <FeeDirectionBadge
        serviceType={value}
        caption={getFeeLabel(value, SERVICE_TYPE_LABELS)}
      />
    )
  },
  {
    title: 'Chính sách / Thành phần',
    dataIndex: 'feePolicyName',
    width: 240,
    render: (_, record) => (
      <div className='flex flex-col gap-0.5'>
        <span className='font-medium text-foreground'>{record.feePolicyName}</span>
        <span className='text-xs text-muted-foreground'>
          {getFeeLabel(record.componentType, COMPONENT_TYPE_LABELS)}
        </span>
      </div>
    )
  },
  {
    title: 'Ngân hàng / Phương thức',
    dataIndex: 'bankCode',
    width: 200,
    render: (_, record) => (
      <div className='flex flex-col gap-0.5'>
        <span className='font-medium text-foreground'>{getChannel(record)}</span>
        <span className='text-xs text-muted-foreground'>
          {getFeeLabel(record.paymentMethod, PAYMENT_METHOD_LABELS)}
        </span>
      </div>
    )
  },
  
  {
    title: 'Công thức tính',
    dataIndex: 'formula',
    align: 'right',
    width: 140,
    render: (value: string) => (
      <span className='whitespace-nowrap font-medium tabular-nums'>{value}</span>
    )
  },
  {
    title: 'Tối thiểu / Tối đa',
    align: 'right',
    width: 160,
    render: (_, record) => (
      <div className='flex flex-col whitespace-nowrap text-xs tabular-nums'>
        <span>Min: {formatFeeLimit(record.minFee)}</span>
        <span>Max: {formatFeeLimit(record.maxFee)}</span>
      </div>
    )
  },
  {
    title: 'Hiệu lực từ',
    dataIndex: 'validFrom',
    align: 'center',
    width: 170,
    render: (value: string | null) => formatLocalDateTime(value)
  },
  {
    title: 'Hiệu lực đến',
    dataIndex: 'validTo',
    align: 'center',
    width: 170,
    render: (value: string | null) => formatLocalDateTime(value)
  },
  {
    title: 'Trạng thái',
    dataIndex: 'effectiveStatus',
    align: 'center',
    fixed: 'right',
    width: 130,
    render: (status: FeeEffectiveStatus) => (
      <StatusBadge status={status} config={EFFECTIVE_STATUS_CONFIG} />
    )
  }
]
