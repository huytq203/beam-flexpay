/**
 * Trạng thái **lệnh rút** của service `user-wallet`.
 *
 * Không phải trạng thái bút toán (`journal.status`) của `wallet-core` mà màn
 * danh sách giao dịch đang hiển thị và lọc. Một lệnh đang chờ duyệt vẫn nằm lẫn
 * với lệnh treo cần đối soát ở cột trạng thái journal, nên cách duy nhất biết
 * lệnh có phải duyệt hay không là đọc trường này ở chi tiết lệnh rút.
 */
export const WithdrawalStatus = {
  /** Khách nhập OTP xong, hệ thống đã giữ tiền. Dưới ngưỡng thì đi thẳng sang chi. */
  AUTHORIZED: 'AUTHORIZED',
  /** Vượt ngưỡng: dừng lại, chưa gửi gì sang ngân hàng, chờ admin quyết định. */
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  /** Đã duyệt và ĐANG chi — chưa có đồng nào rời khỏi ngân hàng. */
  APPROVED: 'APPROVED',
  PAYING: 'PAYING',
  /** Trạng thái thành công duy nhất: tiền đã ra, sổ đã ghi. */
  POSTED: 'POSTED',
  FAILED: 'FAILED',
  /** Ngân hàng không nhận hoặc trả lời không rõ — tiền vẫn bị giữ chờ đối soát. */
  RECONCILIATION_REQUIRED: 'RECONCILIATION_REQUIRED',
  /**
   * Lệnh chi hoàn tiền ra ngân hàng: bản ghi hoàn đã được phê duyệt (và đã Thành công), lệnh chi chờ Kế toán
   * duyệt chi ở màn Lịch sử rút tiền (Bước 3, 30/10).
   */
  PENDING_PAYOUT_APPROVAL: 'PENDING_PAYOUT_APPROVAL',
  /** Lệnh chi hoàn tiền đã được duyệt chi, chưa có kết quả (chi thủ công thì chờ chốt tay). */
  PAYOUT_APPROVED: 'PAYOUT_APPROVED'
} as const

export type WithdrawalStatus =
  (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus]

/**
 * Sắc thái hiển thị. `APPROVED` và `PAYING` cố tình KHÔNG dùng tông thành công:
 * tô xanh khi tiền chưa rời ngân hàng là nói dối người vận hành.
 */
export type WithdrawalStatusTone = 'neutral' | 'wait' | 'done' | 'stop'

export interface WithdrawalStatusPresentation {
  label: string
  /** Tiền của khách đang ở đâu tại trạng thái này. */
  fundsLabel: string
  /** Một câu nói rõ điều người vận hành dễ hiểu sai nhất ở trạng thái này. */
  guidance: string
  tone: WithdrawalStatusTone
}

export const WITHDRAWAL_STATUS_PRESENTATION: Record<
  WithdrawalStatus,
  WithdrawalStatusPresentation
