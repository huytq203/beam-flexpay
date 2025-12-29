import { ButtonComponent } from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import { useForm } from 'react-hook-form'

export interface SearchFormData {
  keyword: string
  status: string
}

interface Props {
  setOpenModalAdd: (value: boolean) => void
  onSearch: (data: SearchFormData) => void
}

const FormSearch = ({ setOpenModalAdd, onSearch }: Props) => {
  const { svg } = useSVG()

  const { control, handleSubmit, reset } = useForm<SearchFormData>({
    defaultValues: {
      keyword: ''
    }
  })

  const handleSearch = (data: SearchFormData) => {
    onSearch?.(data)
  }

  const handleClearFilter = () => {
    reset()
    onSearch?.({ keyword: '', status: '' })
  }

  return (
    <div className='flex w-full gap-3'>
      <form
        className='flex-1'
        onSubmit={handleSubmit(handleSearch)}
      >
        <div className='grid grid-cols-2 gap-3 w-full'>
          <FormInput
            label='Tên nhóm quyền'
            placeholder='Tên nhóm quyền...'
            control={control}
            name='keyword'
            className='col-span-1'
          />
          <FormSelect
            label='Trạng thái'
            control={control}
            name='status'
            options={[]}
            className='col-span-1'
          />
        </div>
      </form>
      <div className='flex items-end gap-1'>
        <ButtonComponent
          icon={svg('/icons.svg#hugeicons-search-01')}
          content='Tìm kiếm'
          onClick={handleSubmit(handleSearch)}
        />
        <ButtonComponent
          icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
          content='Thêm mới'
          onClick={() => setOpenModalAdd(true)}
          />
        <ButtonComponent
          icon={svg('/icons.svg#hugeicons-delete-02')}
          type='default'
          content='Xóa lọc'
          onClick={handleClearFilter}
        />
      </div>
    </div>
  )
}

export default FormSearch
