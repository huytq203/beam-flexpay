import { REFUND_TYPE_LABELS } from '@constants/refund.constant'
import {
  REFUND_CHANNEL_LABELS,
  REFUND_SOURCE_LABELS,
  REFUND_ORIGINAL_TYPE_LABELS
} from '../constants/refund.constants'
import {
  RefundStatus,
  type RefundDetail
} from '../schemas/refund.schema'
import { EMPTY_VALUE, formatDateTime } from '../utils/refund.utils'
import { DetailRows, DetailSection } from './DetailSection'

interface RefundInfoSectionProps {
  refund: RefundDetail
}

export function RefundInfoSection({ refund }: RefundInfoSectionProps) {
  const customer = [
    refund.customerName,
    refund.customerPhone && `(${refund.customerPhone})`
  ]
    .filter(Boolean)
    .join(' ')
  const rows = [
    { label: 'Khách hàng', value: customer || EMPTY_VALUE },
    {
      label: 'Loại giao dịch gốc',
      value: REFUND_ORIGINAL_TYPE_LABELS[refund.originalType] ?? refund.originalType
    },
    ...(refund.refundType
      ? [{ label: 'Loại hoàn', value: REFUND_TYPE_LABELS[refund.refundType] }]
      : []),
    {
      label: 'Mã giao dịch gốc',
      value: refund.originalTransactionCode ?? EMPTY_VALUE
    },
    {
      label: 'Kênh hoàn',
      value: REFUND_CHANNEL_LABELS[refund.channel] ?? refund.channel
    },
    {
      label: 'Nguồn tạo',
      value: REFUND_SOURCE_LABELS[refund.createdSource] ?? refund.createdSource
    },
    ...(refund.payoutCode
      ? [{ label: 'Mã lệnh chi', value: refund.payoutCode }]
      : []),
    { label: 'Lý do', value: refund.reason ?? EMPTY_VALUE }
  ]
  return (
    <DetailSection title='Thông tin yêu cầu'>
      <DetailRows rows={rows} />
    </DetailSection>
  )
}

interface RefundBeneficiarySectionProps {
  refund: RefundDetail
  canViewFullAccountNumber: boolean
}

export function RefundBeneficiarySection({
  refund,
  canViewFullAccountNumber
}: RefundBeneficiarySectionProps) {
  const hasBeneficiary =
    refund.beneficiaryBankCode ||
    refund.beneficiaryAccountNumber ||
    refund.beneficiaryAccountName
  if (!hasBeneficiary) return null
  return (
    <DetailSection
      title='Tài khoản thụ hưởng'
      note={
        canViewFullAccountNumber
          ? undefined
          : 'Số tài khoản được che theo quyền của bạn.'
      }
    >
      <DetailRows
        rows={[
          {
            label: 'Ngân hàng',
            value: refund.beneficiaryBankCode ?? EMPTY_VALUE
          },
          {
            label: 'Số tài khoản',
            value: refund.beneficiaryAccountNumber ?? EMPTY_VALUE,
            numeric: true
          },
          {
            label: 'Tên chủ tài khoản',
            value: refund.beneficiaryAccountName ?? EMPTY_VALUE
          }
        ]}
      />
    </DetailSection>
  )
}

interface RefundHistorySectionProps {
  refund: RefundDetail
}

export function RefundHistorySection({ refund }: RefundHistorySectionProps) {
  const hasDecision = Boolean(refund.approvedBy || refund.approvedAt)
  const isRejected = refund.status === RefundStatus.REJECTED
  return (
    <DetailSection title='Lịch sử xử lý'>
      <ol className='flex flex-col gap-3 border-l border-border pl-4 text-sm'>
        <li>
          <strong>Tạo yêu cầu</strong>
          <span className='block text-xs text-muted-foreground'>
            {[refund.createdBy, formatDateTime(refund.createdAt)]
              .filter(Boolean)
              .join(', ')}
          </span>
        </li>
        {hasDecision && (
          <li>
            <strong>{isRejected ? 'Từ chối' : 'Duyệt'}</strong>
            <span className='block text-xs text-muted-foreground'>
              {[refund.approvedBy, formatDateTime(refund.approvedAt)]
                .filter(Boolean)
                .join(', ')}
            </span>
            {isRejected && refund.rejectedReason && (
              <span className='block'>Lý do: {refund.rejectedReason}</span>
            )}
          </li>
        )}
      </ol>
    </DetailSection>
  )
}
