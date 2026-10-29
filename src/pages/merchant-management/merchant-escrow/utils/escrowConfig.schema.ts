import { z } from 'zod'
import type {
  EscrowConfig,
  EscrowConfigRequest,
  EscrowOverdueAction,
  EscrowRequirementMode,
  EscrowReviewCycle
} from '../types/merchantEscrow.types'

/**
 * Luật form cấu hình ký quỹ, chép từ `MerchantEscrowConfigService.validate`/`candidate` ở BE
 * (flex.merchant origin/develop) và giữ nguyên câu thông báo của BE. FE kiểm trước để không tốn
 * một lượt xem trước/OTP cho nội dung chắc chắn bị từ chối; BE vẫn là chốt cuối.
 */
export const ESCROW_CONFIG_MESSAGE = {
  mode: 'Cách xác định mức không hợp lệ',
  fixedAmount: 'Mức ký quỹ yêu cầu phải là số nguyên không âm',
  revenueDays: 'Số ngày doanh thu phải từ 1 đến 90',
  boundsNegative: 'Mức tối thiểu và tối đa không được âm',
  boundsOrder: 'Mức tối thiểu phải nhỏ hơn hoặc bằng mức tối đa',
  reviewCycle: 'Chu kỳ soát xét không hợp lệ',
  deadlineDays: 'Thời hạn phải đủ ký quỹ phải từ 1 đến 365 ngày',
  reminderDays: 'Cảnh báo trước hạn phải nhỏ hơn thời hạn phải đủ ký quỹ',
  overdueAction: 'Cách xử lý khi quá hạn không hợp lệ',
  noChannel:
    'Mức yêu cầu lớn hơn 0 thì phải bật ít nhất một hình thức: chuyển khoản hoặc cấn trừ tại lệnh rút',
  setoffAck:
    'Cần xác nhận đã đọc cảnh báo hệ quả của việc cấn trừ tại lệnh rút trước khi lưu',
  reason: 'Thay đổi làm giảm mức bảo đảm phải ghi lý do'
} as const

/** Cửa sổ doanh thu tối đa BE nhận (`REVENUE_WINDOW_DAYS`). */
const MAX_REVENUE_DAYS = 90
const MAX_DEADLINE_DAYS = 365

const REQUIREMENT_MODES: EscrowRequirementMode[] = ['FIXED', 'AVERAGE_REVENUE']
const REVIEW_CYCLES: EscrowReviewCycle[] = ['MONTHLY', 'QUARTERLY', 'NONE']
const OVERDUE_ACTIONS: EscrowOverdueAction[] = ['WARN_ONLY', 'BLOCK_PAYMENTS']

// Ô số để trống là null; tiền và số ngày đều là số nguyên.
const optionalInt = z.number().int().nullable()

