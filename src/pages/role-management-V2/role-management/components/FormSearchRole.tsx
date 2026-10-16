import { ButtonComponent } from '@components/index'
import { FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import { BroomIcon } from '@components/icons'
import { useForm } from 'react-hook-form'
import { memo } from 'react'

interface SearchRoleFormData {
  keyword: string
}

interface Props {
  /** Nhóm quyền đang lọc (URL/bản sao) để ô chọn hiện lại khi quay về màn. */
  keyword: string
  onSearch: (data: SearchRoleFormData) => void
  onClear: () => void
  roleOptions: Array<{ value: string; label: string }>
  onAdd: () => void
  canAdd: boolean
}

const FormSearchRole = ({
  keyword,
  onSearch,
  onClear,
  roleOptions,
  onAdd,
  canAdd
}: Props) => {
  const { svg } = useSVG()
  const { control, handleSubmit, reset } = useForm<SearchRoleFormData>({
    defaultValues: { keyword }
  })

  const handleSearch = (data: SearchRoleFormData) => {
    onSearch(data)
  }
  const handleClearFilter = () => {
    reset({ keyword: '' })
    onClear()
  }

  return (
    <div className='block w-full gap-3 md:flex'>
      <form
        className='flex-1'
        onSubmit={handleSubmit(handleSearch)}
      >
        <div className='grid md:grid-cols-1 grid-cols-1 gap-3 w-full'>
          <FormSelect
            options={roleOptions}
            label='Tìm kiếm tên nhóm quyền'
            placeholder='Tên nhóm quyền...'
            control={control}
            name='keyword'
            className='col-span-1'
          />
        </div>

        <div className='grid grid-cols-3 mt-3 md:flex justify-end gap-3 items-end md:gap-1'>
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
            htmlType='button'
            content='Xóa lọc'
            onClick={handleClearFilter}
          />
        </div>
      </form>
    </div>
  )
}

export default memo(FormSearchRole)
