// ============================================
// PolicyForm - Fee Policy Form Component
// ============================================
// Presentational component for policy form fields
// Following Single Responsibility Principle
// ============================================

import React, { memo } from 'react'
import { Control } from 'react-hook-form'
import { FormInput, FormSelect, FormDatePicker, FormInputNumber } from '@components/form'
import { useEnumOptions } from '../../hooks'
import type { PolicyFormValues } from '../../schemas'
import type { SelectOption } from '../../types'

// ============================================
// Types
// ============================================
interface PolicyFormProps {
  control: Control<PolicyFormValues>
  statusOptions?: SelectOption[]
  isCreateMode?: boolean
  disabled?: boolean
}

// ============================================
// Component
// ============================================
/**
 * PolicyForm - Reusable policy form fields
 *
 * @remarks
 * This component only handles rendering form fields.
 * Form state management is handled by the parent component.
 * Uses React.memo since form re-renders are controlled by react-hook-form.
 *
 * @example
 * // Create mode (only INIT status available)
 * <PolicyForm
 *   control={control}
 *   statusOptions={createModeOptions}
 *   isCreateMode
 * />
 *
 * // Edit mode (all statuses available)
 * <PolicyForm
 *   control={control}
 *   statusOptions={allStatusOptions}
 * />
 */
const PolicyForm: React.FC<PolicyFormProps> = ({
  control,
  statusOptions,
  isCreateMode = false,
  disabled = false
}) => {
  // Get memoized enum options
  const {
    serviceTypeOptions,
    feeDomainOptions,
    statusTypeOptions
  } = useEnumOptions()

  // Use provided status options or default based on mode
  const effectiveStatusOptions = statusOptions || statusTypeOptions

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Policy Name */}
      <FormInput<PolicyFormValues>
        control={control}
        name="name"
        label="Tên chính sách"
        placeholder="Nhập tên chính sách"
        className="col-span-8"
        disabled={disabled}
      />

      {/* Priority */}
      <FormInputNumber<PolicyFormValues>
        control={control}
        name="priority"
        label="Mức độ ưu tiên"
        placeholder="0"
        className="col-span-4"
        disabled={disabled}
      />

      {/* Valid From */}
      <FormDatePicker<PolicyFormValues>
        control={control}
        name="validFrom"
        label="Hiệu lực từ"
        placeholder="Chọn ngày bắt đầu"
        className="col-span-4"
        disabled={disabled}
      />

      {/* Valid To */}
      <FormDatePicker<PolicyFormValues>
        control={control}
        name="validTo"
        label="Hiệu lực đến"
        placeholder="Chọn ngày kết thúc (không bắt buộc)"
        className="col-span-4"
        disabled={disabled}
      />

      {/* Status */}
      <FormSelect<PolicyFormValues>
        control={control}
        name="status"
        label="Trạng thái"
        placeholder="Chọn trạng thái"
        options={effectiveStatusOptions}
        className="col-span-4"
        disabled={disabled}
      />

      {/* Service Type */}
      <FormSelect<PolicyFormValues>
        control={control}
        name="serviceType"
        label="Loại dịch vụ"
        placeholder="Chọn loại dịch vụ"
        options={serviceTypeOptions}
        className="col-span-4"
        disabled={disabled}
      />

      {/* Currency */}
      <FormInput<PolicyFormValues>
        control={control}
        name="currency"
        label="Loại tiền"
        placeholder="VND"
        className="col-span-4"
        disabled={disabled}
      />

      {/* Fee Domain */}
      <FormSelect<PolicyFormValues>
        control={control}
        name="feeDomain"
        label="Phí miền"
        placeholder="Chọn phí miền"
        options={feeDomainOptions}
        className="col-span-4"
        disabled={disabled}
      />

      {/* Description */}
      <FormInput<PolicyFormValues>
        control={control}
        name="description"
        label="Mô tả"
        placeholder="Nhập mô tả (tối đa 255 ký tự)"
        className="col-span-12"
        disabled={disabled}
      />
    </div>
  )
}

// ============================================
// Memoized Export
// ============================================
export default memo(PolicyForm)
