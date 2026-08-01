import { memo } from 'react'
import { useForm } from 'react-hook-form'
import { BroomIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import { SearchPermissionFormData } from '../types/PermissionManagement.type'

interface Props {
  onSearch: (data: SearchPermissionFormData) => void
  onAdd: () => void
  permissionOptions: Array<{ value: string; label: string }>
}

const FormSearchPermission = ({
  onSearch,
  onAdd,
  permissionOptions
}: Props) => {
  const { svg } = useSVG()
  const { control, handleSubmit, reset } = useForm<SearchPermissionFormData>({
    defaultValues: { keyword: '' }
  })

  const handleClearFilter = () => {
    reset({ keyword: '' })
    onSearch({ keyword: '' })
  }

  return (
    <form
      className='w-full'
      onSubmit={handleSubmit(onSearch)}
    >
      <FormSelect
        options={permissionOptions}
        label='Tìm kiếm quyền'
        placeholder='Chọn quyền...'
        control={control}
        name='keyword'
      />
      <div className='mt-3 flex flex-wrap justify-end gap-2'>
        <ButtonComponent
          icon={svg('/icons.svg#hugeicons-search-01')}
          content='Tìm kiếm'
          htmlType='submit'
        />
        <ButtonComponent
          icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
          content='Thêm mới'
          htmlType='button'
          onClick={onAdd}
        />
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

export default memo(FormSearchPermission)
