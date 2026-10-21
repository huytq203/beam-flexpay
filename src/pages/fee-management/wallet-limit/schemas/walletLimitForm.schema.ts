import {
  WalletLimitPaymentMethod,
  WalletLimitScope,
  WalletLimitStatus,
  WalletLimitTransactionType
} from '@type/walletLimit.type'
import { z, type RefinementCtx } from 'zod'
import {
  LIMIT_FIELD_LABELS,
  type LimitFieldKey
} from '../constants/walletLimit.constants'

export const INCOMPLETE_OVERRIDE_MESSAGE =
  'Vui lòng nhập đầy đủ các giá trị hạn mức cho dòng này.'
export const MISSING_TARGET_MESSAGE = 'Vui lòng chọn mã định danh.'
export const MISSING_BANK_OR_METHOD_MESSAGE =
  'Mỗi dòng phải chọn ngân hàng hoặc phương thức.'
export const MISMATCHED_METHOD_MESSAGE =
  'Ngân hàng/phương thức không phù hợp với loại giao dịch.'

const amount = z.number().nullable()

const overrideSchema = z.object({
  transactionType: z.enum([
    WalletLimitTransactionType.DEPOSIT,
    WalletLimitTransactionType.WITHDRAWAL,
    WalletLimitTransactionType.TRANSFER
  ]),
  /** Chuỗi rỗng = không chọn ngân hàng. */
  bankCode: z.string(),
  paymentMethod: z.union([z.literal(''), z.enum(WalletLimitPaymentMethod)]),
  minPerTransaction: amount,
  maxPerTransaction: amount,
  dailyMaximum: amount,
  normalMonthlyMaximum: amount,
  specialMonthlyMaximum: amount
})

const baseSchema = z.object({
  scopeType: z.enum(WalletLimitScope),
  /** Phạm vi lúc chọn bản ghi: đổi Đối tượng thì lựa chọn cũ không còn hiệu lực. */
  targetScope: z.union([z.literal(''), z.enum(WalletLimitScope)]),
  targetId: z.string(),
  targetDisplay: z.string(),
  walletType: z.string(),
  transactionType: z.enum(WalletLimitTransactionType),
  status: z.enum(WalletLimitStatus),
  /** Phiên bản đang hiển thị; chỉ dùng khi cập nhật. */
  rowVersion: z.number().nullable(),
  minPerTransaction: amount,
  maxPerTransaction: amount,
  dailyMaximum: amount,
  normalMonthlyMaximum: amount,
  specialMonthlyMaximum: amount,
  walletBalanceMaximum: amount,
  outflowDailyMaximum: amount,
  outflowMonthlyMaximum: amount,
  outboundMaxTimesPerDay: amount,
  approvalThreshold: amount,
  bankOverrides: z.array(overrideSchema)
})

type BaseValues = z.infer<typeof baseSchema>
type OverrideValues = z.infer<typeof overrideSchema>

const isPositive = (value: number | null): value is number =>
  value !== null && value > 0

const fail = (ctx: RefinementCtx, path: (string | number)[], message: string) =>
  ctx.addIssue({ code: 'custom', path, message })

const validateTarget = (values: BaseValues, ctx: RefinementCtx) => {
  if (values.scopeType === WalletLimitScope.SYSTEM) return
  if (values.targetId && values.targetScope === values.scopeType) return
  fail(ctx, ['targetId'], MISSING_TARGET_MESSAGE)
}

/** Thứ tự BE kiểm: `0 < min ≤ max ≤ ngày`; hai trần tháng độc lập, không so với ngày. */
const validateLimitOrder = (values: BaseValues, ctx: RefinementCtx) => {
  const { minPerTransaction: min, maxPerTransaction: max } = values
  const { dailyMaximum: daily } = values
  if (!isPositive(min)) {
    fail(
      ctx,
      ['minPerTransaction'],
      'Số tiền tối thiểu mỗi giao dịch phải lớn hơn 0.'
    )
  }
  if (!isPositive(max)) {
    fail(
      ctx,
      ['maxPerTransaction'],
      'Số tiền tối đa mỗi giao dịch phải lớn hơn 0.'
    )
  } else if (isPositive(min) && max < min) {
    fail(
      ctx,
      ['maxPerTransaction'],
      'Số tiền tối đa mỗi giao dịch phải lớn hơn hoặc bằng số tiền tối thiểu.'
    )
  }
  if (daily !== null && isPositive(max) && daily < max) {
    fail(
      ctx,
      ['dailyMaximum'],
      'Hạn mức trong ngày phải lớn hơn hoặc bằng số tiền tối đa mỗi giao dịch.'
    )
  }
}

