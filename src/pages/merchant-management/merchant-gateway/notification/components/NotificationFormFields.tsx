import type { NotificationChannel } from '@/app/services/merchantNotificationApi'
import { SelectComponent, Switch, TextArea } from '@components/index'
import { CHANNEL_OPTIONS } from '../constants/notification.constants'
import {
  EMAIL_FIELDS,
  type NotificationDraft,
  type NotificationDraftErrors
} from '../utils/notification.utils'

interface NotificationFormFieldsProps {
  draft: NotificationDraft
  errors: NotificationDraftErrors
  requireReason: boolean
  onChange: (value: Partial<NotificationDraft>) => void
}

const labelClass = 'text-sm font-medium text-foreground'

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p
      id={id}
      role='alert'
      className='text-sm text-danger-strong'
    >
      {message}
    </p>
  ) : null

interface SwitchRowProps {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const SwitchRow = ({
  id,
  label,
  description,
  checked,
  onChange
}: SwitchRowProps) => (
  <div className='flex items-center gap-4 rounded-lg border border-border px-4 py-3'>
    <div className='min-w-0 flex-1'>
      <label
        htmlFor={id}
        className={`${labelClass} block cursor-pointer`}
      >
        {label}
      </label>
      <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
    </div>
    <Switch
      id={id}
      checked={checked}
      onChange={onChange}
    />
  </div>
)

export function NotificationFormFields({
  draft,
  errors,
  requireReason,
  onChange
}: NotificationFormFieldsProps) {
  return (
    <>
      <SwitchRow
        id='notification-enabled'
        label='Thông báo giao dịch'
        description='Tắt thì không gửi thông báo cho từng giao dịch.'
        checked={draft.transactionNotificationEnabled}
        onChange={(checked) =>
          onChange({ transactionNotificationEnabled: checked })
        }
      />
      <SwitchRow
        id='notification-active'
        label='Đang sử dụng cấu hình'
        description='Ngừng thì phạm vi này quay về cấu hình cấp trên.'
        checked={draft.active}
        onChange={(checked) => onChange({ active: checked })}
      />
      {draft.transactionNotificationEnabled && (
        <div className='flex flex-col gap-1 sm:col-span-2'>
          <label
            className={labelClass}
            htmlFor='notification-channels'
          >
            Kênh thông báo <span className='text-red-600'>*</span>
          </label>
          <SelectComponent<NotificationChannel[]>
            id='notification-channels'
            mode='multiple'
            className='w-full'
            options={CHANNEL_OPTIONS}
            value={draft.channels}
            placeholder='Chọn kênh'
            onChange={(channels) => onChange({ channels })}
          />
          <FieldError
            id='notification-channels-error'
            message={errors.channels}
          />
        </div>
      )}
      {EMAIL_FIELDS.map(({ key, label }) => (
        <div
          key={key}
          className='flex flex-col gap-1'
        >
          <label
            className={labelClass}
            htmlFor={`notification-${key}`}
          >
            {label}
          </label>
          <TextArea
            id={`notification-${key}`}
            rows={3}
            value={draft[key]}
            aria-invalid={Boolean(errors[key])}
            placeholder='Mỗi dòng một email'
            onChange={(event) => onChange({ [key]: event.target.value })}
          />
          <FieldError
            id={`notification-${key}-error`}
            message={errors[key]}
          />
        </div>
      ))}
      <p className='text-xs text-muted-foreground sm:col-span-2'>
        Khi tạo mới, nhóm email để trống sẽ dùng email chính của ví. Khi sửa,
        xóa hết email trong một nhóm nghĩa là không gửi email cho nhóm đó.
      </p>
      <div className='flex flex-col gap-1 sm:col-span-2'>
        <label
          className={labelClass}
          htmlFor='notification-reason'
        >
          Lý do thay đổi
          {requireReason && <span className='ml-1 text-red-600'>*</span>}
        </label>
        <TextArea
          id='notification-reason'
          rows={2}
          maxLength={500}
          value={draft.reason}
          placeholder='Ghi lại lý do để tra soát sau này'
          onChange={(event) => onChange({ reason: event.target.value })}
        />
        <FieldError
          id='notification-reason-error'
          message={errors.reason}
        />
      </div>
    </>
  )
}
