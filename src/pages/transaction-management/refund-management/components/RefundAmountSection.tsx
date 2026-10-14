import { REFUND_DEBTOR_LABELS } from '../constants/refund.constants'
import { RefundOriginalType, type RefundDetail } from '../schemas/refund.schema'
import { formatVnd } from '../utils/refund.utils'
import { DetailRows, DetailSection } from './DetailSection'

interface RefundAmountSectionProps {
  refund: RefundDetail
}

export function RefundAmountSection({ refund }: RefundAmountSectionProps) {
  const isMerchant = refund.originalType === RefundOriginalType.MERCHANT_PAYMENT
  const rows = [
    {
      label: 'Giao dịch gốc',
      value: formatVnd(refund.originalAmount),
      numeric: true
    },
    {
      label: 'Số tiền yêu cầu hoàn',
      value: formatVnd(refund.requestedAmount),
      numeric: true
    },
    {
      label: 'Phí gốc hoàn cho khách',
      value: formatVnd(refund.senderFeeReversal),
      numeric: true
    },
    ...(isMerchant
      ? [
          {
            label: 'Phí gốc hoàn cho merchant',
            value: formatVnd(refund.receiverFeeReversal),
            numeric: true
          }
        ]
      : []),
    {
      label: 'Phí xử lý bên gửi',
      value: formatVnd(refund.senderProcessingFee),
      numeric: true
    },
    {
      label: 'Phí xử lý bên nhận',
      value: formatVnd(refund.receiverProcessingFee),
      numeric: true
    },
    {
      label: 'Khách thực nhận',
      value: formatVnd(refund.netCredit),
      strong: true
    },
    {
      label: REFUND_DEBTOR_LABELS[refund.originalType] ?? 'Bên bị trừ',
      value: formatVnd(refund.netDebit),
      strong: true
    }
  ]
  return (
    <DetailSection
      title='Số tiền'
    // note='Số liệu do hệ thống tính, không tính lại trên màn hình.'
    >
      <DetailRows rows={rows} />
    </DetailSection>
  )
}
