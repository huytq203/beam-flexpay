import type { z } from 'zod'

export const TIER_LAST_MUST_BE_EMPTY_MESSAGE =
  'Bậc cuối cùng phải để trống giá trị đến (chạy tới vô cùng)'

/**
 * Khoảng của một bậc: chỉ bậc cuối được để trống Đến, và bậc cuối thì bắt buộc
 * để trống. Các bậc còn lại phải có Đến lớn hơn Từ ít nhất 1 đơn vị, vì bậc sau
 * bắt đầu tại Đến + 1 nên không được hở hoặc trùng với bậc trước.
 */
export const addTierRangeIssues = (
  maxValue: number | null,
  start: number,
  isLast: boolean,
  ctx: z.RefinementCtx,
  path: readonly (string | number)[]
): void => {
  const maxPath = [...path, 'maxValue']
  if (isLast) {
    if (maxValue !== null) {
      ctx.addIssue({
        code: 'custom',
        path: maxPath,
        message: TIER_LAST_MUST_BE_EMPTY_MESSAGE
      })
    }
    return
  }
  if (maxValue === null) {
    ctx.addIssue({
      code: 'custom',
      path: maxPath,
      message: 'Chỉ bậc cuối cùng được để trống giá trị đến'
    })
    return
  }
  if (maxValue < start + 1) {
    ctx.addIssue({
      code: 'custom',
      path: maxPath,
      message: `Giá trị đến phải lớn hơn giá trị từ (${start}) ít nhất 1 đơn vị`
    })
  }
}
