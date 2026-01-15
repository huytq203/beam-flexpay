// ============================================
// AssignmentForm - Fee Assignment Form Fields
// ============================================

import React, { memo, useState, useEffect, useMemo } from 'react'
import { Control, UseFormSetValue } from 'react-hook-form'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { useGetBankQuery } from '@services/apiFeeBank'
import { useEnumOptions } from '../../hooks'
import { enumToSelectOptions } from '../../utils'
import type { AssignmentFormValues } from '../../schemas'

// Import assignment-specific enums
import {
  customerGroupType,
  paymentMethodType,
  cardTypeType,
  statusType
} from '@type/feeAssignment'

// ============================================
// Types
// ============================================
interface AssignmentFormProps {
  control: Control<AssignmentFormValues>
  setValue?: UseFormSetValue<AssignmentFormValues>
  isCompact?: boolean // Compact mode for search form
  disabled?: boolean
}

// ============================================
// Apply Type Options
// ============================================
const APPLY_TYPE_OPTIONS = [
  { label: 'Hệ thống', value: '' },
  { label: 'Đối tượng riêng', value: '1' },
  { label: 'Nhóm khách hàng', value: '2' }
]

// ============================================
// Component
// ============================================
const AssignmentForm: React.FC<AssignmentFormProps> = ({
  control,
  setValue,
  isCompact = false,
  disabled = false
}) => {
  // Local state for conditional field disabling
  const [applyType, setApplyType] = useState('')

  // API data
  const { data: bankData } = useGetBankQuery({})

  // Memoized options
  const { serviceTypeOptions } = useEnumOptions()

  const customerGroupOptions = useMemo(
    () => enumToSelectOptions(customerGroupType),
    []
  )

  const paymentMethodOptions = useMemo(
    () => enumToSelectOptions(paymentMethodType),
    []
  )

  const cardTypeOptions = useMemo(
    () => enumToSelectOptions(cardTypeType),
    []
  )

  const statusOptions = useMemo(
    () => enumToSelectOptions(statusType),
    []
  )

  const bankOptions = useMemo(() => {
    return (bankData?.data?.content || []).map((item: { name: string; code: string }) => ({
      label: item.name,
      value: item.code
    }))
  }, [bankData])

  // Handle apply type changes
  useEffect(() => {
    if (!setValue) return

    if (applyType === '1') {
      setValue('customerGroup', undefined)
    } else if (applyType === '2') {
      setValue('account', '')
    } else {
      setValue('account', '')
      setValue('customerGroup', undefined)
    }
  }, [applyType, setValue])

  const handleApplyTypeChange = (val: string) => {
    setApplyType(val)
  }

  // Computed disabled states
  const isAccountDisabled = applyType === '2' || applyType === '' || disabled
  const isCustomerGroupDisabled = applyType === '1' || applyType === '' || disabled

  // Column span based on compact mode
  const colSpan = isCompact ? 'col-span-6' : 'col-span-3'
  const fullSpan = isCompact ? 'col-span-12' : 'col-span-3'

  return (
    <div className="grid grid-cols-12 gap-3">
      {/* Apply Type - hidden in compact mode */}
      <FormSelect
        control={control}
        name="applyType"
        label="Đối tượng áp dụng"
        className={isCompact ? 'col-span-12 hidden' : 'col-span-3'}
        allowClear={false}
        defaultValue=""
        hidden={isCompact}
        classNameLable={isCompact ? 'hidden' : 'font-medium'}
        options={APPLY_TYPE_OPTIONS}
        onChange={handleApplyTypeChange}
        disabled={disabled}
      />

      {/* Account - hidden in compact mode */}
      <FormInput
        type="text"
        control={control}
        name="account"
        placeholder="Nhập tài khoản..."
        label="Tài khoản"
        className={colSpan}
        disabled={isAccountDisabled}
        hidden={isCompact}
        classNameLable={isCompact ? 'hidden' : 'font-medium'}
      />

      {/* Customer Group - hidden in compact mode */}
      <FormSelect
        control={control}
        name="customerGroup"
        options={customerGroupOptions}
        label="Nhóm khách hàng"
        className={colSpan}
        disabled={isCustomerGroupDisabled}
        hidden={isCompact}
        classNameLable={isCompact ? 'hidden' : 'font-medium'}
      />

      {/* Bank Code */}
      <FormSelect
        control={control}
        name="bankCode"
        options={bankOptions}
        label="Ngân hàng"
        className={colSpan}
        disabled={disabled}
      />

      {/* Service Type */}
      <FormSelect
        control={control}
        name="serviceType"
        options={serviceTypeOptions}
        label="Loại giao dịch"
        className={colSpan}
        disabled={disabled}
      />

      {/* Payment Method */}
      <FormSelect
        control={control}
        name="paymentMethod"
        options={paymentMethodOptions}
        label="Phương thức giao dịch"
        className={colSpan}
        disabled={disabled}
      />

      {/* Card Type */}
      <FormSelect
        control={control}
        name="cardType"
        options={cardTypeOptions}
        label="Loại thẻ"
        className={colSpan}
        disabled={disabled}
      />

      {/* Status */}
      <FormSelect
        control={control}
        name="status"
        options={statusOptions}
        label="Trạng thái"
        className={fullSpan}
        disabled={disabled}
      />

      {/* Hidden date fields */}
      <FormDatePicker
        control={control}
        name="applyDate"
        label="Thời gian áp dụng"
        className="col-span-2 flex flex-col hidden"
        showTime
      />
      <FormDatePicker
        control={control}
        name="createDate"
        label="Thời gian tạo"
        className="col-span-2 flex flex-col hidden"
        showTime
      />
    </div>
  )
}

export default memo(AssignmentForm)
