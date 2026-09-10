import type { JournalSummaryItem } from './JournalSummary'

/**
 * Bộ ô mặc định: ba trạng thái mà `/wallet/journal/unified` đếm được và lọc
 * được bằng đúng một giá trị `status`. Nhãn bám từ vựng trạng thái của bảng để
 * ô tổng quan và cột "Trạng thái" gọi cùng một thứ bằng cùng một tên.
 */
export const JOURNAL_STATUS_ITEMS = [
  {
    key: 'successCount',
    label: 'Thành công',
    status: 'POSTED',
    toneClass: 'text-success-strong'
  },
  {
    key: 'pendingCount',
    label: 'Chờ xử lý',
    status: 'PENDING',
    toneClass: 'text-warning-strong'
  },
  {
    key: 'failedCount',
    label: 'Thất bại',
    status: 'FAILED',
    toneClass: 'text-danger-strong'
  }
] as const satisfies readonly JournalSummaryItem[]
