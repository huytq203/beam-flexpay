import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import { BroomIcon } from '@components/icons'
import { useForm } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { PermissionStatus } from '../constants/PermissionManagement.constant'
import { memo } from 'react'

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
    <div className='block w-full gap-3 md:flex'>
      <form
        className='flex-1'
        onSubmit={handleSubmit(handleSearch)}
      >
        <div className='grid md:grid-cols-2 grid-cols-1 gap-3 w-full'>
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
            options={mapEnumToSelectOptions(PermissionStatus)}
            className='col-span-1'
          />
        </div>
        <button
          type='submit'
          className='hidden'
        />
      </form>
      <div className='grid grid-cols-3 mt-3 md:flex justify-end gap-3 items-end md:gap-1'>
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
          icon={<BroomIcon size={18}/>}
          type='default'
          content='Xóa lọc'
          onClick={handleClearFilter}
        />
      </div>
    </div>
  )
}

export default memo(FormSearch)
