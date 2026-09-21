import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'

import { NOTIFICATION_CHANNEL_OPTIONS, NOTIFICATION_EVENT_OPTIONS, NOTIFICATION_STATUS_OPTIONS, notificationFilterSchema } from '../schemas/notification.schema'
import type { NotificationFilters } from '../types/notification.type'

interface Props { filters: NotificationFilters; onSearch: (filters: NotificationFilters) => void }
const fieldClass = 'flex flex-col gap-1.5'
const filterOptions = <T extends string>(items: Array<{ label: string; value: T }>) => [{ label: 'Tất cả', value: 'ALL' }, ...items]

export function NotificationToolbar({ filters, onSearch }: Props) {
  const form = useForm<NotificationFilters>({ resolver: zodResolver(notificationFilterSchema), defaultValues: filters })
  const reset = () => { form.reset({ query: '', event: 'ALL', channel: 'ALL', status: 'ALL' }); onSearch({ query: '', event: 'ALL', channel: 'ALL', status: 'ALL' }) }
  const submit: SubmitHandler<NotificationFilters> = onSearch

  return <form className='space-y-4' onReset={reset} onSubmit={form.handleSubmit(submit)}>
    <div className='flex items-center gap-2 border-b border-border pb-3'>
      <FunnelIcon aria-hidden className='text-secondary-foreground' size={18} />
      <h2 className='font-display text-base font-semibold text-foreground'>Bộ lọc tìm kiếm</h2>
    </div>
    <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
      <FormInput className={fieldClass} control={form.control} label='Từ khóa' name='query' placeholder='Tên hoặc mã merchant' />
      <FormSelect allowClear={false} className={fieldClass} control={form.control} label='Sự kiện' name='event' options={filterOptions(NOTIFICATION_EVENT_OPTIONS)} />
      <FormSelect allowClear={false} className={fieldClass} control={form.control} label='Kênh' name='channel' options={filterOptions(NOTIFICATION_CHANNEL_OPTIONS)} />
      <FormSelect allowClear={false} className={fieldClass} control={form.control} label='Trạng thái' name='status' options={filterOptions(NOTIFICATION_STATUS_OPTIONS)} />
    </div>
    <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
      <ButtonComponent className='w-full sm:w-auto' content='Xóa bộ lọc' htmlType='reset' icon={<BroomIcon aria-hidden size={18} />} type='default' />
      <ButtonComponent className='w-full sm:w-auto' content='Tìm kiếm' htmlType='submit' icon={<MagnifyingGlassIcon aria-hidden size={18} />} />
    </div>
  </form>
}
