import { memo } from 'react'
import { useForm } from 'react-hook-form'
import { BroomIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import {
  EMAIL_VERIFIED_OPTIONS,
  KEYWORD_MAX_LENGTH,
  USER_STATUS_OPTIONS
} from '../constants/userAccount'
import { SearchUserFormData } from '../types/UserManagement.type'

const DEFAULT_FILTERS: SearchUserFormData = {
  keyword: '',
  emailVerified: undefined,
  status: undefined
}

const FIELD_CLASS = 'col-span-1 flex flex-col'

interface FormSearchUserProps {
  onSearch: (data: SearchUserFormData) => void
  onAdd: () => void
  canAdd: boolean
}

const FormSearchUser = ({ onSearch, onAdd, canAdd }: FormSearchUserProps) => {
  const { svg } = useSVG()
  const { control, handleSubmit, reset } = useForm<SearchUserFormData>({
    defaultValues: DEFAULT_FILTERS
  })

  const handleClearFilter = (): void => {
    reset(DEFAULT_FILTERS)
    onSearch(DEFAULT_FILTERS)
  }

  return (
    <form
      className='w-full'
      onSubmit={handleSubmit((data) => onSearch(data))}
    >
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        <FormInput
          control={control}
          name='keyword'
          label='Từ khóa'
          placeholder='Tên đăng nhập, họ tên hoặc email...'
          maxLength={KEYWORD_MAX_LENGTH}
          className={FIELD_CLASS}
        />
        <FormSelect
          control={control}
          name='emailVerified'
          label='Xác thực email'
          placeholder='Tất cả'
          options={[...EMAIL_VERIFIED_OPTIONS]}
          className={FIELD_CLASS}
        />
        <FormSelect
          control={control}
          name='status'
          label='Trạng thái hoạt động'
          placeholder='Tất cả'
          options={[...USER_STATUS_OPTIONS]}
          className={FIELD_CLASS}
        />
      </div>

      <div className='mt-3 flex flex-wrap justify-end gap-2'>
        <ButtonComponent
          icon={svg('/icons.svg#hugeicons-search-01')}
          content='Tìm kiếm'
          htmlType='submit'
        />
        {canAdd && (
          <ButtonComponent
            icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
            content='Thêm mới'
            htmlType='button'
            onClick={onAdd}
          />
        )}
        <ButtonComponent
          icon={<BroomIcon size={18} />}
          type='default'
          content='Xóa lọc'
          htmlType='button'
          onClick={handleClearFilter}
        />
      </div>
    </form>
  )
}

export default memo(FormSearchUser)
