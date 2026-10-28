import type { FieldErrors, Resolver } from 'react-hook-form'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import { TIER_LAST_MUST_BE_EMPTY_MESSAGE } from '../schemas/feeTierRange'

/** RHF chỉ kiểm riêng bậc phí: một ô khi đang nhập, hoặc cả mảng khi thêm / xoá bậc. */
const isTierScoped = (names: readonly string[] | undefined): boolean =>
  names !== undefined &&
  names.length > 0 &&
  names.every((name) => name === 'tiers' || name.startsWith('tiers.'))

const dropLastTierError = (
  errors: FieldErrors<FeeComponentFormValues>,
  lastIndex: number
): void => {
  const tiers = errors.tiers
  const lastRow = tiers?.[lastIndex]
  if (!tiers || lastRow?.maxValue?.message !== TIER_LAST_MUST_BE_EMPTY_MESSAGE)
    return
  delete lastRow.maxValue
  if (Object.keys(lastRow).length > 0) return
  delete tiers[lastIndex]
  if (Object.keys(tiers).length === 0) delete errors.tiers
}

/**
 * Lỗi "bậc cuối phải để trống giá trị đến" chỉ báo khi kiểm cả form (bấm Thêm / Lưu), không báo khi
 * đang nhập: bậc cuối nào cũng phải có Đến trước khi bấm Thêm bậc phí, và lỗi đã gắn vào một ô không tự
 * xoá khi bậc đó thôi là bậc cuối, nên trước đây hàng nào cũng đỏ. Các lỗi khác vẫn báo ngay khi nhập.
 */
export const deferLastTierCheck =
  <TContext, TOutput>(
    resolver: Resolver<FeeComponentFormValues, TContext, TOutput>
  ): Resolver<FeeComponentFormValues, TContext, TOutput> =>
  async (values, context, options) => {
    const result = await resolver(values, context, options)
    if (isTierScoped(options.names)) {
      dropLastTierError(result.errors, values.tiers.length - 1)
    }
    return result
  }
