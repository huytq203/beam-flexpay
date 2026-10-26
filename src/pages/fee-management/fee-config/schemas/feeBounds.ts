import type { z } from 'zod'

export const FIXED_FEE_BELOW_MIN_MESSAGE =
  'Phí cố định phải lớn hơn hoặc bằng phí tối thiểu'
export const FIXED_FEE_ABOVE_MAX_MESSAGE =
  'Phí cố định phải nhỏ hơn hoặc bằng phí tối đa'
export const MAX_FEE_BELOW_FIXED_MESSAGE = 'Phí tối đa phải lớn hơn phí cố định'
export const MAX_FEE_BELOW_MIN_MESSAGE = 'Phí tối đa phải lớn hơn phí tối thiểu'
export const MAX_FEE_BELOW_BOTH_MESSAGE =
  'Phí tối đa phải lớn hơn phí cố định và phí tối thiểu'

interface FeeBoundValues {
  fixedAmount: number | null
  minFee: number | null
  maxFee: number | null
}

/**
 * Sàn / trần phí để trống hoặc bằng 0 là không đặt (lúc gửi lên đều quy về 0), nên chỉ so khi
 * ô đã có giá trị dương. Thứ tự hợp lệ: phí tối thiểu ≤ phí cố định ≤ phí tối đa.
 */
export const addFeeBoundIssues = (
  values: FeeBoundValues,
  ctx: z.RefinementCtx,
  path: readonly (string | number)[] = []
): void => {
  const fixed = values.fixedAmount ?? 0
  const minFee = values.minFee ?? 0
  const maxFee = values.maxFee ?? 0

  const maxBelowFixed = fixed > 0 && maxFee > 0 && maxFee < fixed
  const maxBelowMin = maxFee > 0 && minFee > 0 && maxFee < minFee

  if (maxBelowFixed || maxBelowMin) {
    ctx.addIssue({
      code: 'custom',
      path: [...path, 'maxFee'],
      message:
        maxBelowFixed && maxBelowMin
          ? MAX_FEE_BELOW_BOTH_MESSAGE
          : maxBelowFixed
            ? MAX_FEE_BELOW_FIXED_MESSAGE
            : MAX_FEE_BELOW_MIN_MESSAGE
    })
  }
  if (maxBelowFixed) {
    ctx.addIssue({
      code: 'custom',
      path: [...path, 'fixedAmount'],
      message: FIXED_FEE_ABOVE_MAX_MESSAGE
    })
  } else if (fixed > 0 && minFee > 0 && fixed < minFee) {
    ctx.addIssue({
      code: 'custom',
      path: [...path, 'fixedAmount'],
      message: FIXED_FEE_BELOW_MIN_MESSAGE
    })
  }
}
