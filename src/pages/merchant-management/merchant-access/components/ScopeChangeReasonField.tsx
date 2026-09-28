import { TextArea } from '@components/index'

interface ScopeChangeReasonFieldProps {
  id: string
  value: string
  error?: string
  onChange: (value: string) => void
}

// Đổi phạm vi dữ liệu của User đi qua maker-checker: người duyệt cần biết lý do.
export function ScopeChangeReasonField({
  id,
  value,
  error,
  onChange
}: ScopeChangeReasonFieldProps) {
  const errorId = error ? `${id}-error` : undefined
  return (
    <div className='flex flex-col gap-1 sm:col-span-2'>
      <label
        className='text-sm font-medium text-foreground'
        htmlFor={id}
      >
        Lý do thay đổi phạm vi <span className='text-red-600'>*</span>
      </label>
      <TextArea
        id={id}
        rows={2}
        maxLength={500}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        placeholder='Nêu lý do để người duyệt đối chiếu'
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p
          id={errorId}
          role='alert'
          className='text-sm text-danger-strong'
        >
          {error}
        </p>
      ) : (
        <p className='text-xs text-muted-foreground'>
          Thay đổi phạm vi sẽ được gửi duyệt, chỉ áp dụng khi một quản trị viên
          khác phê duyệt.
        </p>
      )}
    </div>
  )
}
