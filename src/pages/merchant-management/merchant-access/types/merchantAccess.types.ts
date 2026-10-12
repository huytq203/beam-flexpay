export interface AccessMerchant {
  id: string
  code: string
  name: string
}

export interface AccessSubMerchant {
  id: string
  merchantId: string
  name: string
}

export interface MerchantPermission {
  code: string
  label: string
  description: string
  group: string
}

export interface MerchantRole {
  id: string
  code?: string
  system?: boolean
  name: string
  description: string
  merchantId: string | null
  permissions: string[]
  createdBy: string
  createdAt: string
}

export type MerchantUserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING'

export interface MerchantUser {
  id: string
  name: string
  email: string
  phone: string
  merchantIds: string[]
  subMerchantIds: string[]
  roleIds: string[]
  status: MerchantUserStatus
  lastLogin: string | null
  createdAt: string
  lockReason?: string
  /** Id đề xuất đổi phạm vi đang chờ duyệt; không có nghĩa là không có đề xuất. */
  pendingScopeProposalId?: string
}

export interface MerchantAccessSnapshot {
  users: readonly MerchantUser[]
  roles: readonly MerchantRole[]
}
