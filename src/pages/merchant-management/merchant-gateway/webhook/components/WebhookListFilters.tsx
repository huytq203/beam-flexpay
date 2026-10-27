import { ButtonComponent, Input, SelectComponent } from '@components/index'
import type { WebhookFilterDraft } from '../hooks/useWebhookList'
import {
  WEBHOOK_ENABLED_OPTIONS,
  WEBHOOK_LEVEL_OPTIONS,
  WEBHOOK_SOURCE_OPTIONS
} from '../constants/webhook.constants'

interface WebhookListFiltersProps {
  draft: WebhookFilterDraft
  onChange: (draft: WebhookFilterDraft) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'

export function WebhookListFilters({
  draft,
  onChange,
  onApply,
  onReset
}: WebhookListFiltersProps) {
  return (
    <form
      className='space-y-3'
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <div>
          <label
            className={labelClass}
            htmlFor='webhook-list-search'
          >
            Từ khóa
          </label>
          <Input
            id='webhook-list-search'
            allowClear
            placeholder='Tên hoặc mã Merchant, Sub-merchant'
            value={draft.search}
            onChange={(event) =>
              onChange({ ...draft, search: event.target.value })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='webhook-list-scope'
          >
            Cấp
          </label>
          <SelectComponent
            id='webhook-list-scope'
            allowClear
            className='w-full'
            options={WEBHOOK_LEVEL_OPTIONS}
            placeholder='Master và Sub-merchant'
            value={draft.scope}
            onChange={(scope: WebhookFilterDraft['scope']) =>
              onChange({ ...draft, scope })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='webhook-list-source'
          >
            Nguồn
          </label>
          <SelectComponent
            id='webhook-list-source'
            allowClear
            className='w-full'
            options={WEBHOOK_SOURCE_OPTIONS}
            placeholder='Tất cả nguồn'
            value={draft.source}
            onChange={(source: WebhookFilterDraft['source']) =>
              onChange({ ...draft, source })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='webhook-list-enabled'
          >
            Trạng thái
          </label>
          <SelectComponent
            id='webhook-list-enabled'
            allowClear
            className='w-full'
            options={WEBHOOK_ENABLED_OPTIONS}
            placeholder='Bật và tắt'
            value={draft.enabled}
            onChange={(enabled: WebhookFilterDraft['enabled']) =>
              onChange({ ...draft, enabled })
            }
          />
        </div>
      </div>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent
          type='default'
          htmlType='button'
          content='Xóa bộ lọc'
          onClick={onReset}
        />
        <ButtonComponent
          htmlType='submit'
          content='Tìm kiếm'
        />
      </div>
    </form>
  )
}
