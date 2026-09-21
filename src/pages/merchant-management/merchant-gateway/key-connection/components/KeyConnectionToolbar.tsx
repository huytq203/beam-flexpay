import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'

import {
  KEY_CONNECTION_FILTER_SCOPE_OPTIONS,
  KEY_CONNECTION_FILTER_STATUS_OPTIONS,
  keyConnectionFilterSchema
} from '../schemas/keyConnection.schema'
import type { KeyConnectionFilters } from '../types/keyConnection.type'

interface KeyConnectionToolbarProps {
  filters: KeyConnectionFilters
  onSearch: (filters: KeyConnectionFilters) => void
}

const FIELD_CLASS = 'flex flex-col gap-1.5'
const LABEL_CLASS = 'text-sm font-medium text-foreground'

export function KeyConnectionToolbar({
  filters,
  onSearch
}: KeyConnectionToolbarProps) {
  const form = useForm<KeyConnectionFilters>({
    resolver: zodResolver(keyConnectionFilterSchema),
    defaultValues: filters
  })
  const handleSubmit: SubmitHandler<KeyConnectionFilters> = onSearch

  const handleReset = (): void => {
    const emptyFilters: KeyConnectionFilters = {
      query: '',
      scope: 'ALL',
      status: 'ALL'
    }
    form.reset(emptyFilters)
    onSearch(emptyFilters)
  }

  return (
    <form
      className='space-y-4'
      onReset={handleReset}
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className='flex items-center gap-2 border-b border-border pb-3'>
        <FunnelIcon aria-hidden className='text-secondary-foreground' size={18} />
        <h2 className='font-display text-base font-semibold text-foreground'>
          Bộ lọc tìm kiếm
        </h2>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
        <FormInput className={FIELD_CLASS} classNameLable={LABEL_CLASS} control={form.control} label='Từ khóa' name='query' placeholder='Tên, mã merchant hoặc Client ID' />
        <FormSelect className={FIELD_CLASS} classNameLable={LABEL_CLASS} control={form.control} label='Cấp áp dụng' name='scope' options={KEY_CONNECTION_FILTER_SCOPE_OPTIONS} />
        <FormSelect className={FIELD_CLASS} classNameLable={LABEL_CLASS} control={form.control} label='Trạng thái' name='status' options={KEY_CONNECTION_FILTER_STATUS_OPTIONS} />
      </div>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent className='w-full sm:w-auto' content='Xóa bộ lọc' htmlType='reset' icon={<BroomIcon aria-hidden size={18} />} type='default' />
        <ButtonComponent className='w-full sm:w-auto' content='Tìm kiếm' htmlType='submit' icon={<MagnifyingGlassIcon aria-hidden size={18} />} />
      </div>
    </form>
  )
}
