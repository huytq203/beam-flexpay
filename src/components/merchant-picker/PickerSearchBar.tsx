import { MagnifyingGlassIcon } from '@components/icons'
import Input from '../ui/Input-component'

interface PickerSearchBarProps {
  entityLabel: string
  name: string
  code: string
  onNameChange: (value: string) => void
  onCodeChange: (value: string) => void
  /** API chỉ có một ô tìm chung thì ẩn ô mã, dùng ô tên làm từ khóa. */
  keywordOnly?: boolean
}

const searchIcon = (
  <MagnifyingGlassIcon
    aria-hidden
    size={16}
  />
)

export function PickerSearchBar({
  entityLabel,
  name,
  code,
  onNameChange,
  onCodeChange,
  keywordOnly
}: PickerSearchBarProps) {
  const nameLabel = keywordOnly
    ? `Tìm ${entityLabel}`
    : `Tìm theo tên ${entityLabel}`
  return (
    <div className='mb-3 grid gap-2 sm:grid-cols-2'>
      <Input
        aria-label={nameLabel}
        allowClear
        prefix={searchIcon}
        placeholder={nameLabel}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
      />
      {!keywordOnly && (
        <Input
          aria-label={`Tìm theo mã ${entityLabel}`}
          allowClear
          prefix={searchIcon}
          placeholder={`Tìm theo mã ${entityLabel}`}
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
        />
      )}
    </div>
  )
}
