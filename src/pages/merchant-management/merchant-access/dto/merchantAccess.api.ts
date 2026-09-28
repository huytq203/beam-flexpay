import {
  type MerchantGroupDto,
  type MerchantUserDto
} from '@/app/services/merchantAccessApi'

import type { MerchantRole, MerchantUser } from '../types/merchantAccess.types'

export const toMerchantUser = (item: MerchantUserDto): MerchantUser => ({
  id: item.id,
  name: item.fullName,
  email: item.email,
  phone: item.phone ?? '',
  merchantIds: item.merchantIds ?? [],
  subMerchantIds: item.subMerchantIds ?? [],
  roleIds: item.groupIds ?? [],
  status: item.status,
  lastLogin: null,
  createdAt: item.createdAt ?? ''
})

export const toMerchantRole = (item: MerchantGroupDto): MerchantRole => ({
  id: item.id,
  code: item.code,
  name: item.name,
  description: item.description ?? '',
  merchantId: item.merchantId ?? null,
  permissions: item.permissions ?? [],
  system: item.system ?? false,
  createdBy: '',
  createdAt: item.createdAt ?? ''
})
