// ============================================
// Fee Management V3 - Centralized Type Definitions
// ============================================

import { ColumnsType } from 'antd/es/table'

// ============================================
// Enums (Re-exported for convenience)
// ============================================
export {
  baseOn,
  beneficiaryType,
  calculationMethodEnum,
  componentType,
  feeDomain,
  payerType,
  roundMode,
  serviceType
} from '@type/feePoliciesComponent'

export { statusType } from '@type/feePolicies'

// ============================================
// Status Types
// ============================================
export type FeeStatus = 'ACTIVE' | 'INACTIVE' | 'INIT'

export const FeeStatusConfig: Record<FeeStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Hoạt động',
    className: 'bg-green-50 border border-green-800 text-green-800'
  },
  INIT: {
    label: 'Khởi tạo',
    className: 'bg-blue-50 border border-blue-400 text-blue-800'
  },
  INACTIVE: {
    label: 'Không hoạt động',
    className: 'bg-red-50 border border-red-800 text-red-800'
  }
}

// ============================================
// Policy Types
// ============================================
export interface FeePolicy {
  id: string
  name: string
  serviceType: string
  status: FeeStatus
  feeDomain: string
  currency: string
  validFrom: string
  validTo: string | null
  priority: number
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface PolicyFormData {
  name: string
  validFrom: string
  validTo?: string | null
  priority: number
  status: string
  feeDomain: string
  currency: string
  serviceType: string
  description?: string
}

export interface PolicyTableRecord {
  key: string
  no: number
  name: string
  serviceType: string
  status: string
  feeDomain: string
  currency: string
  validFrom: string
  validTo: string | null
}

export interface PolicySearchParams {
  keyword?: string
  serviceType?: string
  feeDomain?: string
  status?: string
  page: number
  size: number
  sortBy: string
  sortDirection: 'ASC' | 'DESC'
}

// ============================================
// Fee Component Types
// ============================================
export interface FeeTier {
  id?: string
  minFee?: number | null
  maxFee?: number | null
  fixedAmount?: number | null
  percentage?: number | null
  maxValue?: number | null
  minValue?: number | null
  roundMode?: string
  feeComponentId?: string
}

export interface FeeComponent {
  id?: string
  feePolicyId?: string
  componentType: string
  baseOn: string
  payerType: string
  beneficiaryType: string
  roundMode: string
  calculationMethod: string
  tiers?: FeeTier[]
  fixedAmount?: number
  percentage?: number
  minFee?: number
  maxFee?: number
  minValue?: number
  maxValue?: number
}

export interface FeeComponentFormData {
  componentType: string
  baseOn: string
  payerType: string
  beneficiaryType: string
  roundMode: string
  calculationMethod: string
  tiers?: FeeTier[]
  fixedAmount?: number
  percentage?: number
  minFee?: number
  maxFee?: number
}

export type CalculationMethod = 'DIRECT' | 'PROGRESSIVE_TIER' | 'FLAT_TIER'

export const isTierBasedMethod = (method: string): boolean => {
  return ['PROGRESSIVE_TIER', 'FLAT_TIER'].includes(method)
}

// ============================================
// Assignment Types
// ============================================
export interface FeeAssignment {
  id?: string
  feePolicyId: string
  merchantId?: string | null
  bankCode?: string
  paymentMethod?: string
  cardType?: string
  serviceType: string
  customerGroup?: string
  status: string
  account?: string
  applyType?: string
  createdAt?: string
  updatedAt?: string
}

export interface AssignmentFormData {
  feePolicyId: string
  merchantId?: string | null
  bankCode: string
  paymentMethod: string
  cardType: string
  serviceType: string
  customerGroup: string
  status: string
  applyType?: string
  account?: string
}

export interface AssignmentSearchParams {
  account?: string
  applyDate?: string
  createDate?: string
  page: number
  size: number
}

// ============================================
// Utility Types
// ============================================
export interface SelectOption<T = string> {
  label: string
  value: T
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view'
}

// ============================================
// Column Generator Types
// ============================================
export interface ColumnGeneratorOptions<T> {
  navigate: (path: string) => void
  onActivate?: (record: T) => void
  onDeactivate?: (record: T) => void
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  onToggleStatus?: (record: T) => void
}

export type TableColumns<T> = ColumnsType<T>

// ============================================
// Form Ref Types (for imperative handles)
// ============================================
export interface FormRef {
  submit: () => Promise<void>
  update: () => Promise<void>
  reset: () => void
}

export interface ComponentFormRef extends FormRef {
  submitAllTiers: (feeComponentId?: string) => Promise<void>
  updateAllTiers: () => Promise<void>
}

// ============================================
// API Response Types
// ============================================
export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface ApiError {
  message?: string
  detail?: string
  status?: number
}
