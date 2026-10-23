import type { z } from 'zod'

export const MIN_FEE_BELOW_FIXED_MESSAGE =
  'Phí tối thiểu phải lớn hơn hoặc bằng phí cố định'
export const MAX_FEE_BELOW_FIXED_MESSAGE =
  'Phí tối đa phải lớn hơn hoặc bằng phí cố định'
export const MAX_FEE_BELOW_MIN_MESSAGE =
  'Phí tối đa phải lớn hơn hoặc bằng phí tối thiểu'

interface FeeBoundValues {
  fixedAmount: number | null
  minFee: number | null
  maxFee: number | null
}

/**
 * Sàn / trần phí để trống hoặc bằng 0 là không đặt (lúc gửi lên đều quy về 0), nên chỉ so khi
 * ô đã có giá trị dương. Phí cố định là phần luôn thu, sàn hay trần thấp hơn nó là cấu hình vô nghĩa.
 */
export const addFeeBoundIssues = (
  values: FeeBoundValues,
  ctx: z.RefinementCtx,
  path: readonly (string | number)[] = []
): void => {
  const fixed = values.fixedAmount ?? 0
  const minFee = values.minFee ?? 0
  const maxFee = values.maxFee ?? 0

  if (fixed > 0 && minFee > 0 && minFee < fixed) {
    ctx.addIssue({
      code: 'custom',
      path: [...path, 'minFee'],
      message: MIN_FEE_BELOW_FIXED_MESSAGE
    })
  }
  if (fixed > 0 && maxFee > 0 && maxFee < fixed) {
    ctx.addIssue({
      code: 'custom',
      path: [...path, 'maxFee'],
      message: MAX_FEE_BELOW_FIXED_MESSAGE
    })
  } else if (maxFee > 0 && minFee > maxFee) {
    ctx.addIssue({
      code: 'custom',
      path: [...path, 'maxFee'],
      message: MAX_FEE_BELOW_MIN_MESSAGE
    })
  }
}
