import { useState } from 'react'
import { DialogModal, InputNumber } from '@components/index'
import type { ModeAction } from '@components/ui/dialogModal-component/dialogModal.config'
import { useOrderAction } from '../hooks/useOrderAction'
import type {
  MerchantOrder,
  OrderActionKind
} from '../types/merchantOrder.types'
import { formatOrderMoney, isWholeMoney } from '../utils/merchantOrder.utils'
import { OrderCreditWarning } from './OrderCreditWarning'
import { OrderQrResultDialog } from './OrderQrResultDialog'

interface Props {
  kind: OrderActionKind
  order: MerchantOrder
  onClose: () => void
}

const TEXT: Record<
  OrderActionKind,
  { title: string; ok: string; mode: ModeAction; body: string }
> = {
  confirm: {
    title: 'Xác nhận thanh toán thủ công',
    ok: 'Xác nhận đã nhận tiền',
    mode: 'WARNING',
    body: 'Thao tác ghi có tiền thật cho merchant mà không kèm bằng chứng ngân hàng. Chỉ thực hiện sau khi đã đối soát ngân hàng đã báo có.'
  },
  retry: {
    title: 'Ghi có lại cho merchant',
    ok: 'Ghi có lại',
    mode: 'CONFIRM',
    body: 'Chạy lại bước ghi có cho đơn đã nhận tiền. Thao tác idempotent theo đơn nên gọi lại an toàn.'
  },
  refresh: {
    title: 'Làm mới mã QR',
    ok: 'Làm mới QR',
    mode: 'CONFIRM',
    body: 'Phát hành lại mã QR, không gia hạn thời gian thanh toán. Với VCB, mã QR hiện tại sẽ bị hủy tại ngân hàng.'
  },
  cancel: {
    title: 'Hủy đơn hàng',
    ok: 'Hủy đơn',
    mode: 'DELETE',
    body: 'Đơn chuyển sang Đã hủy. Với VPB, tiền khách chuyển sau đó sẽ không được ghi có và vào danh sách tiền về bất thường.'
  }
}

export function OrderActionDialog({ kind, order, onClose }: Props) {
  const [amount, setAmount] = useState<number | null>(null)
  const [amountError, setAmountError] = useState('')
  const action = useOrderAction({ kind, onDone: onClose })
  const text = TEXT[kind]

  if (action.qrResult)
    return (
      <OrderQrResultDialog
        order={action.qrResult}
        title='Mã QR mới'
        onClose={onClose}
      />
    )

  const submit = (): void => {
    if (kind === 'confirm') {
      if (!isWholeMoney(amount))
        return setAmountError('Nhập số tiền là số nguyên đồng, tối thiểu 1')
      if (amount !== order.amount)
        return setAmountError(
          `Số tiền phải bằng đúng số tiền của đơn (${formatOrderMoney(order.amount)})`
        )
    }
    setAmountError('')
    void action.run(order.id, amount ?? undefined)
  }

  return (
    <DialogModal
      open
      mode={text.mode}
      title={text.title}
      okText={text.ok}
      onOk={submit}
      onCancel={onClose}
      okButtonProps={{
        loading: action.isLoading,
        disabled: Boolean(action.creditWarning)
      }}
    >
      <div className='space-y-3 text-sm'>
        <p>
          Đơn <strong>{order.orderCode}</strong> ({order.merchantName}) ·{' '}
          {formatOrderMoney(order.amount)}
        </p>
        <p className='text-muted-foreground'>{text.body}</p>
        {kind === 'confirm' && (
          <div>
            <label
              htmlFor='merchant-order-confirm-amount'
              className='mb-1 block font-medium'
            >
              Số tiền đã nhận (₫) <span className='text-danger-strong'>*</span>
            </label>
            <InputNumber
              id='merchant-order-confirm-amount'
              min={1}
              precision={0}
              value={amount}
              status={amountError ? 'error' : undefined}
              onChange={(value) => {
                setAmount(typeof value === 'number' ? value : null)
                setAmountError('')
              }}
              placeholder='Nhập đúng số tiền của đơn'
            />
          </div>
        )}
        {amountError && (
          <p
            role='alert'
            className='text-danger-strong'
          >
            {amountError}
          </p>
        )}
        {action.error && (
          <p
            role='alert'
            className='text-danger-strong'
          >
            {action.error}
          </p>
        )}
        {action.creditWarning && (
          <OrderCreditWarning order={action.creditWarning} />
        )}
      </div>
    </DialogModal>
  )
}
