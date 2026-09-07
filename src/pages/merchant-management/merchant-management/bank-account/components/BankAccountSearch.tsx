import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'

import {
  LINK_STATUS_OPTIONS,
  SCOPE_OPTIONS,
  STATUS_OPTIONS
} from '../constants/bank-account.constant'
import {
  bankAccountSearchSchema,
  type BankAccountSearchValues
} from '../schemas/bank-account.schema'

interface BankAccountSearchProps {
  isSubmitting?: boolean
  onSearch: (values: BankAccountSearchValues) => void
}

const FIELD_CLASS = 'flex flex-col gap-1.5'
const LABEL_CLASS = 'text-sm font-medium text-foreground'

export function BankAccountSearch({
  isSubmitting = false,
  onSearch
}: BankAccountSearchProps) {
  const form = useForm<BankAccountSearchValues>({
    resolver: zodResolver(bankAccountSearchSchema),
    defaultValues: {
      keyword: '',
      scope: undefined,
      status: undefined,
      linkStatus: undefined
    }
  })

  const handleSubmit: SubmitHandler<BankAccountSearchValues> = (values) => {
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

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <FormInput
          control={form.control}
          name='keyword'
          label='Từ khóa'
          placeholder='Tìm theo tên chủ TK / số TK / ngân hàng…'
          disabled={isSubmitting}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
        <FormSelect
          control={form.control}
          name='scope'
          label='Cấp áp dụng'
          placeholder='Tất cả'
          options={SCOPE_OPTIONS}
          disabled={isSubmitting}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
        <FormSelect
          control={form.control}
          name='status'
          label='Trạng thái dùng'
          placeholder='Tất cả'
          options={STATUS_OPTIONS}
          disabled={isSubmitting}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
        <FormSelect
          control={form.control}
          name='linkStatus'
          label='Liên kết'
          placeholder='Tất cả'
          options={LINK_STATUS_OPTIONS}
          disabled={isSubmitting}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
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
