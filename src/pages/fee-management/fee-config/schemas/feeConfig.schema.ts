import { z } from 'zod'
import { isPaymentMethodAllowed } from '../constants/feeConfigFields'

/**
 * Một schema phủ cả ba phần của màn: thông tin chính sách, tiêu chí gán đối
 * tượng và danh sách thành phần phí. Gộp làm một vì màn lưu bằng hai lời gọi
 * tuần tự — lời gọi thứ hai không quay lui được, nên mọi thứ phải hợp lệ TRƯỚC
 * khi lời gọi thứ nhất chạy.
 */

export const CalculationMethod = {
  DIRECT: 'DIRECT',
  FLAT_TIER: 'FLAT_TIER',
  PROGRESSIVE_TIER: 'PROGRESSIVE_TIER',
  FREE: 'FREE'
} as const

export type CalculationMethod =
  (typeof CalculationMethod)[keyof typeof CalculationMethod]

export const usesTiers = (method: string): boolean =>
  method === CalculationMethod.FLAT_TIER ||
  method === CalculationMethod.PROGRESSIVE_TIER

/**
 * Ô tiền và ô phần trăm để trống nghĩa là không thu khoản đó.
 *
 * Không đổ sẵn số 0 vào ô: một con số nằm sẵn trong ô trông như người trước đã
 * cân nhắc và đặt nó, trong khi thật ra chưa ai chạm vào. Để trống thì đúng
 * trạng thái hơn, và lúc gửi lên mới quy về 0.
 */
const money = z
  .number({ message: 'Nhập một số' })
  .int('Số tiền phải là số nguyên đồng')
  .min(0, 'Số tiền không được âm')
  .nullable()

const percentage = z
  .number({ message: 'Nhập một số' })
  .min(0, 'Phần trăm phải từ 0 đến 100')
  .max(100, 'Phần trăm phải từ 0 đến 100')
  .refine(
    (value) => Number.isInteger(value * 1000),
    'Phần trăm chỉ được tối đa 3 số sau dấu phẩy'
  )
  .nullable()

/** Ô trống đọc là 0 ở mọi phép so sánh. */
const numberOrZero = (value: number | null | undefined): number => value ?? 0

/**
 * Bậc phí KHÔNG lưu giá trị bắt đầu.
 *
 * Backend đòi các bậc nối liền nhau tại cùng một giá trị biên, nên giá trị bắt
 * đầu luôn suy được từ giá trị kết thúc của bậc trước. Lưu nó thành một trường
 * riêng chỉ tạo ra cơ hội để hai con số lệch nhau sau khi người dùng sửa lại
 * một bậc phía trên — đúng loại lỗi khoảng cách mà không ai tự nhìn ra.
 */
export const feeTierFormSchema = z.object({
  /** Bỏ trống là bậc cuối, chạy tới vô cùng. */
  maxValue: money,
  fixedAmount: money,
  percentage,
  minFee: money,
  maxFee: money
})

/** Giá trị bắt đầu của một bậc, suy từ bậc đứng trước. */
export const getTierStart = (
  tiers: readonly { maxValue: number | null }[],
  index: number
): number => {
  if (index === 0) return 0
  const previous = tiers[index - 1]
  return previous?.maxValue === null || previous?.maxValue === undefined
    ? 0
    : previous.maxValue + 1
}

