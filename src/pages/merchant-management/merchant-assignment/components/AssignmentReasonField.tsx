import { TextArea } from '@components/index'
import { ASSIGNMENT_REASON_MAX } from '../constants/merchantAssignment.constants'

interface Props {
  id: string
  value: string
  onChange: (value: string) => void
}

export function AssignmentReasonField({ id, value, onChange }: Props) {
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
        maxLength={ASSIGNMENT_REASON_MAX}
        showCount
        value={value}
        placeholder='Lý do được ghi vào nhật ký audit'
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
