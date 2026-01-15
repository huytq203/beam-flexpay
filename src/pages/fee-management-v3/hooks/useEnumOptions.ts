// ============================================
// useEnumOptions - Memoized enum to select options
// ============================================

import { useMemo } from 'react'
import {
  baseOn,
  beneficiaryType,
  calculationMethodEnum,
  componentType,
  feeDomain,
  payerType,
  roundMode,
  serviceType
} from '@type/feePoliciesComponent'
import { statusType } from '@type/feePolicies'
import { enumToSelectOptions } from '../utils'
import type { SelectOption } from '../types'

interface EnumOptionsResult {
  componentTypeOptions: SelectOption[]
  baseOnOptions: SelectOption[]
  payerTypeOptions: SelectOption[]
  beneficiaryTypeOptions: SelectOption[]
  roundModeOptions: SelectOption[]
  calculationMethodOptions: SelectOption[]
  serviceTypeOptions: SelectOption[]
  feeDomainOptions: SelectOption[]
  statusTypeOptions: SelectOption[]
}

/**
 * Hook that provides memoized select options from enums
 * Prevents re-creating options on every render
 *
 * @example
 * const { componentTypeOptions, statusTypeOptions } = useEnumOptions()
 * <FormSelect options={componentTypeOptions} />
 */
export const useEnumOptions = (): EnumOptionsResult => {
  const componentTypeOptions = useMemo(
    () => enumToSelectOptions(componentType),
    []
  )

  const baseOnOptions = useMemo(
    () => enumToSelectOptions(baseOn),
    []
  )

  const payerTypeOptions = useMemo(
    () => enumToSelectOptions(payerType),
    []
  )

  const beneficiaryTypeOptions = useMemo(
    () => enumToSelectOptions(beneficiaryType),
    []
  )

  const roundModeOptions = useMemo(
    () => enumToSelectOptions(roundMode),
    []
  )

  const calculationMethodOptions = useMemo(
    () => enumToSelectOptions(calculationMethodEnum),
    []
  )

  const serviceTypeOptions = useMemo(
    () => enumToSelectOptions(serviceType),
    []
  )

  const feeDomainOptions = useMemo(
    () => enumToSelectOptions(feeDomain),
    []
  )

  const statusTypeOptions = useMemo(
    () => enumToSelectOptions(statusType),
    []
  )

  return {
    componentTypeOptions,
    baseOnOptions,
    payerTypeOptions,
    beneficiaryTypeOptions,
    roundModeOptions,
    calculationMethodOptions,
    serviceTypeOptions,
    feeDomainOptions,
    statusTypeOptions
  }
}

/**
 * Hook for getting specific status options for create/edit modes
 *
 * @param isCreateMode - Whether in create mode (shows only INIT)
 * @returns Filtered status options
 */
export const useStatusOptions = (isCreateMode: boolean): SelectOption[] => {
  return useMemo(() => {
    const allOptions = enumToSelectOptions(statusType)
    if (isCreateMode) {
      return allOptions.filter((option) => option.value === 'INIT')
    }
    return allOptions
  }, [isCreateMode])
}

/**
 * Hook for getting baseOn options based on update mode
 * In create mode, only shows first option
 *
 * @param isUpdateMode - Whether in update mode
 * @returns Filtered baseOn options
 */
export const useBaseOnOptions = (isUpdateMode: boolean): SelectOption[] => {
  return useMemo(() => {
    const allOptions = enumToSelectOptions(baseOn)
    if (!isUpdateMode) {
      return allOptions.slice(0, 1)
    }
    return allOptions
  }, [isUpdateMode])
}

export default useEnumOptions
