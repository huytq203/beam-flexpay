import {
  FreezeStatus,
} from '@constants/freeze.constant'
import type { FreezeItem } from '@type/freeze.type'

type FreezeActionSource = Pick<
  FreezeItem,
  | 'status'
  | 'remainingAmount'
  | 'shortfallAmount'
  | 'amount'
>

export const FreezeRowAction = {
  REQUEST_UNFREEZE: 'REQUEST_UNFREEZE',
  NONE: 'NONE'
} as const

export type FreezeRowAction =
  (typeof FreezeRowAction)[keyof typeof FreezeRowAction]

export interface FreezeRowActionFlags {
  /** Bản ghi ACTIVE còn tiền/phần thiếu có thể mở băng trực tiếp. */
  canRequestUnfreeze: boolean
}

/**
 * Xác định các hành động khả dụng trên một dòng.
 * `remainingAmount` đã trừ phần đã mở băng nên không được trừ/cộng lịch sử lần nữa.
 */
export const getFreezeRowActionFlags = (
  item: FreezeActionSource
): FreezeRowActionFlags => {
  if (item.status !== FreezeStatus.ACTIVE) {
    return { canRequestUnfreeze: false }
  }

  const releasable =
    (item.remainingAmount ?? item.amount) + (item.shortfallAmount ?? 0)
  const canRequestUnfreeze = releasable > 0

  return { canRequestUnfreeze }
}

export const getFreezeRowAction = (
  item: FreezeActionSource
): FreezeRowAction => {
  const { canRequestUnfreeze } = getFreezeRowActionFlags(item)
  if (canRequestUnfreeze) return FreezeRowAction.REQUEST_UNFREEZE
  return FreezeRowAction.NONE
}

/**
 * Trần một lệnh mở băng được phép xin, đúng theo `requireReleasableAmount` của wallet-core:
 * phần còn giữ CỘNG phần còn thiếu. Admin được bỏ đòi phần chưa giữ được rồi nhả tiếp tiền
 * đang giữ, tối đa là toàn bộ những gì lệnh đang đòi. Gửi `amount` gốc sẽ vượt trần ngay khi
 * lệnh đã giải  một phần và BE trả UNFREEZE_AMOUNT_EXCEEDS_REMAINING.
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
