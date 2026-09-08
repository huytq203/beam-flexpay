import { FeeDirectionFilter } from '@components/fee/FeeDirectionFilter'
import {
  ArrowDownIcon,
  ArrowsLeftRightIcon,
  ArrowUpIcon
} from '@components/icons'
import { cn } from '@lib/utils/cn'
import {
  FEE_DIRECTION_LABEL,
  FeeDirection,
  filterServiceTypeLabels,
  getFeeDirection,
  getServiceTypesByDirection
} from '@utils/fee-direction'
import type { ComponentType } from 'react'

/**
 * Icon vẽ thật thay cho ký tự mũi tên: `↔` không có trong nhiều font hệ thống
 * và tụt xuống glyph thay thế, làm chip đọc thành dấu chấm.
 */
const DIRECTION_ICON: Readonly<
  Record<FeeDirection, ComponentType<{ size?: number; weight?: 'bold' }>>
> = {
  [FeeDirection.IN]: ArrowDownIcon,
  [FeeDirection.OUT]: ArrowUpIcon,
  [FeeDirection.INTERNAL]: ArrowsLeftRightIcon
}

const ALL_VALUE = '__ALL__'

export interface FeeScopeSelection {
  direction: FeeDirection | null
  serviceType: string | undefined
}

export interface FeeServiceTypeTabsProps extends FeeScopeSelection {
  /**
   * Phát ra CẢ HAI giá trị trong một lần. `useSearchParams` dựng tham số mới từ
   * bản chụp tại thời điểm render, nên hai lần gọi trong cùng một handler sẽ
   * ghi đè nhau và mất một nửa thay đổi — bắt buộc ghi URL một lần duy nhất.
   */
  onChange: (next: FeeScopeSelection) => void
  /** Bảng nhãn loại dịch vụ của màn đang dùng. */
  labels: Record<string, string>
  /**
   * True khi API lọc được nhiều loại dịch vụ cùng lúc. Lúc đó chọn một chiều là
   * đủ để lọc và hàng chip thứ hai chỉ để thu hẹp thêm.
   */
  supportsMultiServiceType?: boolean
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
 * Chiều tiền nhóm, loại dịch vụ lọc.
 *
 * Tách hai tầng vì `/fee/policies/search` chỉ nhận một `ServiceType`: chọn
 * chiều mà không chốt một loại cụ thể thì backend không lọc được. Thay vì để
 * người dùng bấm tab rồi thấy bảng đứng yên, chọn chiều sẽ chốt luôn loại đầu
 * tiên của chiều đó và bày các loại còn lại ngay bên dưới.
 */
export const FeeServiceTypeTabs = ({
  direction,
  serviceType,
  onChange,
  labels,
  supportsMultiServiceType = false
}: FeeServiceTypeTabsProps) => {
  const visibleLabels = filterServiceTypeLabels(labels, direction)
  const entries = Object.entries(visibleLabels)

  const resolveServiceType = (next: FeeDirection | null): string | undefined => {
    if (!next || supportsMultiServiceType) return undefined
    // Giữ lựa chọn cũ nếu nó vẫn thuộc chiều mới, ngược lại chốt loại đầu tiên
    // để bảng đổi ngay khi bấm.
    if (serviceType && getFeeDirection(serviceType) === next) return serviceType
    return getServiceTypesByDirection(next)[0]
  }

  const handleDirectionChange = (next: FeeDirection | null) => {
    onChange({ direction: next, serviceType: resolveServiceType(next) })
  }

  const handleServiceTypeChange = (next: string | undefined) => {
    onChange({ direction, serviceType: next })
  }

  const canSelectAllInDirection = !direction || supportsMultiServiceType
  const activeValue = serviceType ?? ALL_VALUE

  return (
    <div className='space-y-3'>
      <div>
        <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground'>
          Chiều tiền
        </p>
        <FeeDirectionFilter value={direction} onChange={handleDirectionChange} />
      </div>

      <div>
        <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground'>
          Loại dịch vụ
        </p>
        <div className='flex flex-wrap gap-2'>
          {canSelectAllInDirection && (
            <Chip
              isActive={activeValue === ALL_VALUE}
              onClick={() => handleServiceTypeChange(undefined)}
            >
              {direction ? 'Tất cả trong chiều này' : 'Tất cả'}
            </Chip>
          )}
          {entries.map(([value, label]) => {
            const rowDirection = getFeeDirection(value)
            const Icon = rowDirection ? DIRECTION_ICON[rowDirection] : null
            return (
              <Chip
                key={value}
                isActive={activeValue === value}
                onClick={() => handleServiceTypeChange(value)}
              >
                <span className='inline-flex items-center gap-1.5'>
                  {/* Chỉ gắn mũi tên khi đang xem mọi chiều — lúc đó nó mang thông tin. */}
                  {Icon && !direction && (
                    <Icon size={12} weight='bold' aria-hidden />
                  )}
                  {label}
                  {rowDirection && !direction && (
                    <span className='sr-only'>
                      {` — ${FEE_DIRECTION_LABEL[rowDirection]}`}
                    </span>
                  )}
                </span>
              </Chip>
            )
          })}
        </div>
      </div>
    </div>
  )
}
