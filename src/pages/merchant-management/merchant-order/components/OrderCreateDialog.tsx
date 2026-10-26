import { useState } from 'react'
import { usePostMerchantOrderMutation } from '@/app/services/apiOrderMerchant.api'
import { DialogModal, feedback } from '@components/index'
import type {
  MerchantOrder,
  OrderCreateForm
} from '../types/merchantOrder.types'
import { buildCreateBody, EMPTY_CREATE_FORM } from '../utils/orderCreate.utils'
import {
  describeOrderError,
  isOrderCreateFailed
} from '../utils/orderError.utils'
import { OrderCreateFields } from './OrderCreateFields'
import { OrderQrResultDialog } from './OrderQrResultDialog'

export function OrderCreateDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<OrderCreateForm>(EMPTY_CREATE_FORM)
  const [error, setError] = useState('')
  const [hint, setHint] = useState(false)
  const [created, setCreated] = useState<MerchantOrder | null>(null)
  const [createOrder, { isLoading }] = usePostMerchantOrderMutation()

  const submit = async (): Promise<void> => {
    const result = buildCreateBody(form)
    setHint(false)
    if (!result.body) return setError(result.error)
    setError('')
    try {
      setCreated(await createOrder(result.body).unwrap())
      feedback.success('Đã tạo đơn hàng')
    } catch (failure) {
      setError(describeOrderError(failure, 'Không thể tạo đơn hàng'))
      setHint(isOrderCreateFailed(failure))
    }
  }

  if (created)
    return (
      <OrderQrResultDialog
        order={created}
        title='Đơn hàng đã được tạo'
        onClose={onClose}
      />
    )

  return (
    <DialogModal
      open
      width={720}
      title='Tạo đơn hàng hộ merchant'
      okText='Tạo đơn'
      onOk={() => void submit()}
      onCancel={onClose}
      okButtonProps={{ loading: isLoading }}
    >
      <div className='space-y-3'>
        <OrderCreateFields
          form={form}
          onChange={setForm}
        />
        {error && (
          <p
            role='alert'
            className='text-sm text-danger-strong'
          >
            {error}
          </p>
        )}
        {hint && (
          <p
            role='status'
            className='rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground'
          >
            Đơn có thể đã được tạo ở trạng thái Chờ thanh toán. Đóng hộp thoại,
            tìm lại theo mã đơn rồi dùng Làm mới QR; đừng tạo lại bằng mã mới
            trừ khi ngân hàng đã từ chối.
          </p>
        )}
      </div>
    </DialogModal>
  )
}
