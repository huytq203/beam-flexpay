// ============================================
// EnumSelect - Generic Enum-based Select Component
// ============================================

import React, { useMemo } from 'react'
import { FormSelect } from '@components/form'
import { Control, FieldValues, Path } from 'react-hook-form'
import { enumToSelectOptions } from '../../utils'
import type { SelectOption } from '../../types'

// ============================================
// Types
// ============================================
interface EnumSelectProps<TForm extends FieldValues, TEnum extends Record<string, string>> {
  control: Control<TForm>
  name: Path<TForm>
  enumType: TEnum
  label: string
  placeholder?: string
  className?: string
  disabled?: boolean
  filter?: (key: string, value: string) => boolean
  customOptions?: SelectOption[]
}

// ============================================
// Component
// ============================================
/**
 * EnumSelect - A FormSelect wrapper that auto-generates options from enums
 *
 * @remarks
 * This component eliminates the repeated pattern of converting enums to options.
 * Uses useMemo to cache the options and prevent unnecessary recalculations.
 *
 * @example
 * // Basic usage with enum
 * <EnumSelect
 *   control={control}
 *   name="serviceType"
 *   enumType={serviceType}
 *   label="Loại dịch vụ"
 *   placeholder="Chọn loại dịch vụ"
 * />
 *
 * // With filter (e.g., only show certain options in create mode)
 * <EnumSelect
 *   control={control}
 *   name="status"
 *   enumType={statusType}
 *   label="Trạng thái"
 *   filter={(key) => isCreateMode ? key === 'INIT' : true}
 * />
 *
 * // With custom options (overrides enum)
 * <EnumSelect
 *   control={control}
 *   name="baseOn"
 *   enumType={baseOn}
 *   label="Tính dựa trên"
 *   customOptions={limitedOptions}
 * />
 */
function EnumSelect<TForm extends FieldValues, TEnum extends Record<string, string>>({
  control,
  name,
  enumType,
  label,
  placeholder,
  className = 'col-span-4 flex flex-col',
  disabled = false,
  filter,
  customOptions
}: EnumSelectProps<TForm, TEnum>) {
  // Memoize options to prevent recalculation on every render
  const options = useMemo(() => {
    if (customOptions) {
      return customOptions
    }

    const allOptions = enumToSelectOptions(enumType)

    if (filter) {
      return allOptions.filter(({ value, label }) =>
        filter(value, label)
      )
    }

    return allOptions
  }, [enumType, filter, customOptions])

  return (
    <FormSelect<TForm>
      control={control}
      name={name}
      label={label}
      className={className}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}

export default EnumSelect
