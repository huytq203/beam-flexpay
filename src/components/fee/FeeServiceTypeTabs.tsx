import { ChipTab, ChipTabGroup } from '@components/ui/chip-tab-component'

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
      <ChipTabGroup aria-label='Loại giao dịch'>
        <ChipTab
          isActive={activeValue === ALL_VALUE}
          onClick={() => onChange(undefined)}
        >
          Tất cả
        </ChipTab>
        {Object.entries(labels).map(([value, label]) => {
          return (
            <ChipTab
              key={value}
              isActive={activeValue === value}
              onClick={() => onChange(value)}
            >
              <span className='inline-flex items-center gap-1.5'>{label}</span>
            </ChipTab>
          )
        })}
      </ChipTabGroup>
    </div>
  )
}
