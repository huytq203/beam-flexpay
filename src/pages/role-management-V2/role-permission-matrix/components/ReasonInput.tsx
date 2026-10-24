import { TextArea } from '@components/index'
import { REASON_MAX_LENGTH } from '../constants/rolePermissionMatrix.constants'

interface Props {
  id: string
  value: string
  error?: string
  onChange: (value: string) => void
}

export function ReasonInput({ id, value, error, onChange }: Props) {
  return (
    <div className='flex flex-col gap-1'>
      <label
        htmlFor={id}
        className='text-sm font-medium text-foreground'
      >
        Lý do <span className='text-danger-strong'>*</span>
      </label>
      <TextArea
        id={id}
        rows={3}
        maxLength={REASON_MAX_LENGTH}
        showCount
        status={error ? 'error' : undefined}
        value={value}
        placeholder='Lý do được ghi vào nhật ký thao tác'
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p
          role='alert'
          className='text-xs text-danger-strong'
        >
          {error}
        </p>
      )}
    </div>
  )
}
