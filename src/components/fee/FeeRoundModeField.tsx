import { FormSelect } from '@components/form'
import {
  DEFAULT_ROUND_MODE,
  roundModeLabel
} from '@pages/fee-management-v4/fee-management/constants/FeeManagement.constant'
import type { SelectOption } from '@utils/helper-functions/form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

export interface FeeRoundModeFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  options: SelectOption[]
  className?: string
}

/**
 * Công thức làm tròn đã chốt là "làm tròn lên" cho mọi thành phần phí, nên ô
 * chọn không còn là một quyết định — nó chỉ là một câu khẳng định.
 *
 * Nhưng bản ghi cũ có thể đang mang công thức khác: làm tròn thay đổi số tiền
 * người dùng thật sự bị trừ, nên KHÔNG được âm thầm ghi đè về mặc định. Gặp giá
 * trị lệch chuẩn thì trả lại ô chọn đầy đủ kèm cảnh báo, để người vận hành nhìn
 * thấy và tự quyết định sửa hay giữ.
 */
export const FeeRoundModeField = <T extends FieldValues>({
  control,
  name,
  options,
  className
}: FeeRoundModeFieldProps<T>) => {
  const value = useWatch({ control, name })
  const isLegacyMode = Boolean(value) && value !== DEFAULT_ROUND_MODE

  if (isLegacyMode) {
    return (
      <div className={className}>
        <FormSelect
          control={control}
          name={name}
          label={<span>Công thức làm tròn <span className='text-red-500'>*</span></span>}
          options={options}
          placeholder='Chọn công thức làm tròn'
          className='flex flex-col'
        />
        <p className='mt-1 text-xs font-medium text-warning-strong'>
          Bản ghi này đang lệch chuẩn. Mặc định hiện tại là{' '}
          {roundModeLabel[DEFAULT_ROUND_MODE]}.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <p className='font-medium'>Công thức làm tròn</p>
      <p className='mt-2 text-sm font-medium text-foreground'>
        {roundModeLabel[DEFAULT_ROUND_MODE]}
        <span className='ml-1.5 font-normal text-muted-foreground'>
          · mặc định cho mọi thành phần phí
        </span>
      </p>
    </div>
  )
}
