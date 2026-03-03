import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import { BroomIcon } from '@components/icons'
import { useForm } from 'react-hook-form'
import { memo } from 'react'

interface Props {
  onSearch?: (data: any) => void
  onAdd?: () => void
  roleOptions?: { value: string; label: string }[]
}

const FormSearch = ({ onSearch, onAdd, roleOptions = [] }: Props) => {
  const { control } = useForm()
  const { svg } = useSVG()

  return (
    <div className='block w-full gap-3 md:flex'>
      <form className='flex-1'>
        <div className='grid md:grid-cols-3 grid-cols-1 gap-3 w-full'>
          <FormInput
            label='Ten dang nhap/ho ten/SDT'
            placeholder='Ten dang nhap/ho ten/SDT...'
            control={control}
            name='username'
            className='col-span-1'
          />
          <FormSelect
            label='Nhom quyen'
            control={control}
            name='group'
            options={roleOptions}
            className='col-span-1'
          />
          <FormSelect
            label='Trang thai'
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
          content='Tim kiem'
        />
        <ButtonComponent
          icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
          content='Them moi'
          onClick={onAdd}
          hidden
        />
        <ButtonComponent
          type='default'
          icon={<BroomIcon size={18} />}
          content='Xoa loc'
        />
      </div>
    </div>
  )
}

export default memo(FormSearch)
