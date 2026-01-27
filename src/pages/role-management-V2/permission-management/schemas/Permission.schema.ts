import { z } from "zod"

export const PermissionRoleSchema = z.object({
    name: z.string()
        .min(1, "Tên nhóm quyền không được để trống")
        .max(50, "Tên nhóm quyền không được vượt quá 50 ký tự"),
    description: z.string()
        .max(150, "Mô tả không được vượt quá 150 ký tự")
})

export type PermissionRoleFormData = z.infer<typeof PermissionRoleSchema>
