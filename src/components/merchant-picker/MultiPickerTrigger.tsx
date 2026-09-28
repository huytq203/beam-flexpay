import { CloseOutlined } from '@components/icons'
import ButtonComponent from '../ui/button-component'
import type { PickedEntity } from './picker.types'

interface MultiPickerTriggerProps {
  id: string
  label: string
  entityLabel: string
  selected: readonly PickedEntity[]
  placeholder: string
  disabled?: boolean
  required?: boolean
  error?: string
  onOpen: () => void
  onRemove: (id: string) => void
}

// Chọn nhiều bản ghi qua dialog phân trang; lựa chọn hiện thành thẻ có nút gỡ
// để người dùng rà lại mà không phải mở dialog.
export function MultiPickerTrigger({
  id,
  label,
  entityLabel,
  selected,
  placeholder,
  disabled,
  required,
  error,
  onOpen,
  onRemove
}: MultiPickerTriggerProps) {
  const errorId = error ? `${id}-error` : undefined

  return (
    <div
      role='group'
      aria-labelledby={`${id}-label`}
      aria-describedby={errorId}
      className='flex min-w-0 flex-col gap-1.5'
    >
      <span
        id={`${id}-label`}
        className='inline-flex items-center text-sm font-medium text-foreground'
      >
        {label}
        {required && <span className='ml-1 text-red-600'>*</span>}
      </span>
      <div className='flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2'>
        {selected.length === 0 && (
          <span className='text-sm text-muted-foreground'>{placeholder}</span>
        )}
        {selected.map((item) => (
          <span
            key={item.id}
            className='inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-foreground'
          >
            <span className='truncate'>
              {item.code ? `${item.code} — ${item.name}` : item.name}
            </span>
            {!disabled && (
              <button
                type='button'
                aria-label={`Gỡ ${entityLabel} ${item.name}`}
                className='flex cursor-pointer items-center text-muted-foreground hover:text-foreground'
                onClick={() => onRemove(item.id)}
              >
                <CloseOutlined
                  aria-hidden
                  className='text-xs'
                />
              </button>
            )}
          </span>
        ))}
        <ButtonComponent
          id={id}
          htmlType='button'
          size='small'
          type='default'
          disabled={disabled}
          className='ml-auto'
          content={selected.length ? 'Thay đổi' : `Chọn ${entityLabel}`}
          onClick={onOpen}
        />
      </div>
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
