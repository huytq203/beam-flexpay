import { z } from 'zod'

export const deviceStatusSchema = z.enum([
  'ACTIVE',
  'SUSPENDED',
  'REVOKED',
  'EXPIRED'
])

export const adminDeviceFaceIdSchema = z.object({
  registered: z.boolean(),
  status: z.string().nullish(),
  keyAlgorithm: z.string().nullish(),
  registeredAt: z.string().nullish(),
  lastUsedAt: z.string().nullish(),
  totalSuccessCount: z.number().int().nullish(),
  totalFailureCount: z.number().int().nullish(),
  consecutiveFailures: z.number().int().nullish()
})

export const adminTrustedDeviceSchema = z.object({
  id: z.string().nullish(),
  deviceId: z.string(),
  deviceName: z.string().nullish(),
  deviceModel: z.string().nullish(),
  platform: z.string().nullish(),
  osVersion: z.string().nullish(),
  appVersion: z.string().nullish(),
  status: deviceStatusSchema,
  bindingMethod: z.string().nullish(),
  boundFromIp: z.string().nullish(),
  lastUsedAt: z.string().nullish(),
  expiresAt: z.string().nullish(),
  createdAt: z.string().nullish(),
  expired: z.boolean(),
  faceId: adminDeviceFaceIdSchema
})

export const adminUserDeviceListSchema = z.object({
  userId: z.string(),
  username: z.string(),
  totalDevices: z.number().int().nonnegative(),
  devices: z.array(adminTrustedDeviceSchema)
})

export const adminUserDeviceListEnvelopeSchema = z.object({
  data: adminUserDeviceListSchema
})

export type DeviceStatus = z.infer<typeof deviceStatusSchema>
export type AdminTrustedDevice = z.infer<typeof adminTrustedDeviceSchema>
export type AdminUserDeviceList = z.infer<typeof adminUserDeviceListSchema>