export const feeComponentFormSchema = z
  .object({
    /** Khoá cục bộ để danh sách và form con khớp nhau, không gửi lên API. */
    key: z.string(),
    componentType: z.string().min(1, 'Chọn loại phí'),
    baseOn: z.string().min(1, 'Chọn cơ sở tính'),
    baseComponentType: z.string().nullable(),
    calculationMethod: z.string().min(1, 'Chọn công thức tính'),
    payerType: z.string().min(1, 'Chọn người chịu phí'),
    beneficiaryType: z.string().min(1, 'Chọn người hưởng phí'),
    fixedAmount: money,
    percentage,
    minFee: money,
    maxFee: money,
    roundMode: z.string().min(1),
    tiers: z.array(feeTierFormSchema)
  })
  .superRefine((component, ctx) => {
    // Thuế giá trị gia tăng tính trên thành phần phí gốc của nhóm, không tính
    // trực tiếp trên số tiền, và chỉ có phần trăm — không có phí cố định.
    if (component.componentType === 'VAT') {
      if (component.baseOn !== 'FEE_COMPONENT') {
        ctx.addIssue({
          code: 'custom',
          path: ['baseOn'],
          message: 'Thuế giá trị gia tăng phải tính trên một thành phần phí khác'
        })
      }
      if (numberOrZero(component.fixedAmount) !== 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['fixedAmount'],
          message: 'Thuế giá trị gia tăng không có phần phí cố định'
        })
      }
    }

    if (component.baseOn === 'FEE_COMPONENT' && !component.baseComponentType) {
      ctx.addIssue({
        code: 'custom',
        path: ['baseComponentType'],
        message: 'Chọn thành phần phí được dùng làm cơ sở'
      })
    }

    const minFee = numberOrZero(component.minFee)
    const maxFee = numberOrZero(component.maxFee)
    if (maxFee > 0 && minFee > maxFee) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxFee'],
        message: 'Phí tối đa phải lớn hơn hoặc bằng phí tối thiểu'
      })
    }

    if (!usesTiers(component.calculationMethod)) {
      if (component.tiers.length > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['tiers'],
          message: 'Công thức tính trực tiếp không nhận bậc phí'
        })
      }
      // Để trống hết nghĩa là thành phần này miễn phí — một cấu hình hợp lệ,
      // không phải lỗi.
      return
    }

    if (component.tiers.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['tiers'],
        message: 'Công thức bậc thang cần ít nhất một bậc phí'
      })
      return
    }

    component.tiers.forEach((tier, index) => {
      const isLast = index === component.tiers.length - 1
      if (tier.maxValue === null && !isLast) {
        ctx.addIssue({
          code: 'custom',
          path: ['tiers', index, 'maxValue'],
          message: 'Chỉ bậc cuối cùng được để trống giá trị đến'
        })
        return
      }
      if (tier.maxValue === null) return

      // Khoảng bậc bao gồm cả hai đầu; bậc sau bắt đầu tại max trước + 1 nên
      // không thể hở hoặc cùng nhận một giá trị với bậc trước.
      const start = getTierStart(component.tiers, index)
      if (tier.maxValue < start) {
        ctx.addIssue({
          code: 'custom',
          path: ['tiers', index, 'maxValue'],
          message: `Giá trị đến phải từ ${start} trở lên`
        })
      }
    })
  })

export const DUPLICATE_FEE_COMPONENT_MESSAGE =
  'Tổ hợp Loại phí, Người chịu và Người hưởng đã tồn tại'

type FeeComponentIdentity = Pick<
  z.infer<typeof feeComponentFormSchema>,
  'key' | 'componentType' | 'payerType' | 'beneficiaryType'
>

/**
 * Từng trường riêng lẻ có thể lặp lại. Một thành phần chỉ bị xem là trùng khi
 * giống hệt cả Loại phí, Người chịu và Người hưởng. Khi sửa, bỏ qua chính thành
 * phần đang mở để tổ hợp hiện tại của nó vẫn hợp lệ.
 */
export const createFeeComponentFormSchema = (
  existingComponents: readonly FeeComponentIdentity[] = [],
  currentComponentKey?: string
) =>
  feeComponentFormSchema.superRefine((component, ctx) => {
    const isDuplicate = existingComponents.some(
      (existing) =>
        existing.key !== currentComponentKey &&
        existing.componentType === component.componentType &&
        existing.payerType === component.payerType &&
        existing.beneficiaryType === component.beneficiaryType
    )

    if (!isDuplicate) return

    const duplicateFields = [
      'componentType',
      'payerType',
      'beneficiaryType'
    ] as const

    duplicateFields.forEach((path) => {
      ctx.addIssue({
        code: 'custom',
        path: [path],
        message: DUPLICATE_FEE_COMPONENT_MESSAGE
      })
    })
  })

