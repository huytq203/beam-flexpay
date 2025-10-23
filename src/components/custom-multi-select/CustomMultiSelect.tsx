import { TreeSelect } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

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

  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(value)

  useEffect(() => {
    setSelectedValues(value)
  }, [value])

  const isAllSelected = useMemo(
    () => (options.length > 0 && selectedValues.length === options.length) || (selectedValues.length === 1 && selectedValues.includes('all')),
    [options, selectedValues]
  )

  const hasSelections = useMemo(
    () => selectedValues.length > 0,
    [selectedValues]
  )

  const handleChange = useCallback((values: any) => {
    let processedValues = values

    if (values.includes('all')) {
      if (!selectedValues.includes('all')) {
        processedValues = ['all']
      } else {
        processedValues = values.filter((v: string | number) => v !== 'all')
      }
    }

    setSelectedValues(processedValues)
    onChange?.(processedValues)
  }, [onChange, selectedValues])

  const handleSelectAll = useCallback(() => {
    const allValues = options.map(opt => opt.value)
    setSelectedValues(allValues)
    onChange?.(allValues)
  }, [options, onChange])

  const handleClearAll = useCallback(() => {
    setSelectedValues([])
    onChange?.([])
  }, [onChange])

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

  const treeData = useMemo(() => {
    if (!options || options.length === 0) return []

    return [
      renderDropdownHeader(),
      ...options
    ]
  }, [options, isAllSelected, hasSelections])

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
      size={'large'}
    />
  )
}

export default CustomMultiSelect
