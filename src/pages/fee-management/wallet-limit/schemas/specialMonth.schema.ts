import { z } from 'zod'

export const SPECIAL_MONTH_NAME_MAX_LENGTH = 200

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập tên tháng đặc biệt.')
  .max(
    SPECIAL_MONTH_NAME_MAX_LENGTH,
    `Tên tháng đặc biệt tối đa ${SPECIAL_MONTH_NAME_MAX_LENGTH} ký tự.`
  )

export const specialMonthSchema = z.object({
  month: z
    .string()
    .min(1, 'Vui lòng chọn tháng.')
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Tháng không hợp lệ.'),
  name: nameSchema
})

export const renameSpecialMonthSchema = z.object({ name: nameSchema })

export type SpecialMonthFormValues = z.infer<typeof specialMonthSchema>
export type RenameSpecialMonthFormValues = z.infer<
  typeof renameSpecialMonthSchema
>
