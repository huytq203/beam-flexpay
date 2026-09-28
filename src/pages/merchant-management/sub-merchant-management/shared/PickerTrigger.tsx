import type { KeyboardEvent } from 'react'
import { MagnifyingGlassIcon, XCircleIcon } from '@components/icons'
import { Input } from '@components/index'

interface PickerTriggerProps {
  id: string
  label: string
  value?: string
  placeholder: string
  disabled?: boolean
  required?: boolean
  error?: string
  onOpen: () => void
  onClear?: () => void
}

// Ô chỉ đọc mở dialog chọn có phân trang. Giữ dáng Input để đứng cạnh các ô
// lọc/nhập khác mà không lệch, nhưng dữ liệu không bị giới hạn ở trang đầu.
export function PickerTrigger({
  id,
  label,
  value,
  placeholder,
  disabled,
  required,
  error,
  onOpen,
  onClear
}: PickerTriggerProps) {
  const errorId = error ? `${id}-error` : undefined
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen()
  }

  return (
    <div className='flex min-w-0 flex-col gap-1.5'>
      <label
        htmlFor={id}
        className='inline-flex items-center text-sm font-medium text-foreground'
      >
        {label}
        {required && <span className='ml-1 text-red-600'>*</span>}
      </label>
      <Input
        id={id}
        readOnly
        disabled={disabled}
        value={value ?? ''}
        placeholder={placeholder}
        aria-haspopup='dialog'
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={disabled ? undefined : 'cursor-pointer'}
        onClick={() => !disabled && onOpen()}
        onKeyDown={handleKeyDown}
        suffix={
          value && onClear && !disabled ? (
            <button
              type='button'
              aria-label={`Bỏ chọn ${label}`}
              className='flex cursor-pointer items-center text-muted-foreground hover:text-foreground'
              onClick={(event) => {
                event.stopPropagation()
                onClear()
              }}
            >
              <XCircleIcon
                aria-hidden
                size={16}
                weight='fill'
              />
            </button>
          ) : (
            <MagnifyingGlassIcon
              aria-hidden
              size={16}
              className='text-muted-foreground'
            />
          )
        }
      />
      {error && (
        <p
          id={errorId}
          role='alert'
          className='text-sm text-danger-strong'
        >
          {error}
        </p>
      )}
    </div>
  )
}
