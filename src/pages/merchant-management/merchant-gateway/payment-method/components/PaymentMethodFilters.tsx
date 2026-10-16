import { useForm } from 'react-hook-form'
import { FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent, CardComponent } from '@components/index'

export interface PaymentMethodFilterValues {
  name: string
  code: string
  level: string
  status: string
}

const emptyFilters: PaymentMethodFilterValues = {
  name: '',
  code: '',
  level: '',
  status: ''
}
const fieldClass = 'min-w-0 flex flex-col gap-1.5'
const labelClass = 'text-sm font-medium text-foreground'

interface PaymentMethodFiltersProps {
  /** Bộ lọc đang áp, để hiện lại khi quay lại màn. */
  initialValues: PaymentMethodFilterValues
  onSearch: (filters: PaymentMethodFilterValues) => void
  onClear: () => void
}

export function PaymentMethodFilters({
  initialValues,
  onSearch,
  onClear
}: PaymentMethodFiltersProps) {
  const { control, handleSubmit, reset } = useForm<PaymentMethodFilterValues>({
    defaultValues: initialValues
  })

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <form
        className='space-y-4'
        onSubmit={handleSubmit(onSearch)}
      >
        <div className='flex items-center gap-2 border-b border-border pb-3'>
          <FunnelIcon
            aria-hidden
            size={18}
            className='text-secondary-foreground'
          />
          <h2 className='font-display text-base font-semibold text-foreground'>
            Bộ lọc tìm kiếm
          </h2>
        </div>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <FormInput
            control={control}
            name='name'
            label='Tên Merchant'
            placeholder='Nhập tên Merchant'
            className={fieldClass}
            classNameLable={labelClass}
          />
          <FormInput
            control={control}
            name='code'
            label='Mã Merchant'
            placeholder='Nhập mã Merchant'
            className={fieldClass}
            classNameLable={labelClass}
          />
          <FormSelect
            control={control}
            name='level'
            label='Cấp áp dụng'
            placeholder='Tất cả cấp'
            allowClear
            options={[
              { value: 'MASTER', label: 'Master' },
              { value: 'SUB', label: 'Sub-merchant' }
            ]}
            className={fieldClass}
            classNameLable={labelClass}
          />
          <FormSelect
            control={control}
            name='status'
            label='Trạng thái'
            placeholder='Tất cả trạng thái'
            allowClear
            options={[
              { value: 'ACTIVE', label: 'Đang dùng' },
              { value: 'INACTIVE', label: 'Ngừng' }
            ]}
            className={fieldClass}
            classNameLable={labelClass}
          />
        </div>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-xs text-muted-foreground'>
            Bộ lọc áp dụng cho trang danh sách hiện tại.
          </p>
          <div className='flex flex-col-reverse gap-2 sm:flex-row'>
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Xóa lọc'
              icon={
                <BroomIcon
                  aria-hidden
                  size={18}
                />
              }
              className='w-full sm:w-auto'
              onClick={() => {
                reset(emptyFilters)
                onClear()
              }}
            />
            <ButtonComponent
              htmlType='submit'
              content='Tìm kiếm'
              icon={
                <MagnifyingGlassIcon
                  aria-hidden
                  size={18}
                />
              }
              className='w-full sm:w-auto'
            />
          </div>
        </div>
      </form>
    </CardComponent>
  )
}
