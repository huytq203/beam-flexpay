import {
  FREEZE_BADGE_PENDING_APPROVAL,
  FreezeStatus,
  UnfreezeCommandStatus,
  type FreezeBadgeKey
} from '@constants/freeze.constant'
import type { FreezeItem, UnfreezeCommand } from '@type/freeze.type'

type FreezeCommandState = Pick<
  FreezeItem,
  'unfreezeCommandId' | 'unfreezeCommandStatus'
>

type FreezeBadgeSource = FreezeCommandState & Pick<FreezeItem, 'displayStatus'>

type FreezeActionSource = Pick<
  FreezeItem,
  | 'status'
  | 'unfreezeCommandId'
  | 'unfreezeCommandStatus'
  | 'unfreezeCommands'
  | 'remainingAmount'
  | 'shortfallAmount'
  | 'amount'
>

/** Đã có lệnh mở băng chờ checker duyệt; tiền vẫn nằm trong hold cho tới khi lệnh được duyệt. */
export const isAwaitingUnfreezeApproval = (
  item: FreezeCommandState
): boolean =>
  item.unfreezeCommandStatus === UnfreezeCommandStatus.PENDING_APPROVAL

/**
 * Lệnh chờ duyệt được ưu tiên hơn `displayStatus` của BE: người vận hành cần biết khoản này
 * đã có người xử lý, chứ không phải nó vẫn đang đóng băng như mọi khoản khác.
 */
export const resolveFreezeBadgeKey = (
  item: FreezeBadgeSource
): FreezeBadgeKey =>
  isAwaitingUnfreezeApproval(item)
    ? FREEZE_BADGE_PENDING_APPROVAL
    : item.displayStatus

/**
 * Tổng lượng tiền đã được "cam kết" bởi các lệnh mở băng đang active (PENDING_APPROVAL hoặc
 * EXECUTED). Dùng để kiểm tra xem còn có thể tạo thêm lệnh mở băng hay không.
 */
export const getCommittedUnfreezeAmount = (
  commands: UnfreezeCommand[]
): number =>
  commands
    .filter(
      (c) =>
        c.status === UnfreezeCommandStatus.PENDING_APPROVAL ||
        c.status === UnfreezeCommandStatus.EXECUTED
    )
    .reduce((sum, c) => sum + c.amount, 0)

export const FreezeRowAction = {
  /** Chưa ai yêu cầu mở băng — bước maker. */
  REQUEST_UNFREEZE: 'REQUEST_UNFREEZE',
  /** Đang chờ duyệt — bước checker, duyệt hoặc từ chối. */
  DECIDE_UNFREEZE: 'DECIDE_UNFREEZE',
  NONE: 'NONE'
} as const

export type FreezeRowAction =
  (typeof FreezeRowAction)[keyof typeof FreezeRowAction]

export interface FreezeRowActionFlags {
  /** Committed chưa cover hết releasable và bản ghi đang ACTIVE → có thể tạo lệnh mở băng mới. */
  canRequestUnfreeze: boolean
  /** Đang có lệnh PENDING_APPROVAL với commandId hợp lệ → checker có thể duyệt/từ chối. */
  canDecideUnfreeze: boolean
}

/**
 * Xác định các hành động khả dụng trên một dòng.
 *
 * - canDecideUnfreeze: có lệnh PENDING_APPROVAL với commandId hợp lệ.
 * - canRequestUnfreeze: ACTIVE + không có lệnh PENDING + tổng committed < releasable.
 *   BE hiện chưa hỗ trợ tạo nhiều lệnh đồng thời — phải chờ lệnh PENDING được duyệt/từ chối
 *   trước khi tạo lệnh mới.
 */
export const getFreezeRowActionFlags = (
  item: FreezeActionSource
): FreezeRowActionFlags => {
  if (item.status !== FreezeStatus.ACTIVE) {
    return { canRequestUnfreeze: false, canDecideUnfreeze: false }
  }

  const canDecideUnfreeze =
    isAwaitingUnfreezeApproval(item) && !!item.unfreezeCommandId

  // Không cho tạo lệnh mới khi đang có lệnh chờ duyệt (BE chưa hỗ trợ parallel requests).
  if (canDecideUnfreeze) {
    return { canRequestUnfreeze: false, canDecideUnfreeze: true }
  }

  const releasable =
    (item.remainingAmount ?? item.amount) + (item.shortfallAmount ?? 0)
  const committed = getCommittedUnfreezeAmount(item.unfreezeCommands ?? [])
  const canRequestUnfreeze = committed < releasable

  return { canRequestUnfreeze, canDecideUnfreeze: false }
}

/**
 * @deprecated Dùng getFreezeRowActionFlags thay thế — enum không đủ biểu đạt trạng thái kết hợp
 * (vừa có lệnh pending vừa còn có thể tạo thêm lệnh partial).
 */
export const getFreezeRowAction = (
  item: FreezeActionSource
): FreezeRowAction => {
  const { canRequestUnfreeze, canDecideUnfreeze } = getFreezeRowActionFlags(item)
  if (canDecideUnfreeze) return FreezeRowAction.DECIDE_UNFREEZE
  if (canRequestUnfreeze) return FreezeRowAction.REQUEST_UNFREEZE
  return FreezeRowAction.NONE
}

/**
 * Trần một lệnh mở băng được phép xin, đúng theo `requireReleasableAmount` của wallet-core:
 * phần còn giữ CỘNG phần còn thiếu. Admin được bỏ đòi phần chưa giữ được rồi nhả tiếp tiền
 * đang giữ, tối đa là toàn bộ những gì lệnh đang đòi. Gửi `amount` gốc sẽ vượt trần ngay khi
 * lệnh đã giải tỏa một phần và BE trả UNFREEZE_AMOUNT_EXCEEDS_REMAINING.
 */
export const getReleasableAmount = (item: FreezeItem): number =>
  (item.remainingAmount ?? item.amount) + (item.shortfallAmount ?? 0)

export interface FreezeAmountSummary {
  /** Số thực sự đang bị giữ của cả lệnh, đã gộp các dòng bù. */
  held: number
  released: number
  shortfall: number
  topUpCount: number
}

/**
 * Ưu tiên số tổng của cả lệnh; rơi về số của riêng dòng khi BE chưa gộp (bản ghi bù,
 * hoặc endpoint cũ chưa trả `totalHeldAmount`).
 */
export const getFreezeAmountSummary = (
  item: FreezeItem
): FreezeAmountSummary => ({
  held: item.totalHeldAmount ?? item.remainingAmount ?? item.amount,
  released: item.totalReleasedAmount ?? item.releasedAmount ?? 0,
  shortfall: item.shortfallAmount ?? 0,
  topUpCount: item.topUpCount ?? 0
})
