import { ChipTab, ChipTabGroup } from '@components/ui/chip-tab-component'
import {
  FEE_BUSINESS_CATEGORY_RULES,
  getFeeBusinessCategories,
  type FeeBusinessCategory,
  type FeeScope
} from '../constants/feeConfigFields'

interface FeeBusinessCategoryTabsProps {
  value: FeeBusinessCategory
  feeScope: FeeScope
  disabled?: boolean
  onChange: (next: FeeBusinessCategory) => void
}

/**
 * Nhóm phí chỉ có nghĩa khi luồng có nhiều hơn một nhóm (phí đầu ra: phí xử
 * lý hoặc phí nền tảng). Luồng chỉ có một nhóm thì không hiện gì để chọn.
 * Phân loại phục vụ thao tác trên FE; giá trị không được gửi xuống backend.
 */
export const FeeBusinessCategoryTabs = ({
  value,
  feeScope,
  disabled = false,
  onChange
}: FeeBusinessCategoryTabsProps) => {
  const categories = getFeeBusinessCategories(feeScope)
  if (categories.length < 2) return null

  return (
    <ChipTabGroup
      role='tablist'
      aria-label='Nhóm phí nghiệp vụ'
    >
      {categories.map((category) => {
        const isActive = category === value
        return (
          <ChipTab
            key={category}
            role='tab'
            isActive={isActive}
            disabled={disabled}
            onClick={() => onChange(category)}
          >
            {FEE_BUSINESS_CATEGORY_RULES[category].label}
          </ChipTab>
        )
      })}
    </ChipTabGroup>
  )
}
