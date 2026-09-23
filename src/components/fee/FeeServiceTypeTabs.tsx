

import { cn } from '@lib/utils/cn'


/**
 * Icon vẽ thật thay cho ký tự mũi tên: `↔` không có trong nhiều font hệ thống
 * và tụt xuống glyph thay thế, làm chip đọc thành dấu chấm.
 */

const ALL_VALUE = '__ALL__'

export interface FeeServiceTypeTabsProps {
  serviceType: string | undefined
  onChange: (serviceType: string | undefined) => void
  /** Bảng nhãn loại dịch vụ của màn đang dùng. */
  labels: Record<string, string>
}

interface ChipProps {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}

const Chip = ({ isActive, onClick, children }: ChipProps) => (
  <button
    type='button'
    aria-pressed={isActive}
    onClick={onClick}
    className={cn(
      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      isActive
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-white text-foreground hover:bg-slate-50'
    )}
  >
    {children}
  </button>
)

/**
 * Bộ lọc loại giao dịch duy nhất. Chiều tiền chỉ còn là thông tin nhận diện
 * bằng icon và nội dung cho trình đọc màn hình, không tham gia lọc dữ liệu.
 */
export const FeeServiceTypeTabs = ({
  serviceType,
  onChange,
  labels
}: FeeServiceTypeTabsProps) => {
  const activeValue = serviceType ?? ALL_VALUE

  return (
    <div>
      <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground'>
        Loại giao dịch
      </p>
      <div className='flex flex-wrap gap-2'>
        <Chip
          isActive={activeValue === ALL_VALUE}
          onClick={() => onChange(undefined)}
        >
          Tất cả
        </Chip>
        {Object.entries(labels).map(([value, label]) => {
          return (
            <Chip
              key={value}
              isActive={activeValue === value}
              onClick={() => onChange(value)}
            >
              <span className='inline-flex items-center gap-1.5'>
                {label}
              </span>
            </Chip>
          )
        })}
      </div>
    </div>
  )
}
