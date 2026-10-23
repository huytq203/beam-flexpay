import type {
  FreezeDisplayStatus,
  UnfreezeCommandStatus
} from '@constants/freeze.constant'

export interface UnfreezeLog {
  id: string
  /** Lệnh đóng băng mà lần mở này thuộc về. */
  freezeCode: string | null
  amount: number
  shortfallReleased: number
  releasedAmount: number
  reason: string | null
  makerId: string
  checkerId: string
  performedBy: string
  performedAt: string
}

export interface UnfreezeCommand {
  id: string
  commandKey: string
  actionType: string
  targetId: string
  targetAccountId: string
  executionReference: string | null
  status: UnfreezeCommandStatus
  makerId: string
  checkerId: string | null
  reason: string | null
  rejectionReason: string | null
  evidenceReference: string | null
  executedJournalId: string | null
  approvedAt: string | null
  executedAt: string | null
  amount: number
  createdAt: string
}

export interface RootFreeze {
  data: DataFreeze
  message: string
  detail: string
  success: boolean
  status: string
}

export interface DataFreeze {
  content: FreezeItem[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: Sort
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface FreezeItem {
  id: string
  accountId: string
  /** Chỉ lệnh admin đóng băng thủ công mới có mã (FZ + 8 ký tự); hold hệ thống và dòng bù là null. */
  freezeCode: string | null
  sourceTransactionId: string | null
  sourceTransactionCode: string | null
  ownerId: string
  ownerType: string
  ownerUsername: string | null
  /** Số tiền của riêng dòng này. Cả lệnh nằm ở `totalHeldAmount`. */
  amount: number
  requestedAmount: number
  releasedAmount: number
  remainingAmount: number
  /** Phần chưa giữ được vì ví không đủ tiền; hệ thống bù dần mỗi khi tiền về. */
  shortfallAmount: number
  /** Tổng đang giữ của cả lệnh: dòng gốc cộng mọi dòng bù. */
  totalHeldAmount: number
  /** Tổng đã giải  của cả lệnh, gộp cùng cách với `totalHeldAmount`. */
  totalReleasedAmount: number
  /** Số lần hệ thống lấp thêm tiền vào lệnh này. */
  topUpCount: number
  parentFreezeId: string | null
  displayStatus: FreezeDisplayStatus
  reason?: string | null
  unfreezeReason: string | null
  status: string
  releaseType: string | null
  type: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  /** Lịch sử các lần mở băng đã thực hiện. */
  unfreezeLogs: UnfreezeLog[]
  /** Lệnh mở băng gần nhất gắn với bản ghi này. */
  unfreezeCommandId: string | null
  unfreezeCommandStatus: UnfreezeCommandStatus | null
  unfreezeCommandAmount: number | null
  /** Người tạo lệnh; còn được trả về để tương thích dữ liệu lịch sử. */
  unfreezeCommandMakerId: string | null
  unfreezeCommandReason: string | null
  unfreezeCommandCreatedAt: string | null
  /** Toàn bộ lệnh mở băng liên quan đến bản ghi này. */
  unfreezeCommands: UnfreezeCommand[]
}

/** @deprecated Dùng UnfreezeCommand thay thế. */
export type ManualMoneyCommand = UnfreezeCommand

export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: Sort
  offset: number
  paged: boolean
  unpaged: boolean
}

export interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}
