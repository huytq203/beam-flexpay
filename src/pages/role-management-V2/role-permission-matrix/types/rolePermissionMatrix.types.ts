/** 7 vai trò nội bộ, đúng tên hằng `AdminRole` của BE (trùng realm role Keycloak). */
export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'SALES'
  | 'ACCOUNTANT'
  | 'RISK_MANAGER'
  | 'OPS_SUPPORT'

export type AdminAccessType =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'EXPORT'

export type AdminAccessScope = 'ALL' | 'ASSIGNED'

export type AdminSyncState = 'NEVER_SYNCED' | 'IN_SYNC' | 'OUT_OF_SYNC'

export interface AdminRolePermissionCell {
  role: AdminRole
  granted: boolean
  accessType: AdminAccessType | null
  symbol: string
  scope: AdminAccessScope | null
}

export interface AdminFunctionRow {
  /** Tên hằng `AdminFunction`, dùng làm `function` khi PUT. */
  code: string
  displayName: string
  sortOrder: number
  cells: AdminRolePermissionCell[]
}

export interface AdminRolePermissionMatrix {
  roles: AdminRole[]
  functions: AdminFunctionRow[]
}

export interface AdminRoleSyncStatus {
  role: AdminRole
  state: AdminSyncState
  authorities: string[]
  unmappedFunctions: string[]
  lastSyncedAt: string | null
  lastSyncedBy: string | null
  added: string[]
  removed: string[]
  /** Chỉ có ở response của POST sync; tiếng Việt không dấu, hiển thị nguyên văn. */
  note: string | null
}

export interface AdminRoleGrantRequest {
  function: string
  accessType: AdminAccessType
  scope: AdminAccessScope
}

export interface AdminRolePermissionUpdateBody {
  reason: string
  permissions: AdminRoleGrantRequest[]
}

export interface UpdateRolePermissionsArgs {
  role: AdminRole
  body: AdminRolePermissionUpdateBody
}

export interface SyncRoleArgs {
  role: AdminRole
  reason: string
}

/** Ô đang soạn của một vai trò: `accessType` null nghĩa là "Không". */
export interface DraftCell {
  accessType: AdminAccessType | null
  scope: AdminAccessScope
}

export type RoleDraft = Record<string, DraftCell>

export interface MatrixGroup {
  key: string
  label: string
  rows: AdminFunctionRow[]
}

export type MatrixTableRow =
  | { rowType: 'group'; key: string; label: string; count: number }
  | { rowType: 'function'; key: string; index: number; row: AdminFunctionRow }
