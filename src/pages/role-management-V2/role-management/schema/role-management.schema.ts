import { z } from "zod"

export const RoleManagementSchema = z.object({
    name: z.string()
        .min(1, "Mã quyền không được để trống")
        .max(50, "Mã quyền không được vượt quá 50 ký tự"),
    description: z.string()
        .max(150, "Mô tả không được vượt quá 150 ký tự")
})

export type RoleManagementFormData = z.infer<typeof RoleManagementSchema>
