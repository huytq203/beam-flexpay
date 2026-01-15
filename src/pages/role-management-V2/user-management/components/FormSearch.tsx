import { ButtonComponent } from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import { BroomIcon } from '@components/icons/common'
import { useForm } from 'react-hook-form'
import { ActionMode } from '../UserManagement'

interface Props {
  setOpenModalAdd: (value: boolean) => void
  setModeAction: (value: ActionMode) => void
  roleOptions?: { value: string; label: string }[]
}

const FormSearch = ({
  setOpenModalAdd,
  setModeAction,
  roleOptions = []
}: Props) => {
  const { control } = useForm()
  const { svg } = useSVG()
  return (
    <div className='block w-full gap-3 md:flex'>
      <form className='flex-1'>
        <div className='grid md:grid-cols-3 grid-cols-1 gap-3 w-full'>
          <FormInput
            label='Tên đăng nhập/họ tên/SĐT'
            placeholder='Tên đăng nhập/họ tên/SĐT...'
            control={control}
            name='username'
            className='col-span-1'
          />
          <FormSelect
            label='Nhóm quyền'
            control={control}
            name='group'
            options={roleOptions}
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
      <div className='grid grid-cols-3 mt-3 md:flex justify-end gap-3 items-end md:gap-1'>
        <ButtonComponent
          icon={svg('/icons.svg#hugeicons-search-01')}
          content='Tìm kiếm'
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
        />
      </div>
    </div>
  )
}

export default FormSearch
