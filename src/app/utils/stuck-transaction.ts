import { StatusEnum } from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { isWithdrawalPendingApproval } from './withdrawal-approval'

/**
 * Trạng thái bút toán đã có kết quả cuối — không cập nhật lại được nữa.
 * `SETTLED` nằm ở đây vì đã quyết toán xong, không còn là giao dịch treo.
 */
const TERMINAL_JOURNAL_STATUSES = new Set<string>([
  StatusEnum.POSTED,
  StatusEnum.FAILED,
  StatusEnum.CANCELLED,
  StatusEnum.SETTLED
])

/**
 * Giao dịch treo = bút toán chưa có kết quả cuối (`PENDING` / `AUTHORIZED`).
 *
 * Trạng thái lạ (BE thêm mới) được coi là **chưa** treo: mở nhầm một nút chốt
 * sổ cái nguy hiểm hơn nhiều so với việc thiếu nút và phải hỏi lại.
 */
export const isStuckJournalStatus = (
  journalStatus: string | null | undefined
): boolean =>
  journalStatus === StatusEnum.PENDING ||
  journalStatus === StatusEnum.AUTHORIZED

export const isTerminalJournalStatus = (
  journalStatus: string | null | undefined
): boolean =>
  typeof journalStatus === 'string' &&
  TERMINAL_JOURNAL_STATUSES.has(journalStatus)

/**
 * `update-status` từ chối lệnh rút đang ở `PENDING_APPROVAL`, cả khi chọn Thành
 * công lẫn Thất bại.
 *
 * Lý do phải **ẩn** chứ không phải vô hiệu hoá: cùng một nút "Thành công" mang
 * hai nghĩa trái ngược. Với giao dịch treo nó có nghĩa *ngân hàng xử lý xong
 * rồi, ghi sổ đi*; với lệnh chờ duyệt nó sẽ có nghĩa *hãy chi tiền thật*. Trên
 * màn danh sách cả hai đều hiện "Chờ xử lý", bấm nhầm là đẩy đi hàng chục triệu
 * trong khi tưởng chỉ đang dọn dữ liệu.
 */
export const canUpdateStuckTransaction = (
  journalStatus: string | null | undefined,
  withdrawalStatus?: string | null
): boolean =>
  isStuckJournalStatus(journalStatus) &&
  !isWithdrawalPendingApproval(withdrawalStatus)
