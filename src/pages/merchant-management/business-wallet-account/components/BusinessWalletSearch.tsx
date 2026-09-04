import { zodResolver } from '@hookform/resolvers/zod'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect } from '@components/form'
import { useForm, type SubmitHandler } from 'react-hook-form'

import {
  businessWalletSearchSchema,
  type BusinessWalletSearchValues
} from '../schemas/business-wallet.schema'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
  { value: 'FROZEN', label: 'Đóng băng' },
  { value: 'LOCKED', label: 'Đã khóa' }
]

interface BusinessWalletSearchProps {
  isSubmitting?: boolean
  onSearch: (values: BusinessWalletSearchValues) => void
}

export function BusinessWalletSearch({
  isSubmitting = false,
  onSearch
}: BusinessWalletSearchProps) {
  const form = useForm<BusinessWalletSearchValues>({
    resolver: zodResolver(businessWalletSearchSchema),
    defaultValues: {
      username: '',
      ownerId: '',
      status: undefined
    }
  })

  const handleSubmit: SubmitHandler<BusinessWalletSearchValues> = (values) => {
    onSearch(values)
  }

  const handleReset = (): void => {
    form.reset()
    onSearch({})
  }

  return (
    <form
      className='space-y-4'
      onSubmit={form.handleSubmit(handleSubmit)}
      onReset={handleReset}
    >
      <div className='flex items-center gap-2 border-b border-border pb-3'>
        <FunnelIcon aria-hidden size={18} className='text-secondary-foreground' />
        <h2 className='font-display text-base font-semibold text-foreground'>
          Bộ lọc tìm kiếm
        </h2>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        <FormInput
          control={form.control}
          name='username'
          label='Tên doanh nghiệp'
          placeholder='Nhập tên doanh nghiệp'
          disabled={isSubmitting}
          className='flex flex-col gap-1.5'
          classNameLable='text-sm font-medium text-foreground'
        />
        <FormInput
          control={form.control}
          name='ownerId'
          label='Mã chủ ví'
          placeholder='Nhập mã chủ ví'
          disabled={isSubmitting}
          className='flex flex-col gap-1.5'
          classNameLable='text-sm font-medium text-foreground'
        />
        <FormSelect
          control={form.control}
          name='status'
          label='Trạng thái ví'
          placeholder='Chọn trạng thái'
          options={STATUS_OPTIONS}
          disabled={isSubmitting}
          className='flex flex-col gap-1.5'
          classNameLable='text-sm font-medium text-foreground'
        />
      </div>

      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent
          htmlType='reset'
          type='default'
          content='Xóa bộ lọc'
          icon={<BroomIcon aria-hidden size={18} />}
          disabled={isSubmitting}
          className='w-full sm:w-auto'
        />
        <ButtonComponent
          htmlType='submit'
          content='Tìm kiếm'
          icon={<MagnifyingGlassIcon aria-hidden size={18} />}
          loading={isSubmitting}
          className='w-full sm:w-auto'
        />
      </div>
    </form>
  )
}
