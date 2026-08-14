import type {
  ApplicableFeeRule,
  FeeEffectiveStatus
} from '@/app/schemas/applicable-fee-rule.schema'
import StatusBadge from '@components/status-badge/StatusBadge'
import type { ColumnsType } from 'antd/es/table'
import {
  formatFeeLimit,
  formatFeeLocalDateTime,
  formatTierRange
} from '../utils/applicable-fee-rule'

const APPLIED_OBJECT_LABELS: Readonly<Record<string, string>> = {
  ACCOUNT: 'Tài khoản',
  CUSTOMER_GROUP: 'Nhóm khách hàng',
  ALL: 'Tất cả'
}

const SERVICE_TYPE_LABELS: Readonly<Record<string, string>> = {
  EWALLET_DEPOSIT: 'Nạp tiền ví',
  EWALLET_WITHDRAWAL: 'Rút tiền ví',
  EWALLET_TRANSFER_INTERNAL: 'Chuyển tiền nội bộ',
  EWALLET_TRANSFER_EXTERNAL: 'Chuyển tiền liên ngân hàng',
  EWALLET_CASHBACK: 'Hoàn tiền',
  MERCHANT_VA_BILL_COLLECTION: 'Thu hộ VA'
}

const PAYMENT_METHOD_LABELS: Readonly<Record<string, string>> = {
  ATM: 'ATM',
  CC: 'Thẻ tín dụng',
  CREDIT_CARD: 'Thẻ tín dụng',
  QR_CODE: 'Quét mã QR',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  LINKED_ACCOUNT: 'Tài khoản liên kết',
  WALLET_BALANCE: 'Tài khoản ví',
  VA: 'Tài khoản ảo'
}

const CARD_TYPE_LABELS: Readonly<Record<string, string>> = {
  DOMESTIC: 'Nội địa',
  INTERNATIONAL: 'Quốc tế'
}

const COMPONENT_TYPE_LABELS: Readonly<Record<string, string>> = {
  TRANSACTION_FEE: 'Phí giao dịch cơ bản',
  SYSTEM_FEE: 'Phí hệ thống',
  MERCHANT_FEE: 'Phí merchant',
  BANK_FEE: 'Phí ngân hàng',
  PLATFORM_FEE: 'Phí nền tảng',
  VAT: 'Thuế VAT',
  SERVICE_FEE: 'Phí dịch vụ',
  PROCESSING_FEE: 'Phí xử lý',
  REFUND_FEE: 'Phí hoàn tiền'
}

const EFFECTIVE_STATUS_CONFIG: Record<
  FeeEffectiveStatus,
  { label: string; className: string }
> = {
  PENDING: { label: 'Chờ áp dụng', className: 'warning-status' },
  ACTIVE: { label: 'Đang áp dụng', className: 'success-status' },
  EXPIRED: { label: 'Hết hạn', className: 'danger-status' }
}

export interface ApplicableFeeRuleTableRow extends ApplicableFeeRule {
  rowKey: string
  no: number
  accountLabel: string
}

const getLabel = (
  value: string | null,
  labels: Readonly<Record<string, string>>,
  emptyLabel = 'Tất cả'
): string => (value ? labels[value] ?? value : emptyLabel)

const getAppliedObjectDetail = (
  record: ApplicableFeeRuleTableRow
): string => {
  if (record.appliedObjectType === 'ACCOUNT') return record.accountLabel
  if (record.appliedObjectType === 'CUSTOMER_GROUP') {
    return record.customerGroup ?? '—'
  }
  return 'Mọi tài khoản'
}

const getPaymentDetail = (record: ApplicableFeeRuleTableRow): string => {
  const details = [
    record.cardType
      ? getLabel(record.cardType, CARD_TYPE_LABELS)
      : null,
    record.bankCode
  ].filter((value) => value !== null)

  return details.length > 0 ? details.join(' · ') : 'Mọi loại thẻ/ngân hàng'
}

export const applicableFeeRuleColumns: ColumnsType<
  ApplicableFeeRuleTableRow
> = [
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
          {getAppliedObjectDetail(record)}
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
          {getLabel(record.componentType, COMPONENT_TYPE_LABELS)}
        </span>
      </div>
    )
  },
  {
    title: 'Loại giao dịch',
    dataIndex: 'serviceType',
    width: 180,
    render: (value: string | null) =>
      getLabel(value, SERVICE_TYPE_LABELS)
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
    width: 140,
    render: (value: string) => (
      <span className='whitespace-nowrap tabular-nums font-medium'>
        {value}
      </span>
    )
  },
  {
    title: 'Min / Max',
    align: 'right',
    width: 150,
    render: (_, record) => (
      <div className='flex flex-col whitespace-nowrap tabular-nums'>
        <span>Min: {formatFeeLimit(record.minFee)}</span>
        <span>Max: {formatFeeLimit(record.maxFee)}</span>
      </div>
    )
  },
  {
    title: 'Thời gian tạo',
    dataIndex: 'createdAt',
    align: 'center',
    width: 160,
    render: (value: string | null) => formatFeeLocalDateTime(value)
  },
  {
    title: 'Thời gian áp dụng',
    dataIndex: 'validFrom',
    align: 'center',
    width: 160,
    render: (value: string | null) => formatFeeLocalDateTime(value)
  },
  {
    title: 'Thời gian kết thúc',
    dataIndex: 'validTo',
    align: 'center',
    width: 160,
    render: (value: string | null) => formatFeeLocalDateTime(value)
  },
  {
    title: 'Trạng thái',
    dataIndex: 'effectiveStatus',
    align: 'center',
    fixed: 'right',
    width: 120,
    render: (status: FeeEffectiveStatus) => (
      <StatusBadge status={status} config={EFFECTIVE_STATUS_CONFIG} />
    )
  }
]