/** Ô tùy chọn: để trống được, có số thì phải > 0 (riêng tháng đặc biệt cho phép 0 để khóa nhóm). */
const POSITIVE_WHEN_FILLED = [
  'dailyMaximum',
  'normalMonthlyMaximum',
  'walletBalanceMaximum',
  'outflowDailyMaximum',
  'outflowMonthlyMaximum',
  'outboundMaxTimesPerDay',
  'approvalThreshold'
] as const satisfies readonly LimitFieldKey[]

const validateOptionalLimits = (values: BaseValues, ctx: RefinementCtx) => {
  POSITIVE_WHEN_FILLED.forEach((key) => {
    if (values[key] !== 0) return
    fail(ctx, [key], `${LIMIT_FIELD_LABELS[key]} phải lớn hơn 0.`)
  })
  const { outflowDailyMaximum: daily, outflowMonthlyMaximum: monthly } = values
  if (daily !== null && monthly !== null && monthly < daily) {
    fail(
      ctx,
      ['outflowMonthlyMaximum'],
      'Tổng tiền chi ra trong tháng không được nhỏ hơn tổng tiền chi ra trong ngày.'
    )
  }
}

const validateRequiredKeys = (
  values: BaseValues,
  requiredKeys: readonly LimitFieldKey[],
  ctx: RefinementCtx
) =>
  requiredKeys.forEach((key) => {
    if (values[key] !== null) return
    fail(
      ctx,
      [key],
      `Không được bỏ trống ${LIMIT_FIELD_LABELS[key]} của cấu hình Hệ thống.`
    )
  })

const validateOverrideMethod = (
  row: OverrideValues,
  index: number,
  ctx: RefinementCtx
) => {
  const path = ['bankOverrides', index]
  const isTransfer = row.transactionType === WalletLimitTransactionType.TRANSFER
  if (!row.bankCode && !row.paymentMethod) {
    fail(
      ctx,
      [...path, isTransfer ? 'paymentMethod' : 'bankCode'],
      MISSING_BANK_OR_METHOD_MESSAGE
    )
    return
  }
  const methodMismatch = isTransfer
    ? row.paymentMethod === WalletLimitPaymentMethod.LINKED_ACCOUNT
    : row.paymentMethod === WalletLimitPaymentMethod.WALLET_BALANCE
  if (isTransfer && row.bankCode) {
    fail(ctx, [...path, 'bankCode'], MISMATCHED_METHOD_MESSAGE)
  } else if (methodMismatch) {
    fail(ctx, [...path, 'paymentMethod'], MISMATCHED_METHOD_MESSAGE)
  }
}

const validateOverride = (
  row: OverrideValues,
  index: number,
  ctx: RefinementCtx
) => {
  const complete =
    row.minPerTransaction !== null &&
    row.maxPerTransaction !== null &&
    row.dailyMaximum !== null
  if (!complete) {
    fail(
      ctx,
      ['bankOverrides', index, 'minPerTransaction'],
      INCOMPLETE_OVERRIDE_MESSAGE
    )
  }
  validateOverrideMethod(row, index, ctx)
}

export interface WalletLimitFormSchemaOptions {
  /**
   * Ô không được để trống khi lưu. Cấu hình Hệ thống đang có giá trị thì runtime
   * cần giá trị đó, nên màn Cập nhật truyền vào các ô đã có số ở bản gốc.
   */
  requiredKeys?: readonly LimitFieldKey[]
}

export const createWalletLimitFormSchema = ({
  requiredKeys = []
}: WalletLimitFormSchemaOptions = {}) =>
  baseSchema.superRefine((values, ctx) => {
    validateTarget(values, ctx)
    validateLimitOrder(values, ctx)
    validateOptionalLimits(values, ctx)
    validateRequiredKeys(values, requiredKeys, ctx)
    values.bankOverrides.forEach((row, index) =>
      validateOverride(row, index, ctx)
    )
  })

/** Schema của màn Thêm mới (không có ô nào bắt buộc theo bản gốc). */
export const walletLimitFormSchema = createWalletLimitFormSchema()

export type WalletLimitFormValues = z.infer<typeof walletLimitFormSchema>
export type WalletLimitOverrideValues =
  WalletLimitFormValues['bankOverrides'][number]
