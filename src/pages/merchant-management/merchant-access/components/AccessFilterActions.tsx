import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'

// Cặp nút chuẩn của bộ lọc: reset/submit của form cha xử lý hành vi.
export function AccessFilterActions() {
  return (
    <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
      <ButtonComponent
        className='w-full sm:w-auto'
        type='default'
        htmlType='reset'
        content='Xóa bộ lọc'
        icon={
          <BroomIcon
            aria-hidden
            size={18}
          />
        }
      />
      <ButtonComponent
        className='w-full sm:w-auto'
        htmlType='submit'
        content='Tìm kiếm'
        icon={
          <MagnifyingGlassIcon
            aria-hidden
            size={18}
          />
        }
      />
    </div>
  )
}