export const escrowConfigSchema = z
  .object({
    // Select để trống trả '' (quy ước của FormSelect), nên enum được kiểm ở superRefine.
    requirementMode: z.string(),
    fixedAmount: optionalInt,
    revenueDays: optionalInt,
    minAmount: optionalInt,
    maxAmount: optionalInt,
    reviewCycle: z.string(),
    allowTransfer: z.boolean(),
    allowSetoff: z.boolean(),
    setoffAcknowledged: z.boolean(),
    deadlineDays: optionalInt,
    reminderDays: optionalInt,
    overdueAction: z.string(),
    reason: z.string()
  })
  .superRefine((v, ctx) => {
    const fail = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    if (!REQUIREMENT_MODES.includes(v.requirementMode as EscrowRequirementMode))
      fail('requirementMode', ESCROW_CONFIG_MESSAGE.mode)

    if (v.requirementMode === 'FIXED') {
      if (v.fixedAmount === null || v.fixedAmount < 0)
        fail('fixedAmount', ESCROW_CONFIG_MESSAGE.fixedAmount)
    }

    if (v.requirementMode === 'AVERAGE_REVENUE') {
      if (
        v.revenueDays === null ||
        v.revenueDays < 1 ||
        v.revenueDays > MAX_REVENUE_DAYS
      )
        fail('revenueDays', ESCROW_CONFIG_MESSAGE.revenueDays)
      // Cận dưới/trên là tùy chọn ở BE; có nhập thì không âm và min ≤ max.
      if (v.minAmount !== null && v.minAmount < 0)
        fail('minAmount', ESCROW_CONFIG_MESSAGE.boundsNegative)
      if (v.maxAmount !== null && v.maxAmount < 0)
        fail('maxAmount', ESCROW_CONFIG_MESSAGE.boundsNegative)
      if (
        v.minAmount !== null &&
        v.maxAmount !== null &&
        v.minAmount > v.maxAmount
      )
        fail('minAmount', ESCROW_CONFIG_MESSAGE.boundsOrder)
      if (!REVIEW_CYCLES.includes(v.reviewCycle as EscrowReviewCycle))
        fail('reviewCycle', ESCROW_CONFIG_MESSAGE.reviewCycle)
    }

    const deadlineValid =
      v.deadlineDays !== null &&
      v.deadlineDays >= 1 &&
      v.deadlineDays <= MAX_DEADLINE_DAYS
    if (!deadlineValid) fail('deadlineDays', ESCROW_CONFIG_MESSAGE.deadlineDays)
    // BE: 0 ≤ reminderDays < deadlineDays — nhắc trước đúng ngày hạn thì vô nghĩa.
    if (
      v.reminderDays === null ||
      v.reminderDays < 0 ||
      (v.deadlineDays !== null && v.reminderDays >= v.deadlineDays)
    )
      fail('reminderDays', ESCROW_CONFIG_MESSAGE.reminderDays)

    if (!OVERDUE_ACTIONS.includes(v.overdueAction as EscrowOverdueAction))
      fail('overdueAction', ESCROW_CONFIG_MESSAGE.overdueAction)

    // Có nghĩa vụ ký quỹ mà không cho nạp bằng cách nào thì Master không thể đáp ứng.
    // Mức theo doanh thu chỉ BE tính được, nên FE chỉ chặn trước với mức cố định.
    if (
      v.requirementMode === 'FIXED' &&
      (v.fixedAmount ?? 0) > 0 &&
      !v.allowTransfer &&
      !v.allowSetoff
    )
      fail('allowTransfer', ESCROW_CONFIG_MESSAGE.noChannel)

    // Cấn trừ giữ lại một phần tiền rút của Sub: người cấu hình phải xác nhận đã đọc hệ quả.
    if (v.allowSetoff && !v.setoffAcknowledged)
      fail('setoffAcknowledged', ESCROW_CONFIG_MESSAGE.setoffAck)
  })

export type EscrowConfigFormValues = z.infer<typeof escrowConfigSchema>

/** Giá trị khởi đầu của form: lấy từ cấu hình đang áp dụng, chưa có thì để trống để người dùng chọn. */
export const toEscrowConfigFormValues = (
  current: EscrowConfig | null
): EscrowConfigFormValues => ({
  requirementMode: current?.requirementMode ?? '',
  fixedAmount:
    current?.requirementMode === 'FIXED' ? current.requiredAmount : null,
  revenueDays: current?.revenueDays ?? null,
  minAmount: current?.minAmount ?? null,
  maxAmount: current?.maxAmount ?? null,
  reviewCycle: current?.reviewCycle ?? '',
  allowTransfer: current?.allowTransfer ?? false,
  allowSetoff: current?.allowSetoff ?? false,
  // Cấn trừ đã bật từ trước thì người cấu hình đã xác nhận hệ quả lúc bật (BE cũng miễn).
  setoffAcknowledged: Boolean(
    current?.allowSetoff || current?.setoffAcknowledged
  ),
  deadlineDays: current?.deadlineDays ?? null,
  reminderDays: current?.reminderDays ?? null,
  overdueAction: current?.overdueAction ?? '',
  reason: ''
})

/**
 * Đổi giá trị form thành body xem trước/lưu. `expectedVersion` là phiên bản cấu hình đang áp dụng
 * lúc người dùng mở form: BE so với phiên bản hiện tại và trả 409 nếu ai đó vừa đổi cấu hình, để
 * không ghi đè âm thầm thay đổi của người khác.
 */
export const toEscrowConfigRequest = (
  values: EscrowConfigFormValues,
  expectedVersion: number | null
): EscrowConfigRequest => {
  const byRevenue = values.requirementMode === 'AVERAGE_REVENUE'
  return {
    expectedVersion,
    requirementMode: values.requirementMode as EscrowRequirementMode,
    fixedAmount: byRevenue ? null : values.fixedAmount,
    revenueDays: byRevenue ? values.revenueDays : null,
    minAmount: byRevenue ? values.minAmount : null,
    maxAmount: byRevenue ? values.maxAmount : null,
    reviewCycle: byRevenue ? (values.reviewCycle as EscrowReviewCycle) : null,
    allowTransfer: values.allowTransfer,
    allowSetoff: values.allowSetoff,
    setoffAcknowledged: values.setoffAcknowledged,
    deadlineDays: values.deadlineDays ?? 0,
    reminderDays: values.reminderDays ?? 0,
    overdueAction: values.overdueAction as EscrowOverdueAction,
    reason: values.reason.trim()
  }
}
