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
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
  { value: 'VERIFIED', label: 'Đã xác minh' },
  { value: 'REJECTED', label: 'Từ chối' }
]

interface BusinessWalletSearchProps {
  filters: BusinessWalletSearchValues
  isSubmitting?: boolean
  onSearch: (values: BusinessWalletSearchValues) => void
  onClear: () => void
}

const EMPTY_VALUES: BusinessWalletSearchValues = {
  query: '',
  taxCode: '',
  verificationStatus: undefined
}

export function BusinessWalletSearch({
  filters,
  isSubmitting = false,
  onSearch,
  onClear
}: BusinessWalletSearchProps) {
  // Quay lại màn thì ô lọc hiện lại đúng bộ lọc đang áp dụng.
  const form = useForm<BusinessWalletSearchValues>({
    resolver: zodResolver(businessWalletSearchSchema),
    defaultValues: { ...EMPTY_VALUES, ...filters }
  })

  const handleSubmit: SubmitHandler<BusinessWalletSearchValues> = (values) => {
    onSearch(values)
  }

  const handleReset = (): void => {
    form.reset(EMPTY_VALUES)
    onClear()
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
          name='query'
          label='Tìm kiếm'
          placeholder='Tên hoặc email doanh nghiệp'
          disabled={isSubmitting}
          className='flex flex-col gap-1.5'
          classNameLable='text-sm font-medium text-foreground'
        />
        <FormInput
          control={form.control}
          name='taxCode'
          label='Mã số thuế'
          placeholder='Nhập mã số thuế'
          disabled={isSubmitting}
          className='flex flex-col gap-1.5'
          classNameLable='text-sm font-medium text-foreground'
        />
        <FormSelect
          control={form.control}
          name='verificationStatus'
          label='Trạng thái xác minh'
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
