import type { ScopedPaymentMethodConfig } from '@/app/services/merchantPaymentMethodApi'
import { ButtonComponent, Switch, TextArea } from '@components/index'
import type { PaymentMethodEditorState } from '../hooks/usePaymentMethodEditor'
import { ORIGIN_LABELS } from '../utils/paymentMethodSource'
import { PaymentMethodToggleList } from './PaymentMethodToggleList'

interface PaymentMethodConfigBodyProps {
  editor: PaymentMethodEditorState
  config: ScopedPaymentMethodConfig
}

const rowClass =
  'flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5'

const sourceText = (editor: PaymentMethodEditorState) => {
  const { isSub, origin, useSystemDefault } = editor
  if (!isSub) {
    return useSystemDefault
      ? { label: ORIGIN_LABELS.MASTER.SYSTEM_DEFAULT }
      : {}
  }
  if (!origin) return {}
  return {
    label: ORIGIN_LABELS.SUB[origin],
    hint:
      origin === 'OWN'
        ? undefined
        : 'Đang hiển thị giá trị kế thừa. Thay đổi rồi lưu sẽ tạo cấu hình ghi đè riêng cho Sub-merchant.'
  }
}

export function PaymentMethodConfigBody({
  editor,
  config
}: PaymentMethodConfigBodyProps) {
  const source = sourceText(editor)
  const overridden = editor.isSub && editor.origin === 'OWN'

  return (
    <div className='space-y-4'>
      {config.enabledMethods.suspended && (
        <p
          role='status'
          className='rounded-lg border border-warning-strong/30 bg-warning-strong/5 px-3 py-2 text-xs text-warning-strong'
        >
          Cấu hình đang bị Ngừng ở cấp{' '}
          {config.enabledMethods.source === 'SUB' ? 'Sub-merchant' : 'Master'};
          không hình thức nào được áp dụng cho đến khi kích hoạt lại.
        </p>
      )}
      {!editor.isSub && (
        <div className={rowClass}>
          <div>
            <p className='text-sm font-medium text-foreground'>
              Dùng mặc định hệ thống
            </p>
            <p className='text-xs text-muted-foreground'>
              Bật để dùng các hình thức thanh toán mặc định.
            </p>
          </div>
          <Switch
            aria-label='Dùng mặc định hệ thống'
            checked={editor.useSystemDefault}
            onChange={editor.setUseSystemDefault}
          />
        </div>
      )}
      <PaymentMethodToggleList
        sourceLabel={source.label}
        sourceHint={source.hint}
        checkedMethods={editor.displayedMethods}
        capabilities={editor.capabilities}
        locked={editor.useSystemDefault}
        onToggle={editor.toggleMethod}
      />
      <div className={rowClass}>
        <span className='text-sm font-medium text-foreground'>
          Cấu hình đang hoạt động
        </span>
        <Switch
          aria-label='Cấu hình đang hoạt động'
          checked={editor.active}
          disabled={editor.useSystemDefault}
          onChange={editor.setActive}
        />
      </div>
      <div>
        <label
          className='mb-1 block text-sm font-medium text-foreground'
          htmlFor='payment-reason'
        >
          Lý do thay đổi <span className='text-danger-strong'>*</span>
        </label>
        <TextArea
          id='payment-reason'
          rows={2}
          maxLength={500}
          value={editor.reason}
          aria-invalid={Boolean(editor.reasonError)}
          aria-describedby={
            editor.reasonError ? 'payment-reason-error' : undefined
          }
          onChange={(event) => editor.setReason(event.target.value)}
          placeholder='Nhập lý do cập nhật'
        />
        {editor.reasonError && (
          <p
            id='payment-reason-error'
            role='alert'
            className='mt-1 text-xs text-danger-strong'
          >
            {editor.reasonError}
          </p>
        )}
      </div>
      {overridden && (
        <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5'>
          <p className='text-xs text-muted-foreground'>
            Xoá cấu hình riêng, Sub-merchant dùng lại cấu hình của Master. Cần
            nhập lý do ở trên.
          </p>
          <ButtonComponent
            type='default'
            size='small'
            content='Quay về kế thừa Master'
            loading={editor.saving}
            onClick={() => void editor.returnToMaster()}
          />
        </div>
      )}
    </div>
  )
}
