import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import { useForm } from 'react-hook-form'
import { BroomIcon } from '@components/icons'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { RoleStatus } from '../constants/RoleManagement.config'
import { memo } from 'react'
import * as Icons from '@components/icons'
export interface SearchFormData {
  roleCode: string
  keyword: string
  status: string
}

interface Props {
  onSearch: (data: SearchFormData) => void
  onAdd: () => void
}

const FormSearch = ({ onSearch, onAdd }: Props) => {
  const { control, handleSubmit, reset } = useForm<SearchFormData>({
    defaultValues: { roleCode: '', keyword: '', status: '' }
  })
  const { svg } = useSVG()

  const handleSearch = (data: SearchFormData) => {
    onSearch?.(data)
  }

  const handleClearFilter = () => {
    reset()
    onSearch?.({ roleCode: '', keyword: '', status: '' })
  }

  return (
    <div className='block w-full gap-3'>
       <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'> <Icons.FunnelIcon /> Bộ lọc tìm kiếm</p>
      <form className='flex-1' onSubmit={handleSubmit(handleSearch)}>
        <div className='grid grid-cols-1 md:grid-cols-1 gap-3 w-full'>
          {/* <FormInput
            label='Mã quyền'
            placeholder='Mã quyền...'
            control={control}
            name='roleCode'
            className='col-span-1'
          /> */}
          <FormInput
            label='Tìm kiếm'
            placeholder='Nhập tìm kiếm...'
            control={control}
            name='keyword'
            className='col-span-1'
          />
          {/* <FormSelect
            label='Trạng thái'
            control={control}
            name='status'
            options={mapEnumToSelectOptions(RoleStatus)}
            className='col-span-1'
          /> */}
        </div>
      </form>
      <div className='md:flex grid grid-cols-3 mt-3 justify-end gap-3 items-end md:gap-1'>
        <div className="flex gap-2">
          <ButtonComponent
            icon={svg('/icons.svg#hugeicons-search-01')}
            content='Tìm kiếm'
            onClick={handleSubmit(handleSearch)}
          />

          <ButtonComponent
            type='default'
            icon={<BroomIcon size={18} />}
            content='Xóa lọc'
            onClick={handleClearFilter}
          />
        </div>

        {/* <ButtonComponent
          icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
          content='Thêm mới'
          onClick={onAdd}
        /> */}
      </div>
    </div>
  )
}

export default memo(FormSearch)
