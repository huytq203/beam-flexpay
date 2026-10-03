import { cn } from '@lib/utils/cn'
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
    <div
      role='tablist'
      aria-label='Nhóm phí nghiệp vụ'
      className='mb-3 flex flex-wrap gap-2'
    >
      {categories.map((category) => {
        const isActive = category === value
        return (
          <button
            key={category}
            type='button'
            role='tab'
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(category)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-60',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-accent'
            )}
          >
            {FEE_BUSINESS_CATEGORY_RULES[category].label}
          </button>
        )
      })}
    </div>
  )
}
