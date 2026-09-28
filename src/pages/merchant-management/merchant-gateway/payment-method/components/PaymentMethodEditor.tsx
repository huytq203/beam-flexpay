import { useState } from 'react'
import { useGetGatewayPaymentConfigQuery, useUpdateGatewayPaymentConfigMutation, type PaymentMethod } from '@/app/services/merchantGatewayApi'
import { ButtonComponent, DialogModal, Switch, TextArea, feedback } from '@components/index'
import { methodOptions } from '../columns/paymentMethod.columns'

const METHOD_DESCRIPTIONS: Record<PaymentMethod, string> = {
  QR: 'Thanh toán bằng mã QR', DOMESTIC_CARD: 'Thẻ ATM nội địa',
  INTERNATIONAL_CARD: 'Visa, Mastercard, JCB', LINKED_WALLET: 'Thanh toán qua ví liên kết',
  VIRTUAL_ACCOUNT: 'Nhận tiền qua tài khoản định danh'
}

interface PaymentMethodEditorProps {
  merchantId: string
  merchantName: string
  onClose: () => void
}

export function PaymentMethodEditor({ merchantId, merchantName, onClose }: PaymentMethodEditorProps) {
  const query = useGetGatewayPaymentConfigQuery(merchantId)
  const [update, { isLoading }] = useUpdateGatewayPaymentConfigMutation()
  const [inheritOverride, setInherit] = useState<boolean>()
  const [methodsOverride, setEnabledMethods] = useState<PaymentMethod[]>()
  const [activeOverride, setActive] = useState<boolean>()
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const inherit = inheritOverride ?? query.data?.enabledMethods.inherited ?? false
  const enabledMethods = methodsOverride ?? query.data?.enabledMethods.value ?? []
  const active = activeOverride ?? (query.data?.configured ? query.data.active : true)
  const actionLabel = query.data?.configured ? 'Cập nhật' : 'Thiết lập'

  const toggleMethod = (method: PaymentMethod, checked: boolean) => {
    setEnabledMethods(checked ? [...enabledMethods, method] : enabledMethods.filter((item) => item !== method))
  }

  const save = async () => {
    if (!reason.trim()) { setReasonError('Vui lòng nhập lý do thay đổi'); return }
    setReasonError('')
    if (!inherit && enabledMethods.length === 0) { feedback.warning('Cần bật ít nhất một hình thức thanh toán'); return }
    try {
      await update({ id: merchantId, inherit, enabledMethods: inherit ? undefined : enabledMethods,
        methodLimits: inherit ? undefined : query.data?.methodLimits.value ?? [],
        active: inherit ? undefined : active, reason: reason.trim() }).unwrap()
      feedback.success(`Đã ${query.data?.configured ? 'cập nhật' : 'thiết lập'} hình thức thanh toán`)
      onClose()
    } catch { feedback.error('Không thể cập nhật hình thức thanh toán') }
  }

  return <DialogModal open title={`${actionLabel} hình thức thanh toán · ${merchantName}`}
    width={{ xs: 'calc(100vw - 24px)', md: 600 }} onCancel={onClose} onOk={() => void save()}
    okButtonProps={{ loading: isLoading, disabled: query.isLoading || query.isError }} okText={actionLabel}>
    {query.isLoading && <p role='status' className='py-4 text-sm text-muted-foreground'>Đang tải cấu hình…</p>}
    {query.isError && <div role='alert' className='flex items-center justify-between gap-2 text-sm text-danger-strong'>Không thể tải cấu hình.<ButtonComponent type='default' size='small' content='Thử lại' onClick={() => void query.refetch()} /></div>}
    {query.data && <div className='space-y-4 pt-2'>
      <div className='border-b border-border pb-3'>
        <h3 className='text-sm font-semibold text-foreground'>Phạm vi áp dụng</h3>
        <p className='mt-1 text-sm text-muted-foreground'>{merchantName} · {query.data.level === 'MASTER' ? 'Master' : query.data.level === 'SUB' ? 'Sub-merchant' : query.data.level}</p>
      </div>
      <div className='flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5'>
        <div><p className='text-sm font-medium text-foreground'>Dùng mặc định hệ thống</p><p className='text-xs text-muted-foreground'>Bật để dùng các hình thức thanh toán mặc định.</p></div>
        <Switch aria-label='Dùng mặc định hệ thống' checked={inherit} onChange={setInherit} />
      </div>
      <div>
        <h3 className='mb-2 text-sm font-semibold text-foreground'>Danh mục hình thức thanh toán</h3>
        <div className='divide-y divide-border rounded-lg border border-border'>
          {methodOptions.map(({ value, label }) => <div key={value} className='flex items-center justify-between gap-3 px-3 py-2.5'>
            <div className='min-w-0'><p className='text-sm font-medium text-foreground'>{label}</p><p className='text-xs text-muted-foreground'>{METHOD_DESCRIPTIONS[value]}</p></div>
            <Switch aria-label={label} checked={enabledMethods.includes(value)} disabled={inherit} onChange={(checked) => toggleMethod(value, checked)} />
          </div>)}
        </div>
      </div>
      <div className='flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5'>
        <span className='text-sm font-medium text-foreground'>Cấu hình đang hoạt động</span>
        <Switch aria-label='Cấu hình đang hoạt động' checked={active} onChange={setActive} />
      </div>
      <div>
        <label className='mb-1 block text-sm font-medium text-foreground' htmlFor='payment-reason'>Lý do thay đổi <span className='text-danger-strong'>*</span></label>
        <TextArea id='payment-reason' rows={2} maxLength={500} value={reason}
          aria-invalid={Boolean(reasonError)} aria-describedby={reasonError ? 'payment-reason-error' : undefined}
          onChange={(event) => { setReason(event.target.value); if (reasonError) setReasonError('') }}
          placeholder='Nhập lý do cập nhật' />
        {reasonError && <p id='payment-reason-error' role='alert' className='mt-1 text-xs text-danger-strong'>{reasonError}</p>}
      </div>
    </div>}
  </DialogModal>
}
