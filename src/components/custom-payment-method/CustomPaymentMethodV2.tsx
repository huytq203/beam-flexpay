import { useLazyGetPublicBanksQuery } from '@services/apiBankService'
import { PublicBankInterface } from '@type/bank'
import { POLICY_MANAGEMENT_TYPE, viewMode } from '@type/policyManagement'
import { TreeSelect } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Define clear types
type SelectItem = {
  value: number
  label: string
}

type CustomPaymentMethodProps = {
  mode?: viewMode
  defaultMethod?: 'search' | 'configure'
  handleSelectMethod: (values: number[] | string, status?: string) => void
  defaultSelected?: number[]
  module?: POLICY_MANAGEMENT_TYPE
  disabled?: boolean
  placeholder?: string
  minWidth?: number
}

// Style constants
const STYLES = {
  dropdownContainer: { maxHeight: '350px', minWidth: 300 },
  disabledText: {
    display: 'inline-block',
    color: '#ccc',
    cursor: 'not-allowed'
  },
  actionText: {
    display: 'inline-block',
    color: '#286FBE',
    cursor: 'pointer'
  }
}

function CustomPaymentMethod({
  mode,
  defaultMethod = 'search',
  handleSelectMethod,
  defaultSelected,
  module,
  disabled = false,
  placeholder,
  minWidth = 190
}: CustomPaymentMethodProps) {
  const { t } = useTranslation()
  const isUpdateMode = mode === viewMode.update
  
  // State
  const [selectedValues, setSelectedValues] = useState<number[] | string>(
    t`policy-management.depositManagement.optionLabels.all-method`.toString()
  )
  const [banks, setBanks] = useState<SelectItem[] | undefined>()
  
  // API hooks
  const [getPublicBanks] = useLazyGetPublicBanksQuery()

  // Module-specific label
  const moduleLabel = useCallback(() => {
    switch (module) {
      case POLICY_MANAGEMENT_TYPE.WITHDRAW:
        return t`policy-management.depositManagement.optionLabels.allBankWithdraw`.toString()
      default:
        return '-'
    }
  }, [module, t])

  // Helper functions
  const getBankIds = useCallback((bankList: SelectItem[]) => {
    return bankList?.map(bank => bank.value) || []
  }, [])

  // Memoized values
  const isAllSelected = useMemo(() => 
    banks && selectedValues.length === banks.length,
    [banks, selectedValues]
  )
  
  const hasSelections = useMemo(() => 
    selectedValues.length > 0,
    [selectedValues]
  )

  // Data fetching
  const fetchBanks = useCallback(async () => {
    try {
      const { data } = await getPublicBanks({})
      
      if (!data || data.length === 0) return
      
      let bankList = data.map((bank: PublicBankInterface) => ({
        value: bank.id,
        label: bank.name
      }))
      
      // Filter for specific modules
      const shouldFilterVPBank = [
        POLICY_MANAGEMENT_TYPE.WITHDRAW, 
        POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY
      ].includes(module as POLICY_MANAGEMENT_TYPE)
      
      if (shouldFilterVPBank) {
        bankList = bankList.filter(bank => bank.value === 48)
      }
      
      setBanks(bankList)
      
      // Set initial values
      const bankIds = getBankIds(bankList)
      setSelectedValues(bankIds)
      handleSelectMethod(bankIds, 'all')
    } catch (error) {
      console.error('Failed to fetch banks:', error)
    }
  }, [getPublicBanks, module, getBankIds, handleSelectMethod])

  // Event handlers
  const handleOpenDropDown = useCallback((open: boolean) => {
    if (open && !banks && defaultMethod === 'search') {
      fetchBanks()
    }
  }, [banks, defaultMethod, fetchBanks])

  const handleChange = useCallback((ids: any) => {
    setSelectedValues(ids)
    
    if (banks && ids?.length === banks?.length) {
      handleSelectMethod(ids, 'all')
    } else {
      handleSelectMethod(ids)
    }
  }, [banks, handleSelectMethod])

  const handleSelectAll = useCallback(() => {
    if (!banks) return
    
    const ids = getBankIds(banks)
    setSelectedValues(ids)
    handleSelectMethod(ids, 'all')
  }, [banks, getBankIds, handleSelectMethod])

  const handleClearAll = useCallback(() => {
    setSelectedValues([])
    handleSelectMethod([])
  }, [handleSelectMethod])

  // Effects
  useEffect(() => {
    if (defaultMethod === 'configure') {
      fetchBanks()
    }
  }, [defaultMethod, fetchBanks])

  useEffect(() => {
    if (!banks) return
    
    if (defaultSelected && mode === viewMode.update) {
      setSelectedValues(defaultSelected)
      handleSelectMethod(defaultSelected)
    } else if (mode === viewMode.create) {
      const bankIds = getBankIds(banks)
      setSelectedValues(bankIds)
      handleSelectMethod(bankIds, 'select-all')
    }
  }, [banks, defaultSelected, mode, getBankIds, handleSelectMethod])

  // Custom dropdown header with "Select All" and "Clear All" options
  const renderDropdownHeader = () => ({
    title: (
      <>
        {isAllSelected ? (
          <span style={STYLES.disabledText}>
            {t`policy-management.depositManagement.optionLabels.all`}
          </span>
        ) : (
          <span 
            onClick={handleSelectAll}
            style={STYLES.actionText}
          >
            {t`policy-management.depositManagement.optionLabels.all`}
          </span>
        )}
        
        &nbsp;&nbsp;&nbsp;
        
        {!hasSelections ? (
          <span style={STYLES.disabledText}>
            {t`policy-management.depositManagement.optionLabels.all`}
          </span>
        ) : (
          <span 
            onClick={handleClearAll}
            style={STYLES.actionText}
          >
            {t`policy-management.depositManagement.optionLabels.remove-all`}
          </span>
        )}
      </>
    ),
    checkable: false,
    value: 'header'
  })

  // Generate tree data with header
  const treeData = useMemo(() => {
    if (!banks) return undefined
    
    return [
      renderDropdownHeader(),
      ...banks
    ]
  }, [banks, isAllSelected, hasSelections])

  // Custom tag placeholder
  const customTagPlaceholder = useCallback((omittedValues: any) => {
    if (selectedValues === moduleLabel() || isAllSelected) {
      return t`policy-management.depositManagement.optionLabels.all-method`.toString()
    }
    
    return `+ ${omittedValues.length} ${t`policy-management.depositManagement.optionLabels.method`}...`
  }, [selectedValues, moduleLabel, isAllSelected, t])

  return (
    <TreeSelect
      suffixIcon
      disabled={isUpdateMode || disabled}
      treeNodeFilterProp='label'
      treeCheckable={true}
      showCheckedStrategy={TreeSelect.SHOW_CHILD}
      onChange={handleChange}
      value={selectedValues}
      maxTagCount={isAllSelected ? 0 : 2}
      placeholder={placeholder || t`policy-management.depositManagement.optionLabels.choose-method`}
      style={{ minWidth }}
      dropdownStyle={STYLES.dropdownContainer}
      maxTagPlaceholder={customTagPlaceholder}
      onDropdownVisibleChange={handleOpenDropDown}
      treeData={treeData}
    />
  )
}

export default CustomPaymentMethod
