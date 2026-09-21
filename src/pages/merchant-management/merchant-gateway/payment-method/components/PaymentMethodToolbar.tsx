import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'

import {
  PAYMENT_METHOD_FILTER_OPTIONS,
  PAYMENT_METHOD_FILTER_STATUS_OPTIONS,
  paymentMethodFilterSchema
} from '../schemas/paymentMethod.schema'
import type { PaymentMethodFilters } from '../types/paymentMethod.type'
import { DEFAULT_PAYMENT_METHOD_FILTERS } from '../hooks/usePaymentMethods'

interface PaymentMethodToolbarProps {
  filters: PaymentMethodFilters
  onSearch: (filters: PaymentMethodFilters) => void
}

const fieldClassName = 'flex flex-col gap-1.5'
const labelClassName = 'text-sm font-medium text-foreground'

export function PaymentMethodToolbar({
  filters,
  onSearch
}: PaymentMethodToolbarProps) {
  const form = useForm<PaymentMethodFilters>({
    resolver: zodResolver(paymentMethodFilterSchema),
    defaultValues: filters
  })
  const handleSubmit: SubmitHandler<PaymentMethodFilters> = onSearch

  const handleReset = (): void => {
    form.reset(DEFAULT_PAYMENT_METHOD_FILTERS)
    onSearch(DEFAULT_PAYMENT_METHOD_FILTERS)
  }

  return (
    <form className='space-y-4' onReset={handleReset} onSubmit={form.handleSubmit(handleSubmit)}>
      <div className='flex items-center gap-2 border-b border-border pb-3'>
        <FunnelIcon aria-hidden className='text-secondary-foreground' size={18} />
        <h2 className='font-display text-base font-semibold text-foreground'>
          Bộ lọc tìm kiếm
        </h2>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
        <FormInput className={fieldClassName} classNameLable={labelClassName} control={form.control} label='Từ khóa' name='query' placeholder='Tên hoặc mã merchant' />
        <FormSelect allowClear={false} className={fieldClassName} classNameLable={labelClassName} control={form.control} label='Hình thức' name='method' options={PAYMENT_METHOD_FILTER_OPTIONS} />
        <FormSelect allowClear={false} className={fieldClassName} classNameLable={labelClassName} control={form.control} label='Trạng thái' name='status' options={PAYMENT_METHOD_FILTER_STATUS_OPTIONS} />
      </div>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent className='w-full sm:w-auto' content='Xóa bộ lọc' htmlType='reset' icon={<BroomIcon aria-hidden size={18} />} type='default' />
        <ButtonComponent className='w-full sm:w-auto' content='Tìm kiếm' htmlType='submit' icon={<MagnifyingGlassIcon aria-hidden size={18} />} />
      </div>
    </form>
  )
}
