import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent, Input, SelectComponent } from '@components/index'
import {
  SCOPE_OPTIONS,
  SOURCE_OPTIONS
} from '../constants/notification.constants'
import type { NotificationFiltersValue } from '../hooks/useNotificationList'

interface NotificationFiltersProps {
  draft: NotificationFiltersValue
  onChange: (value: NotificationFiltersValue) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'

export function NotificationFilters({
  draft,
  onChange,
  onApply,
  onReset
}: NotificationFiltersProps) {
  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      onReset={onReset}
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
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        <div>
          <label
            className={labelClass}
            htmlFor='notification-search'
          >
            Từ khóa
          </label>
          <Input
            id='notification-search'
            allowClear
            maxLength={100}
            placeholder='Tên hoặc mã Merchant'
            value={draft.search}
            onChange={(event) =>
              onChange({ ...draft, search: event.target.value })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='notification-scope'
          >
            Cấp áp dụng
          </label>
          <SelectComponent
            id='notification-scope'
            allowClear
            className='w-full'
            options={SCOPE_OPTIONS}
            placeholder='Tất cả cấp'
            value={draft.scope}
            onChange={(scope: NotificationFiltersValue['scope']) =>
              onChange({ ...draft, scope })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='notification-source'
          >
            Nguồn cấu hình
          </label>
          <SelectComponent
            id='notification-source'
            allowClear
            className='w-full'
            options={SOURCE_OPTIONS}
            placeholder='Tất cả nguồn'
            value={draft.source}
            onChange={(source: NotificationFiltersValue['source']) =>
              onChange({ ...draft, source })
            }
          />
        </div>
      </div>
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
    </form>
  )
}
