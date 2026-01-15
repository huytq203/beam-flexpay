// ============================================
// Fee Management V3 - Utility Functions
// ============================================

import type { SelectOption } from '../types'

// ============================================
// Enum Utilities
// ============================================

/**
 * Converts an enum key to its display label
 * @param value - The enum key
 * @param enumType - The enum object
 * @returns The display label or the original value if not found
 */
export const getEnumLabel = <T extends Record<string, string>>(
  value: string | undefined | null,
  enumType: T
): string => {
  if (!value) return ''
  const key = value.trim() as keyof T
  return enumType[key] ?? value
}

/**
 * Converts an enum object to select options array
 * Memoizable - use with useMemo for performance
 * @param enumType - The enum object
 * @returns Array of SelectOption
 */
export const enumToSelectOptions = <T extends Record<string, string>>(
  enumType: T
): SelectOption[] => {
  return Object.entries(enumType).map(([key, value]) => ({
    label: value,
    value: key
  }))
}

/**
 * Creates select options with optional filter
 * @param enumType - The enum object
 * @param filter - Optional filter function
 * @returns Filtered array of SelectOption
 */
export const createSelectOptions = <T extends Record<string, string>>(
  enumType: T,
  filter?: (key: string, value: string) => boolean
): SelectOption[] => {
  return Object.entries(enumType)
    .filter(([key, value]) => (filter ? filter(key, value) : true))
    .map(([key, value]) => ({
      label: value,
      value: key
    }))
}

// ============================================
// Date Utilities
// ============================================

/**
 * Formats a date string to Vietnamese locale
 * @param date - ISO date string
 * @returns Formatted date string (dd/mm/yyyy)
 */
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString('vi-VN')
  } catch {
    return ''
  }
}

/**
 * Formats a date with time
 * @param date - ISO date string
 * @returns Formatted datetime string
 */
export const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleString('vi-VN')
  } catch {
    return ''
  }
}

/**
 * Converts a date string to ISO format
 * @param dateString - Date string with space separator
 * @returns ISO formatted string
 */
export const convertToISO = (dateString: string): string => {
  if (!dateString) return ''
  try {
    return new Date(dateString.replace(' ', 'T')).toISOString()
  } catch {
    return dateString
  }
}

/**
 * Checks if a date is valid
 * @param date - Date string to validate
 * @returns boolean
 */
export const isValidDate = (date: string | null | undefined): boolean => {
  if (!date) return false
  const parsed = Date.parse(date)
  return !isNaN(parsed)
}

/**
 * Displays date or "Vô thời hạn" for null/empty dates
 * @param date - Date string
 * @returns Formatted date or "Vô thời hạn"
 */
export const formatDateOrIndefinite = (date: string | null | undefined): string => {
  if (!date) return 'Vô thời hạn'
  return formatDate(date)
}

// ============================================
// Data Transform Utilities
// ============================================

/**
 * Transforms API policy data to table record format
 * @param items - Array of policy items from API
 * @param page - Current page number
 * @param pageSize - Items per page
 * @returns Array of table records
 */
export const transformPolicyToTableData = <T extends { id?: string }>(
  items: T[],
  page: number,
  pageSize: number
): Array<T & { key: string; no: number }> => {
  return items
    .filter((item) => item.id !== undefined)
    .map((item, index) => ({
      ...item,
      key: item.id!,
      no: (page - 1) * pageSize + index + 1
    }))
}

/**
 * Transforms fee component form data to API payload
 * @param data - Form data
 * @param feePolicyId - Parent policy ID
 * @returns API payload
 */
export const transformComponentToPayload = (
  data: {
    componentType: string
    baseOn: string
    calculationMethod: string
    fixedAmount?: number
    percentage?: number
    roundMode: string
    minFee?: number
    maxFee?: number
    payerType: string
    beneficiaryType: string
  },
  feePolicyId?: string
) => ({
  feePolicyId,
  componentType: data.componentType,
  baseOn: data.baseOn,
  baseComponentType: null,
  calculationMethod: data.calculationMethod,
  fixedAmount: data.fixedAmount ?? 0,
  percentage: data.percentage ?? 0,
  roundMode: data.roundMode,
  minFee: data.minFee ?? 0,
  maxFee: data.maxFee ?? 0,
  payerType: data.payerType,
  payerObjectType: null,
  payerObjectId: null,
  beneficiaryType: data.beneficiaryType,
  beneficiaryObjectType: null,
  beneficiaryObjectId: null
})

/**
 * Transforms tier form data to API payload
 * @param tiers - Array of tier form data
 * @param feeComponentId - Parent component ID
 * @param roundMode - Round mode value
 * @returns Array of tier payloads
 */
export const transformTiersToPayload = (
  tiers: Array<{
    minValue?: number | null
    maxValue?: number | null
    minFee?: number | null
    maxFee?: number | null
    fixedAmount?: number | null
    percentage?: number | null
  }>,
  feeComponentId: string,
  roundMode: string
) => {
  return tiers.map((tier) => ({
    feeComponentId,
    minValue: tier.minValue ?? 0,
    maxValue: tier.maxValue ?? 0,
    roundMode,
    minFee: tier.minFee ?? 0,
    maxFee: tier.maxFee ?? 0,
    fixedAmount: tier.fixedAmount ?? 0,
    percentage: tier.percentage ?? 0
  }))
}

// ============================================
// Validation Utilities
// ============================================

/**
 * Checks if a string value is empty or whitespace
 * @param value - String to check
 * @returns boolean
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0
}

/**
 * Validates feePolicyId is not empty
 * @param feePolicyId - Policy ID to validate
 * @returns boolean
 */
export const isValidPolicyId = (feePolicyId: string | null | undefined): boolean => {
  return !isEmpty(feePolicyId)
}

// ============================================
// Number Utilities
// ============================================

/**
 * Formats a number with Vietnamese locale
 * @param value - Number to format
 * @returns Formatted string
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return '0'
  return value.toLocaleString('vi-VN')
}

/**
 * Formats a percentage value
 * @param value - Percentage value
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value == null) return '0%'
  return `${value}%`
}

// ============================================
// Constants
// ============================================

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export const DEFAULT_SORT = {
  sortBy: 'createdAt',
  sortDirection: 'DESC' as const
}
