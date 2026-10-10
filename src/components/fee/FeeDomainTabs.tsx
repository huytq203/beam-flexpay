import { ChipTab, ChipTabGroup } from '@components/ui/chip-tab-component'
import { FEE_DOMAIN_ENTRIES, type FeeDomain } from './feeDomain'

export interface FeeDomainTabsProps {
  value: FeeDomain
  onChange: (next: FeeDomain) => void
  /** Khoá tab lại khi miền phí không còn đổi được, ví dụ lúc sửa bản ghi cũ. */
  disabled?: boolean
  className?: string
  /** Giới hạn miền được thao tác; bỏ trống để đọc được dữ liệu lịch sử. */
  domains?: readonly FeeDomain[]
}

/**
 * Hàng tab miền phí dùng chung cho màn danh sách và màn cấu hình, để hai màn
 * không trôi ra hai bộ nhãn khác nhau.
 */
export const FeeDomainTabs = ({
  value,
  onChange,
  disabled = false,
  className,
  domains
}: FeeDomainTabsProps) => {
  const entries = domains
    ? FEE_DOMAIN_ENTRIES.filter((entry) => domains.includes(entry.value))
    : FEE_DOMAIN_ENTRIES

  return (
    <div className={className}>
      <ChipTabGroup
        role='tablist'
        aria-label='Miền phí'
      >
        {entries.map(({ value: domain, label, Icon }) => {
          const isActive = domain === value
          return (
            <ChipTab
              key={domain}
              role='tab'
              isActive={isActive}
              disabled={disabled && !isActive}
              onClick={() => onChange(domain)}
              icon={
                <Icon
                  size={16}
                  weight={isActive ? 'fill' : 'bold'}
                  aria-hidden
                />
              }
            >
              {label}
            </ChipTab>
          )
        })}
      </ChipTabGroup>
    </div>
  )
}
