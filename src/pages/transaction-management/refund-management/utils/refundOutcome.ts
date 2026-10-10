import { RefundStatus, type RefundDetail } from '../schemas/refund.schema'
import { SETTLE_AGAIN_HINT } from '../constants/refund.constants'

export type OutcomeKind = 'success' | 'warning'

export interface RefundOutcome {
  kind: OutcomeKind
  text: string
}

/** Đọc `data.status` sau khi duyệt: BE trả HTTP 200 cho cả các trạng thái chưa xong. */
export const describeApproveOutcome = (refund: RefundDetail): RefundOutcome => {
  const failure = refund.failureReason ?? ''
  switch (refund.status) {
    case RefundStatus.SUCCESS:
      return { kind: 'success', text: 'Đã duyệt. Hoàn tiền hoàn thành.' }
    case RefundStatus.PROCESSING:
      if (failure.includes(SETTLE_AGAIN_HINT)) {
        return {
          kind: 'warning',
          text: `Đã duyệt nhưng chưa chuyển được tiền. ${failure}.`
        }
      }
      return {
        kind: 'success',
        text: refund.payoutCode
          ? `Đã duyệt. Lệnh chi ${refund.payoutCode} đang chờ ngân hàng.`
          : 'Đã duyệt, đang chuyển tiền.'
      }
    case RefundStatus.WAITING_FUNDS:
      return {
        kind: 'warning',
        text: `Đã duyệt. ${failure || 'Quỹ chưa đủ, yêu cầu chờ đủ số dư.'}`
      }
    case RefundStatus.PENDING_APPROVAL:
      return {
        kind: 'warning',
        text: failure
          ? `Duyệt chưa thành công: ${failure}`
          : 'Duyệt chưa thành công, yêu cầu vẫn ở Chờ duyệt.'
      }
    default:
      return { kind: 'success', text: 'Đã duyệt yêu cầu hoàn tiền.' }
  }
}

export const describeSettleOutcome = (success: boolean): string =>
  success
    ? 'Đã quyết toán, hoàn tiền hoàn thành.'
    : 'Đã nhả tiền giữ, yêu cầu quay về Chờ duyệt.'

export const describePayoutOutcome = (refund: RefundDetail): string =>
  refund.status === RefundStatus.SUCCESS
    ? 'Ngân hàng đã xác nhận, hoàn tiền hoàn thành.'
    : 'Đã làm mới lệnh chi, yêu cầu vẫn đang chờ ngân hàng.'
