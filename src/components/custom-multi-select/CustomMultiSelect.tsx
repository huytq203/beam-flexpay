import { TreeSelect } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Define clear types
export type SelectOption = {
  value: string | number
  label: string
}

type CustomMultiSelectProps = {
  options: SelectOption[]
  value?: (string | number)[]
  onChange?: (values: (string | number)[]) => void
  disabled?: boolean
  placeholder?: string
  minWidth?: number
  className?: string
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

function CustomMultiSelect({
                             options = [],
                             value = [],
                             onChange,
                             disabled = false,
                             placeholder = 'Chọn',
                             minWidth = 190,
                             className
                           }: CustomMultiSelectProps) {
  const { t } = useTranslation()

  // State
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(value)

  // Sync external value changes
  useEffect(() => {
    setSelectedValues(value)
  }, [value])

  // Memoized values
  const isAllSelected = useMemo(
    () => options.length > 0 && selectedValues.length === options.length,
    [options, selectedValues]
  )

  const hasSelections = useMemo(
    () => selectedValues.length > 0,
    [selectedValues]
  )

  // Event handlers
  const handleChange = useCallback((values: any) => {
    setSelectedValues(values)
    onChange?.(values)
  }, [onChange])

  const handleSelectAll = useCallback(() => {
    const allValues = options.map(opt => opt.value)
    setSelectedValues(allValues)
    onChange?.(allValues)
  }, [options, onChange])

  const handleClearAll = useCallback(() => {
    setSelectedValues([])
    onChange?.([])
  }, [onChange])

  // Custom dropdown header with "Select All" and "Clear All" options
  const renderDropdownHeader = () => ({
    title: (
      <>
        {isAllSelected ? (
          <span style={STYLES.disabledText}>
            Chọn tất cả
          </span>
        ) : (
          <span
            onClick={handleSelectAll}
            style={STYLES.actionText}
          >
            Chọn tất cả
          </span>
        )}

        &nbsp;&nbsp;&nbsp;

        {!hasSelections ? (
          <span style={STYLES.disabledText}>
            Bỏ chọn tất cả
          </span>
        ) : (
          <span
            onClick={handleClearAll}
            style={STYLES.actionText}
          >
            Bỏ chọn tất cả
          </span>
        )}
      </>
    ),
    checkable: false,
    value: 'header',
    disabled: true
  })

  // Generate tree data with header
  const treeData = useMemo(() => {
    if (!options || options.length === 0) return []

    return [
      renderDropdownHeader(),
      ...options
    ]
  }, [options, isAllSelected, hasSelections])

  // Custom tag placeholder
  const customTagPlaceholder = useCallback((omittedValues: any) => {
    if (isAllSelected) {
      return 'Tất cả'
    }

    return `+${omittedValues.length} mục...`
  }, [isAllSelected])

  return (
    <TreeSelect
      suffixIcon
      disabled={disabled}
      treeNodeFilterProp="label"
      treeCheckable={true}
      showCheckedStrategy={TreeSelect.SHOW_CHILD}
      onChange={handleChange}
      value={selectedValues}
      maxTagCount={isAllSelected ? 0 : 2}
      placeholder={placeholder}
      style={{ minWidth }}
      className={className}
      dropdownStyle={STYLES.dropdownContainer}
      maxTagPlaceholder={customTagPlaceholder}
      treeData={treeData}
    />
  )
}

export default CustomMultiSelect