export const feeConfigFormSchema = z
  .object({
    feeDomain: z.enum(['BANK', 'EWALLET', 'MERCHANT']),
    name: z
      .string()
      .trim()
      .min(1, 'Nhập tên chính sách phí')
      .max(255, 'Tên tối đa 255 ký tự'),
    description: z.string().max(2000, 'Mô tả tối đa 2000 ký tự'),
    priority: z.number().int().min(0),
    serviceType: z.string().min(1, 'Chọn loại giao dịch'),
    bankCode: z.string(),
    /** Chuỗi rỗng = áp dụng cho tất cả phương thức và bị bỏ khỏi payload. */
    paymentMethod: z.string(),
    merchantId: z.string(),
    /** Đối tượng áp dụng: tất cả, một nhóm, hay một cá nhân. */
    assignmentScope: z.enum(['ALL', 'SEGMENT', 'SUBJECT']),
    /** Mã chủ ví được gán riêng. Rỗng = áp cho mọi người dùng. */
    subjectId: z.string(),
    /** Mã phân khúc khách hàng. Rỗng = áp cho mọi phân khúc. */
    customerGroup: z.string(),
    validFrom: z.string().min(1, 'Chọn ngày áp dụng từ'),
    validTo: z.string(),
    components: z
      .array(feeComponentFormSchema)
      .min(1, 'Chính sách phải có ít nhất một thành phần phí')
      .max(32, 'Tối đa 32 thành phần phí')
  })
  .superRefine((form, ctx) => {
    if (!isPaymentMethodAllowed(form.serviceType, form.paymentMethod)) {
      ctx.addIssue({
        code: 'custom',
        path: ['paymentMethod'],
        message: 'Phương thức không phù hợp với loại giao dịch đã chọn'
      })
    }

    if (form.assignmentScope === 'SEGMENT' && !form.customerGroup) {
      ctx.addIssue({
        code: 'custom',
        path: ['customerGroup'],
        message: 'Chọn nhóm khách hàng được áp dụng'
      })
    }

    if (form.assignmentScope === 'SUBJECT' && !form.subjectId) {
      ctx.addIssue({
        code: 'custom',
        path: ['subjectId'],
        message: 'Chọn cá nhân được áp dụng'
      })
    }

    if (form.feeDomain === 'BANK' && !form.bankCode) {
      ctx.addIssue({
        code: 'custom',
        path: ['bankCode'],
        message: 'Chính sách phí bank phải chỉ đúng một ngân hàng'
      })
    }

    if (form.validTo && form.validTo <= form.validFrom) {
      ctx.addIssue({
        code: 'custom',
        path: ['validTo'],
        message: 'Áp dụng đến phải sau áp dụng từ'
      })
    }

    // Thành phần tính dựa trên thành phần khác chỉ hợp lệ khi thành phần được
    // tham chiếu đã đứng trước nó — backend kiểm theo đúng thứ tự trong mảng.
    const seen = new Set<string>()
    form.components.forEach((component, index) => {
      if (
        component.baseOn === 'FEE_COMPONENT' &&
        component.baseComponentType &&
        !seen.has(component.baseComponentType)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['components', index, 'baseComponentType'],
          message: 'Thành phần được tham chiếu phải nằm phía trên trong danh sách'
        })
      }
      seen.add(component.componentType)
    })
  })

export type FeeTierFormValues = z.infer<typeof feeTierFormSchema>
export type FeeComponentFormValues = z.infer<typeof feeComponentFormSchema>
export type FeeConfigFormValues = z.infer<typeof feeConfigFormSchema>
