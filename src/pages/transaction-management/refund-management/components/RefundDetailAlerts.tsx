import {
  WAITING_FUNDS_HINT,
  WALLET_FAILURE_HINT
} from '../constants/refund.constants'
import { RefundDisplayStatus } from '@constants/refund.constant'
import { RefundStatus, type RefundDetail } from '../schemas/refund.schema'
import { getDisplayStatus, type RefundActionFlags } from '../utils/refund.utils'
import { RefundNote } from './RefundNote'

interface RefundDetailAlertsProps {
  refund: RefundDetail
  flags: RefundActionFlags
  canApprove: boolean
}

const RETRY_HINT = 'duyệt lại, tiền không bị trừ hai lần.'

const getRetryHint = (refund: RefundDetail): string =>
  refund.failureReason === WALLET_FAILURE_HINT
    ? `Kiểm tra số dư ví merchant rồi ${RETRY_HINT}`
    : `Kiểm tra nguyên nhân rồi ${RETRY_HINT}`

const isFailureRecord = (refund: RefundDetail): boolean =>
  getDisplayStatus(refund) === RefundDisplayStatus.FAILED_REFUND

export function RefundDetailAlerts({
  refund,
  flags,
  canApprove
}: RefundDetailAlertsProps) {
  const failure = refund.failureReason
  return (
    <>
      {failure && refund.status === RefundStatus.PROCESSING && (
        <RefundNote
          tone='warning'
          title='Đã duyệt, chuyển tiền chưa xong.'
        >
          Khoản giữ vẫn còn, không mất tiền. {failure}.
          {flags.settle && ' Dùng Quyết toán lại.'}
        </RefundNote>
      )}
      {failure && refund.status === RefundStatus.WAITING_FUNDS && (
        <RefundNote
          tone='warning'
          title={`${failure}.`}
        >
          {failure.startsWith(WAITING_FUNDS_HINT)
            ? 'Hệ thống tự làm đầy khi quỹ được nạp thêm.'
            : ''}
        </RefundNote>
      )}
      {failure && refund.status === RefundStatus.PENDING_APPROVAL && (
        <RefundNote
          tone='danger'
          title='Lần duyệt gần nhất lỗi.'
        >
          {failure}. {getRetryHint(refund)}
        </RefundNote>
      )}
      {flags.isOwnRequest &&
        canApprove &&
        refund.status === RefundStatus.PENDING_APPROVAL && (
          <RefundNote tone='info'>
            Bạn là người tạo yêu cầu này. Cần một người khác có quyền duyệt hoặc
            từ chối.
          </RefundNote>
        )}
      {refund.status === RefundStatus.PENDING_PAYOUT_APPROVAL && (
        <RefundNote
          tone='info'
          title='Chờ Kế toán duyệt chi.'
        >
          Tiền đã được giữ. Lệnh chi chưa được gửi sang ngân hàng cho tới khi Kế
          toán duyệt chi; từ chối chi sẽ đóng yêu cầu và nhả tiền giữ.
        </RefundNote>
      )}
      {isFailureRecord(refund) && (
        <RefundNote tone='info'>
          Bản ghi Thất bại hoàn tiền, chỉ để đối soát. Số dư ví không đổi.
        </RefundNote>
      )}
    </>
  )
}