> = {
  [WithdrawalStatus.AUTHORIZED]: {
    label: 'Đã xác thực',
    fundsLabel: 'Bị khoá, chưa trừ',
    guidance:
      'Khách đã xác thực OTP và hệ thống đã giữ tiền. Lệnh dưới ngưỡng đi thẳng sang chi, không cần duyệt.',
    tone: 'neutral'
  },
  [WithdrawalStatus.PENDING_APPROVAL]: {
    label: 'Chờ duyệt',
    fundsLabel: 'Bị khoá, chưa trừ',
    guidance:
      'Lệnh vượt ngưỡng nên dừng lại trước khi chi. Chưa gửi gì sang ngân hàng, tiền vẫn bị khoá trong ví khách.',
    tone: 'wait'
  },
  [WithdrawalStatus.APPROVED]: {
    label: 'Đã duyệt chờ chi',
    fundsLabel: 'Bị khoá, chưa trừ',
    // Không nói "đang chi": với kênh chi thủ công, lệnh đứng yên ở đây cho tới khi kế toán chuyển khoản
    // tay và chốt kết quả. Kênh API có thêm câu riêng ở khối duyệt nói rõ hệ thống đang chi.
    guidance:
      'Đã duyệt, chờ chi — chưa có đồng nào rời khỏi ngân hàng. Chỉ khi về “Đã chi — hoàn tất” thì tiền mới thật sự ra.',
    tone: 'wait'
  },
  [WithdrawalStatus.PAYING]: {
    label: 'Đang chi',
    fundsLabel: 'Bị khoá, chưa trừ',
    guidance:
      'Hệ thống đang gọi ngân hàng. Tiền vẫn bị khoá cho tới khi có kết quả.',
    tone: 'wait'
  },
  [WithdrawalStatus.POSTED]: {
    label: 'Đã chi — hoàn tất',
    fundsLabel: 'Đã trừ khỏi ví',
    guidance: 'Tiền đã ra và sổ đã ghi. Đây là trạng thái thành công duy nhất.',
    tone: 'done'
  },
  [WithdrawalStatus.FAILED]: {
    label: 'Thất bại',
    fundsLabel: 'Đã trả lại ví',
    guidance: 'Toàn bộ tiền bị giữ đã được trả về ví khách, gồm cả phí.',
    tone: 'stop'
  },
  [WithdrawalStatus.PENDING_PAYOUT_APPROVAL]: {
    label: 'Đã duyệt chờ chi',
    fundsLabel: 'Bị khoá, chưa trừ',
    guidance:
      'Yêu cầu hoàn tiền đã được phê duyệt, lệnh chi chờ Kế toán duyệt chi. Chưa gửi gì sang ngân hàng.',
    tone: 'wait'
  },
  [WithdrawalStatus.PAYOUT_APPROVED]: {
    label: 'Đã duyệt chi',
    fundsLabel: 'Bị khoá, chưa trừ',
    guidance:
      'Đã duyệt chi, chưa có kết quả từ ngân hàng. Chỉ khi về “Đã chi — hoàn tất” thì tiền mới thật sự ra.',
    tone: 'wait'
  },
  [WithdrawalStatus.RECONCILIATION_REQUIRED]: {
    label: 'Chờ đối soát',
    fundsLabel: 'Bị khoá, chờ đối soát',
    guidance:
      'Ngân hàng không nhận hoặc trả lời không rõ. Tiền vẫn bị giữ, chờ người đối soát xử lý.',
    tone: 'stop'
  }
}

/** Ràng buộc độ dài của `POST /withdrawals/{transactionCode}/approve`. */
export const WITHDRAWAL_NOTE_MIN_LENGTH = 1
export const WITHDRAWAL_NOTE_MAX_LENGTH = 500

/** Ràng buộc độ dài của `POST /withdrawals/{transactionCode}/reject`: chỉ bắt buộc nhập, không đặt tối thiểu. */
export const WITHDRAWAL_REASON_MIN_LENGTH = 1
export const WITHDRAWAL_REASON_MAX_LENGTH = 255

export interface WithdrawalApproveArg {
  transactionCode: string
  /** Căn cứ duyệt, đi thẳng vào lịch sử và audit log. */
  note: string
}

export interface WithdrawalRejectArg {
  transactionCode: string
  /** Lý do từ chối — thứ duy nhất giải thích được với khách hàng. */
  reason: string
}

/** Khuôn response chung của cả hai endpoint quyết định. */
export interface WithdrawalDecisionResult {
  transactionCode: string
  previousStatus: string
  newStatus: string
  grossAmount: number | null
  amount: number | null
  fee: number | null
  note: string | null
  rejectedReason: string | null
  updatedBy: string | null
  updatedAt: string | null
}

/**
 * Chế độ chi do BE quyết theo ngân hàng thụ hưởng (28/10):
 * - `API`: hệ thống tự gửi lệnh sang ngân hàng có rail chi.
 * - `MANUAL`: ngân hàng chưa có API, admin chuyển khoản tay rồi chốt kết quả.
 *
 * FE chỉ đọc để hiển thị, **không** tự suy chế độ từ mã ngân hàng và không có ô
 * chọn chế độ. Có hiện nút chốt tay hay không đọc từ `awaitingManualConfirmation`.
 */
export const PayoutMode = {
  API: 'API',
  MANUAL: 'MANUAL'
} as const

export type PayoutMode = (typeof PayoutMode)[keyof typeof PayoutMode]
