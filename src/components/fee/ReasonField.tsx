import { useId } from 'react'
import { TextArea } from '@components/index'
import { cn } from '@/lib/utils/cn'
import { FEE_REASON_MAX_LENGTH } from '@type/feeApproval.type'

export interface ReasonFieldProps {
  value: string
  onChange: (value: string) => void
  label: string
  hint?: string
  placeholder?: string
  minRows?: number
  maxRows?: number
  /** Trần ký tự theo ràng buộc của endpoint đang gọi. */
  maxLength?: number
  disabled?: boolean
  error?: string
  className?: string
}

/**
 * Ô nhập lý do dùng chung cho mọi hành động fee cần `reason`.
 *
 * Khung tự giãn theo nội dung (`autoSize`) và chặn kéo tay (`resize-none`) — đây
 * là hai thứ giữ cho ô không tràn ra ngoài popover/modal chứa nó. Bộ đếm ký tự
 * nằm trong luồng thay vì dùng `showCount` của antd (được đặt tuyệt đối ở
 * `bottom: -22px`, đè lên hàng nút bên dưới).
 */
export const ReasonField = ({
  value,
  onChange,
  label,
  hint,
  placeholder,
  minRows = 2,
  maxRows = 6,
  maxLength = FEE_REASON_MAX_LENGTH,
  disabled,
  error,
  className
}: ReasonFieldProps) => {
  const fieldId = useId()
  const countId = `${fieldId}-count`
  const errorId = `${fieldId}-error`

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <label
        htmlFor={fieldId}
        className='flex min-w-0 flex-wrap items-baseline gap-x-2 text-[13px] leading-5 font-medium text-foreground'
      >
        <span className='min-w-0 break-words'>
          {label}
          <span aria-hidden className='ml-0.5 text-danger-strong'>
            *
          </span>
        </span>
        {hint && (
          <span className='min-w-0 text-xs leading-4 font-normal break-words text-muted-foreground'>
            {hint}
          </span>
        )}
      </label>
      <TextArea
        id={fieldId}
        className='resize-none'
        autoSize={{ minRows, maxRows }}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        status={error ? 'error' : undefined}
        aria-describedby={error ? `${errorId} ${countId}` : countId}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className='flex min-w-0 items-start justify-between gap-2'>
        <p
          id={errorId}
          role='alert'
          className='m-0 min-w-0 flex-1 text-xs leading-4 break-words text-danger-strong'
        >
          {error}
        </p>
        <span
          id={countId}
          className='shrink-0 text-xs leading-4 tabular-nums text-muted-foreground'
        >
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}
