import { memo } from 'react'
import { useForm } from 'react-hook-form'
import { BroomIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { FormInput } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import { SearchPermissionFormData } from '../types/PermissionManagement.type'

interface Props {
  /** Từ khoá đang áp dụng (URL/bản sao) để ô nhập hiện lại khi quay về màn. */
  keyword: string
  onSearch: (data: SearchPermissionFormData) => void
  onClear: () => void
  onAdd: () => void
  canAdd: boolean
}

const FormSearchPermission = ({
  keyword,
  onSearch,
  onClear,
  onAdd,
  canAdd
}: Props) => {
  const { svg } = useSVG()
  const { control, handleSubmit, reset } = useForm<SearchPermissionFormData>({
    defaultValues: { keyword }
  })

  const handleClearFilter = () => {
    reset({ keyword: '' })
    onClear()
  }

  return (
    <form
      className='w-full'
      onSubmit={handleSubmit((data) => onSearch(data))}
    >
      <FormInput
        label='Tìm kiếm quyền'
        placeholder='Nhập mã quyền...'
        control={control}
        name='keyword'
      />
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

export default memo(FormSearchPermission)
