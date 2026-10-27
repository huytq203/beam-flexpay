import type {
  ApplicableFeeRule,
  FeeEffectiveStatus
} from '@/app/schemas/applicable-fee-rule.schema'
import type { ReactNode } from 'react'
import type { GroupedFeeRule } from '../utils/group-fee-rules'
import {
  CARD_TYPE_LABELS,
  COMPONENT_TYPE_LABELS,
  EFFECTIVE_STATUS_CONFIG,
  getFeeLabel as getLabel,
  PAYMENT_METHOD_LABELS,
  SERVICE_TYPE_LABELS
} from '@constants/feeLabels'
import StatusBadge from '@components/status-badge/StatusBadge'
import type { ColumnsType } from 'antd/es/table'
import {
  formatDateTimeUTC,
  formatFeeLimit,
  formatTierRange
} from '../utils/applicable-fee-rule'
import {
  getCustomerSegmentName,
  type CustomerSegmentNames
} from '@hooks/useCustomerSegmentNames'

const APPLIED_OBJECT_LABELS: Readonly<Record<string, string>> = {
  ACCOUNT: 'Tài khoản',
  CUSTOMER_GROUP: 'Nhóm khách hàng',
  ALL: 'Tất cả'
}

export interface ApplicableFeeRuleTableRow extends GroupedFeeRule {
  rowKey: string
  no: number
  accountLabel: string
}

/** Một thành phần thì hiện thẳng; nhiều thành phần thì xếp dọc, mỗi khối có nhãn. */
const renderComponents = (
  record: ApplicableFeeRuleTableRow,
  render: (rule: ApplicableFeeRule) => ReactNode
): ReactNode => {
  if (record.components.length === 1) return render(record.components[0])
  return (
    <div className='flex flex-col gap-2'>
      {record.components.map((rule) => (
        <div
          key={rule.componentType}
          className='flex flex-col'
        >
          <span className='text-xs text-muted-foreground'>
            {getLabel(rule.componentType, COMPONENT_TYPE_LABELS)}
          </span>
          {render(rule)}
        </div>
      ))}
    </div>
  )
}

const getAppliedObjectDetail = (
  record: ApplicableFeeRuleTableRow,
  customerSegmentNames: CustomerSegmentNames
): string => {
  if (record.appliedObjectType === 'ACCOUNT') return record.accountLabel
  if (record.appliedObjectType === 'CUSTOMER_GROUP') {
    return record.customerGroup
      ? getCustomerSegmentName(record.customerGroup, customerSegmentNames)
      : '—'
  }
  return 'Mọi tài khoản'
}

const getPaymentDetail = (record: ApplicableFeeRuleTableRow): string => {
  const details = [
    record.cardType ? getLabel(record.cardType, CARD_TYPE_LABELS) : null,
    record.bankCode
  ].filter((value) => value !== null)

  return details.length > 0 ? details.join(' · ') : 'Mọi loại thẻ/ngân hàng'
}

export const getApplicableFeeRuleColumns = (
  customerSegmentNames: CustomerSegmentNames
): ColumnsType<ApplicableFeeRuleTableRow> => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    width: 56
  },
  {
    title: 'Đối tượng áp dụng',
    dataIndex: 'appliedObjectType',
    width: 180,
    render: (_, record) => (
      <div className='flex flex-col gap-0.5'>
        <span className='font-medium text-foreground'>
          {getLabel(record.appliedObjectType, APPLIED_OBJECT_LABELS)}
        </span>
        <span className='text-xs text-muted-foreground'>
          {getAppliedObjectDetail(record, customerSegmentNames)}
        </span>
      </div>
    )
  },
  {
    title: 'Chính sách / Thành phần',
    dataIndex: 'feePolicyName',
    width: 220,
    render: (_, record) => (
      <div className='flex flex-col gap-0.5'>
        <span className='font-medium text-foreground'>
          {record.feePolicyName}
        </span>
        <span className='text-xs text-muted-foreground'>
          {record.components.length === 1
            ? getLabel(record.componentType, COMPONENT_TYPE_LABELS)
            : `${record.components.length} thành phần phí`}
        </span>
      </div>
    )
  },
  {
    title: 'Loại giao dịch',
    dataIndex: 'serviceType',
    width: 180,
    render: (value: string | null) => getLabel(value, SERVICE_TYPE_LABELS)
  },
  {
    title: 'Phương thức',
    dataIndex: 'paymentMethod',
    width: 180,
    render: (_, record) => (
      <div className='flex flex-col gap-0.5'>
        <span>{getLabel(record.paymentMethod, PAYMENT_METHOD_LABELS)}</span>
        <span className='text-xs text-muted-foreground'>
          {getPaymentDetail(record)}
        </span>
      </div>
    )
  },
  {
    title: 'Mức giao dịch (VND)',
    align: 'right',
    width: 180,
    render: (_, record) => (
      <span className='whitespace-nowrap tabular-nums'>
        {formatTierRange(record.tierFrom, record.tierTo)}
      </span>
    )
  },
  {
    title: 'Công thức tính',
    dataIndex: 'formula',
    align: 'right',
    width: 160,
    render: (_, record) =>
      renderComponents(record, (rule) => (
        <span className='whitespace-nowrap tabular-nums font-medium'>
          {rule.formula}
        </span>
      ))
  },
  {
    title: 'Min / Max',
    align: 'right',
    width: 160,
    render: (_, record) =>
      renderComponents(record, (rule) => (
        <div className='flex flex-col whitespace-nowrap tabular-nums'>
          <span>Min: {formatFeeLimit(rule.minFee)}</span>
          <span>Max: {formatFeeLimit(rule.maxFee)}</span>
        </div>
      ))
  },
  {
    title: 'Thời gian tạo',
    dataIndex: 'createdAt',
    align: 'center',
    width: 160,
    render: (value: string | null) => formatDateTimeUTC(value)
  },
  {
    title: 'Thời gian áp dụng',
    dataIndex: 'validFrom',
    align: 'center',
    width: 160,
    render: (value: string | null) => formatDateTimeUTC(value)
  },
  {
    title: 'Thời gian kết thúc',
    dataIndex: 'validTo',
    align: 'center',
    width: 160,
    render: (value: string | null) => formatDateTimeUTC(value)
  },
  {
    title: 'Trạng thái',
    dataIndex: 'effectiveStatus',
    align: 'center',
    fixed: 'right',
    width: 120,
    render: (status: FeeEffectiveStatus) => (
      <StatusBadge
        status={status}
        config={EFFECTIVE_STATUS_CONFIG}
      />
    )
  }
]
