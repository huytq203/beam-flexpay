import {
  FREEZE_BADGE_PENDING_APPROVAL,
  FreezeStatus,
  UnfreezeCommandStatus,
  type FreezeBadgeKey
} from '@constants/freeze.constant'
import type { FreezeItem } from '@type/freeze.type'

type FreezeCommandState = Pick<
  FreezeItem,
  'unfreezeCommandId' | 'unfreezeCommandStatus'
>

type FreezeBadgeSource = FreezeCommandState & Pick<FreezeItem, 'displayStatus'>

type FreezeActionSource = FreezeCommandState & Pick<FreezeItem, 'status'>

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

export const FreezeRowAction = {
  /** Chưa ai yêu cầu mở băng — bước maker. */
  REQUEST_UNFREEZE: 'REQUEST_UNFREEZE',
  /** Đang chờ duyệt — bước checker, duyệt hoặc từ chối. */
  DECIDE_UNFREEZE: 'DECIDE_UNFREEZE',
  NONE: 'NONE'
} as const

export type FreezeRowAction =
  (typeof FreezeRowAction)[keyof typeof FreezeRowAction]

/**
 * Một dòng chỉ mở đúng một bước của maker-checker. Không có `unfreezeCommandId` thì không
 * gọi được endpoint duyệt, nên trạng thái chờ duyệt mà thiếu id vẫn coi như không có hành động.
 */
export const getFreezeRowAction = (
  item: FreezeActionSource
): FreezeRowAction => {
  if (isAwaitingUnfreezeApproval(item)) {
    return item.unfreezeCommandId
      ? FreezeRowAction.DECIDE_UNFREEZE
      : FreezeRowAction.NONE
  }

  return item.status === FreezeStatus.ACTIVE
    ? FreezeRowAction.REQUEST_UNFREEZE
    : FreezeRowAction.NONE
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
