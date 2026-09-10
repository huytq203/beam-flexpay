import { z } from 'zod'
import { CreateAdminUserSchema } from './CreateAdminUser.schema'

export const UpdateAdminUserSchema = CreateAdminUserSchema.pick({
  email: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  enabled: true,
  roleIds: true
})

export type UpdateAdminUserFormData = z.infer<typeof UpdateAdminUserSchema>
