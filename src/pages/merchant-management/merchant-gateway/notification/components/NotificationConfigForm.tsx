import { useState } from 'react'
import { Can } from '@/app/permissions'
import {
  useUpdateGatewayNotificationConfigMutation,
  type NotificationChannel,
  type NotificationConfig
} from '@/app/services/merchantGatewayApi'
import {
  ButtonComponent,
  CheckboxComponent,
  SelectComponent,
  TextArea,
  feedback
} from '@components/index'

const channelOptions: { label: string; value: NotificationChannel }[] = [
  { label: 'Email', value: 'EMAIL' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Push', value: 'PUSH' },
  { label: 'Webhook', value: 'WEBHOOK' }
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const splitEmails = (value: string) =>
  value
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean)

const joinEmails = (emails?: string[] | null) => (emails ?? []).join('\n')

interface EmailFieldProps {
  id: string
  label: string
  value: string
  disabled: boolean
  onChange: (value: string) => void
}

function EmailField({ id, label, value, disabled, onChange }: EmailFieldProps) {
  return (
    <div>
      <label
        className='mb-1 block text-sm font-medium'
        htmlFor={id}
      >
        {label}
      </label>
      <TextArea
        id={id}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder='Mỗi email một dòng'
      />
    </div>
  )
}

interface NotificationConfigFormProps {
  merchantId: string
  config: NotificationConfig
}

// State khởi tạo từ `config` một lần; page đổi `key` khi dữ liệu server đổi
// để form nạp lại, thay vì đồng bộ bằng setState trong effect.
export function NotificationConfigForm({
  merchantId,
  config
}: NotificationConfigFormProps) {
  const [inherit, setInherit] = useState(
    config.transactionNotificationEnabled.inherited ?? false
  )
  const [enabled, setEnabled] = useState(
    config.transactionNotificationEnabled.value ?? false
  )
  const [active, setActive] = useState(config.active)
  const [channels, setChannels] = useState<NotificationChannel[]>(
    config.channels.value ?? []
  )
  const [notificationEmails, setNotificationEmails] = useState(
    joinEmails(config.notificationEmails.value)
  )
  const [reconciliationEmails, setReconciliationEmails] = useState(
    joinEmails(config.reconciliationEmails.value)
  )
  const [invoiceEmails, setInvoiceEmails] = useState(
    joinEmails(config.invoiceEmails.value)
  )
  const [reason, setReason] = useState('')
  const [update, { isLoading: isSaving }] =
    useUpdateGatewayNotificationConfigMutation()

  const save = async () => {
    if (!reason.trim()) {
      feedback.warning('Vui lòng nhập lý do thay đổi')
      return
    }
    const allEmails = [
      notificationEmails,
      reconciliationEmails,
      invoiceEmails
    ].flatMap(splitEmails)
    if (allEmails.some((email) => !EMAIL_PATTERN.test(email))) {
      feedback.warning('Danh sách email có địa chỉ không hợp lệ')
      return
    }
    try {
      await update({
        id: merchantId,
        inherit,
        transactionNotificationEnabled: inherit ? undefined : enabled,
        channels: inherit ? undefined : channels,
        notificationEmails: inherit
          ? undefined
          : splitEmails(notificationEmails),
        reconciliationEmails: inherit
          ? undefined
          : splitEmails(reconciliationEmails),
        invoiceEmails: inherit ? undefined : splitEmails(invoiceEmails),
        active,
        reason: reason.trim()
      }).unwrap()
      feedback.success('Đã cập nhật cấu hình thông báo')
      setReason('')
    } catch {
      feedback.error('Không thể cập nhật cấu hình thông báo')
    }
  }

  return (
    <div className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-3'>
        <CheckboxComponent
          checked={inherit}
          onChange={(event) => setInherit(event.target.checked)}
        >
          Kế thừa cấu hình cấp trên
        </CheckboxComponent>
        <CheckboxComponent
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        >
          Cấu hình đang hoạt động
        </CheckboxComponent>
        <CheckboxComponent
          checked={enabled}
          disabled={inherit}
          onChange={(event) => setEnabled(event.target.checked)}
        >
          Bật thông báo giao dịch
        </CheckboxComponent>
        <div className='col-span-3'>
          <label className='mb-1 block text-sm font-medium'>
            Kênh thông báo
          </label>
          <SelectComponent<NotificationChannel[]>
            mode='multiple'
            className='w-full'
            disabled={inherit}
            value={channels}
            onChange={setChannels}
            options={channelOptions}
            placeholder='Chọn kênh'
          />
        </div>
      </div>
      <div className='grid gap-4 md:grid-cols-3'>
        <EmailField
          id='notification-emails'
          label='Email thông báo'
          disabled={inherit}
          value={notificationEmails}
          onChange={setNotificationEmails}
        />
        <EmailField
          id='reconciliation-emails'
          label='Email đối soát'
          disabled={inherit}
          value={reconciliationEmails}
          onChange={setReconciliationEmails}
        />
        <EmailField
          id='invoice-emails'
          label='Email hóa đơn'
          disabled={inherit}
          value={invoiceEmails}
          onChange={setInvoiceEmails}
        />
      </div>
      <div className=' flex max-w-full flex-col items-end justify-between gap-3 border-t border-border pt-4'>
        <div className='mb-3 w-full flex-1'>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='notification-reason'
          >
            Lý do thay đổi
          </label>
          <TextArea
            id='notification-reason'
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            maxLength={500}
            placeholder='Nhập lý do cập nhật'
          />
        </div>
        <Can
          screen='MERCHANT_NOTIFICATION'
          action='edit'
        >
          <ButtonComponent
            content='Lưu cấu hình'
            loading={isSaving}
            onClick={() => void save()}
          />
        </Can>
      </div>
    </div>
  )
}
