export type PermissionTemplateType = {
  data: GroupType[]
  statusCode: number
  message: string
}

export type GroupType = {
  id: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  name: string
  groups: PermissionGroupType[]
}

export type PermissionGroupType = {
  id: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  name: string
  description: string
  featureId: number
  permissions: PermissionsType[]
}

export type PermissionsType = {
  id: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  permission: string
  description: string
  order: number
  realId: number
}

// New type start here

export interface GroupPermissionSearchParams {
  name?: string
  email?: string
  phoneNumber?: string
  status?: string
  page?: number
  take?: number
  active?: boolean
  id?: string
}

export interface GroupPermissionPayload {
  data: GroupPermissionData[]
  meta: Pagination
  statusCode: number
  message: string
}

export interface GroupPermissionData {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string
  name: string
  status: number
}

export interface Pagination {
  page: number
  take: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface GroupPermissionPayloadType {
  groupName: string
  permissionNames: string[]
  permissionDeleteNames: string[]
}

export interface DetailPermissionPayload {
  createdAt: string
  deletedAt: string
  updatedAt: string
  id: number
  name: string
  permissions: PermissionDataType[]
  status: 1
}

export interface PermissionDataType {
  createdAt: string
  deletedAt: string
  updatedAt: string
  description: string
  id: number
  permission: string
}

export interface FormatPermissionType {
  fullPermission: PermissionDataType[]
  permissions: string[]
  permissionsId: number[]
  name: string
  createdAt: string
  status: 1
  id: number
  updatedAt: string
  deletedAt: string
}

export enum viewMode {
  'create' = 'create',
  'delete' = 'delete',
  'update' = 'update',
  'view' = 'view',
  'permission' = 'permission'
}

export type CheckListType = number[]
