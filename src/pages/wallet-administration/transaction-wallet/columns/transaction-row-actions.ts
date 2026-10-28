import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { StatusEnum } from '../constants/Transaction.constant'
import {
  getDisplayStatus,
  getRefundOriginalType,
  readRefundFields
} from '../dto/transactionRefund.dto'

export interface FreezeTargetParty {
  ownerId: string
  ownerName: string
  ownerType: 'USER' | 'MERCHANT'
  roleLabel: 'Người chuyển' | 'Người nhận'
}

const isWalletParty = (
  party: UnifiedContentJournal['from'] | UnifiedContentJournal['to']
): party is UnifiedContentJournal['from'] & {
  id: string
  type: 'USER' | 'MERCHANT'
} => Boolean(party?.id) && (party.type === 'USER' || party.type === 'MERCHANT')

/**
 * Lệnh đang chờ phê duyệt. Sổ cái vẫn ghi `PENDING` nên phải đọc `displayStatus`: ở trạng thái
 * này chỉ luồng Duyệt/Từ chối được chốt lệnh, nút cập nhật giao dịch treo phải ẩn.
 */
export const isPendingApprovalTransaction = (
  transaction: Pick<UnifiedContentJournal, 'status' | 'displayStatus'>
): boolean =>
  getDisplayStatus(transaction) === StatusEnum.PENDING_APPROVAL ||
  transaction.status === StatusEnum.PENDING_APPROVAL

/**
 * Ẩn nút cập nhật giao dịch treo: lệnh chờ duyệt (chỉ Duyệt/Từ chối được chốt) hoặc lệnh rút đã
 * `FAILED` ở user-wallet dù sổ cái còn PENDING/AUTHORIZED, vì không còn gì để xử lý.
 */
export const shouldHideStuckUpdateAction = (
  transaction: Pick<UnifiedContentJournal, 'status' | 'displayStatus'>
): boolean =>
  isPendingApprovalTransaction(transaction) ||
  getDisplayStatus(transaction) === StatusEnum.FAILED

/** POSTED là trạng thái thành công của journal và luôn phải có GL transaction để đóng băng. */
export const canShowFreezeTransactionAction = (
  transaction: UnifiedContentJournal
): boolean =>
  transaction.status === StatusEnum.POSTED && Boolean(transaction.transactionId)

/** Đã hoàn đủ số tiền giao dịch: không còn gì để hoàn nên không hiện nút. */
const isFullyRefunded = (transaction: UnifiedContentJournal): boolean => {
  const { refundedAmount } = readRefundFields(transaction)
  return (
    refundedAmount != null &&
    transaction.amount > 0 &&
    refundedAmount >= transaction.amount
  )
}

/** Toàn bộ số tiền giao dịch đã nằm trong yêu cầu hoàn đang chờ: tạo thêm sẽ bị BE từ chối. */
const isFullyPendingRefund = (transaction: UnifiedContentJournal): boolean => {
  const { pendingRefundAmount } = readRefundFields(transaction)
  return (
    pendingRefundAmount != null &&
    transaction.amount > 0 &&
    pendingRefundAmount >= transaction.amount
  )
}

/**
 * Ma trận nút Lịch sử giao dịch: Hoàn tiền chỉ với giao dịch thành công, không bị đóng
 * băng, chưa hoàn toàn bộ, chưa có yêu cầu hoàn chờ đủ số tiền, thuộc loại hoàn được và có `transactionId` (id wallet-core mà
 * BE cần). Hoàn một phần vẫn hiện nút; số tiền còn hoàn được do BE kiểm khi gửi yêu cầu.
 * Quyền `EWALLET:FULL` kiểm riêng ở nơi gọi.
 */
export const canShowRefundTransactionAction = (
  transaction: UnifiedContentJournal
): boolean =>
  transaction.status === StatusEnum.POSTED &&
  !transaction.frozen &&
  !isFullyRefunded(transaction) &&
  !isFullyPendingRefund(transaction) &&
  Boolean(transaction.transactionId) &&
  getRefundOriginalType(transaction.transactionType) !== null

/** Đã hoàn đủ và không còn yêu cầu hoàn đang chờ: tiền đã trả lại hết, đóng băng không còn ý nghĩa. */
const isRefundSettled = (transaction: UnifiedContentJournal): boolean => {
  const { pendingRefundAmount } = readRefundFields(transaction)
  return isFullyRefunded(transaction) && !pendingRefundAmount
}

export type FreezeTransactionAction = 'freeze' | 'unfreeze'

export const getFreezeTransactionAction = (
  transaction: UnifiedContentJournal
): FreezeTransactionAction | null => {
  if (!canShowFreezeTransactionAction(transaction)) return null
  if (transaction.frozen) return 'unfreeze'
  return isRefundSettled(transaction) ? null : 'freeze'
}

/**
 * Một giao dịch có thể chạm hai ví nội bộ (P2P). Trả cả hai để người vận hành chọn
 * đúng ví, thay vì suy đoán ownerId nào là accountId.
 */
export const getFreezeTargetParties = (
  transaction: UnifiedContentJournal
): FreezeTargetParty[] => {
  const candidates = [
    { party: transaction.to, roleLabel: 'Người nhận' as const },
    { party: transaction.from, roleLabel: 'Người chuyển' as const }
  ]

  const seenOwnerIds = new Set<string>()
  return candidates.flatMap(({ party, roleLabel }) => {
    if (!isWalletParty(party) || seenOwnerIds.has(party.id)) return []
    seenOwnerIds.add(party.id)

    return [
      {
        ownerId: party.id,
        ownerName: party.username || party.displayName || '--',
        ownerType: party.type,
        roleLabel
      }
    ]
  })
}
