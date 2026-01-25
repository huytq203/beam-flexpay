import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import { useForm } from 'react-hook-form'
import { ModeAction } from '@pages/role-management-V2/role-management/hooks/useRoleManagement'
import { BroomIcon } from '@components/icons'

export interface SearchFormData {
  roleCode: string
  keyword: string
  status: string
}

interface Props {
  setOpenModalAdd: (value: boolean) => void
  setModeAction: (value: ModeAction) => void
  onSearch?: (data: SearchFormData) => void
}

const FormSearch = ({ setOpenModalAdd, setModeAction, onSearch }: Props) => {
  const { control, handleSubmit, reset } = useForm<SearchFormData>({
    defaultValues: {
      roleCode: '',
      keyword: '',
      status: ''
    }
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
    <div className='block w-full gap-3 md:flex'>
      <form
        className='flex-1'
        onSubmit={handleSubmit(handleSearch)}
      >
        <div className='grid grid-cols-3 gap-3 w-full'>
          <FormInput
            label='Mã quyền'
            placeholder='Mã quyền...'
            control={control}
            name='roleCode'
            className='col-span-1'
          />
          <FormInput
            label='Tên quyền'
            placeholder='Tên quyền...'
            control={control}
            name='keyword'
            className='col-span-1'
          />
          <FormSelect
            label='Trạng thái'
            control={control}
            name='status'
            options={[
              { label: 'Tất cả', value: '' },
              { label: 'Hoạt động', value: 'ACTIVE' },
              { label: 'Không hoạt động', value: 'INACTIVE' }
            ]}
            className='col-span-1'
          />
        </div>
        <button
          type='submit'
          className='hidden'
        />
      </form>
      <div className='md:flex grid grid-cols-3   mt-3  justify-end gap-3 items-end md:gap-1'>
        <ButtonComponent
          icon={svg('/icons.svg#hugeicons-search-01')}
          content='Tìm kiếm'
          onClick={handleSubmit(handleSearch)}
        />
        <ButtonComponent
         icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
          content='Thêm mới'
          onClick={() => {
            setOpenModalAdd(true)
            setModeAction('add')
          }}
        />
        <ButtonComponent
          type='default'
          icon={<BroomIcon size={18}/>}
          content='Xóa lọc'
          onClick={handleClearFilter}
        />
      </div>
    </div>
  )
}

export default FormSearch
