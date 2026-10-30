import {
  WITHDRAWAL_STATUS_PRESENTATION,
  WithdrawalStatus,
  type WithdrawalStatusTone
} from '@type/withdrawalApproval.type'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { STATUS_CONFIG } from './WithdrawHistory.constant'

const TONE_CLASS: Record<WithdrawalStatusTone, string> = {
  neutral: 'normal-status',
  wait: 'warning-status',
  done: 'success-status',
  stop: 'danger-status'
}

/**
 * Các bước của lệnh rút mà sổ cái (`journal.status`) không có. Nhãn lấy từ
 * `WITHDRAWAL_STATUS_PRESENTATION` để cột trạng thái và khối duyệt lệnh không gọi một bước bằng hai tên.
 */
const WITHDRAWAL_STEPS = [
  WithdrawalStatus.AUTHORIZED,
  WithdrawalStatus.PENDING_APPROVAL,
  WithdrawalStatus.APPROVED,
  WithdrawalStatus.PAYING,
  WithdrawalStatus.RECONCILIATION_REQUIRED,
  // Lệnh chi hoàn tiền: chờ Kế toán duyệt chi / đã duyệt chi chưa có kết quả (Bước 3, 30/10).
  WithdrawalStatus.PENDING_PAYOUT_APPROVAL,
  WithdrawalStatus.PAYOUT_APPROVED
] as const

const stepConfig = Object.fromEntries(
  WITHDRAWAL_STEPS.map((step) => {
    const { label, tone } = WITHDRAWAL_STATUS_PRESENTATION[step]
    return [step, { label, className: TONE_CLASS[tone] }]
  })
) as Record<
  (typeof WITHDRAWAL_STEPS)[number],
  { label: string; className: string }
>

/** Cấu hình huy hiệu cho `displayStatus`: các giá trị sổ cái giữ nhãn cũ của màn, các bước rút thêm nhãn riêng. */
export const WITHDRAW_DISPLAY_STATUS_CONFIG = {
  ...STATUS_CONFIG,
  ...stepConfig
}

/**
 * Trạng thái hiển thị của một dòng: BE gắn `displayStatus` từ trạng thái thật của lệnh rút ở user-wallet, nên
 * danh sách và chi tiết cùng đọc một giá trị. BE cũ chưa có trường này thì dùng trạng thái sổ cái.
 */
export const resolveDisplayStatus = (
  row: Pick<UnifiedContentJournal, 'status' | 'displayStatus'>
): string => row.displayStatus || row.status
