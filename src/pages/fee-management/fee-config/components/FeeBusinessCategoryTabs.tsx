import { FeeDomain } from '@components/fee/feeDomain'
import { cn } from '@lib/utils/cn'
import {
  FEE_BUSINESS_CATEGORY_RULES,
  getFeeBusinessCategories,
  type FeeBusinessCategory
} from '../constants/feeConfigFields'

interface FeeBusinessCategoryTabsProps {
  value: FeeBusinessCategory
  feeDomain: FeeDomain
  disabled?: boolean
  onChange: (next: FeeBusinessCategory) => void
}

/** Phân loại phục vụ thao tác trên FE; giá trị không được gửi xuống backend. */
export const FeeBusinessCategoryTabs = ({
  value,
  feeDomain,
  disabled = false,
  onChange
}: FeeBusinessCategoryTabsProps) => {
  const categories = getFeeBusinessCategories(feeDomain)
  const active = FEE_BUSINESS_CATEGORY_RULES[value]

  return (
    <div className='mb-4 border-b border-border pb-4'>
      <p className='mb-2 text-[13px] font-medium text-foreground'>Nhóm phí</p>
      <div
        role='tablist'
        aria-label='Nhóm phí nghiệp vụ'
        className='flex flex-wrap gap-2'
      >
        {categories.map((category) => {
          const rule = FEE_BUSINESS_CATEGORY_RULES[category]
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
                'rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-60',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-accent'
              )}
            >
              {rule.label}
            </button>
          )
        })}
      </div>
     
    </div>
  )
}
