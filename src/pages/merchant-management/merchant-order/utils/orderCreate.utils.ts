import type { MerchantOrderCreateBody } from '@/app/services/apiOrderMerchant.api'
import type { OrderCreateForm } from '../types/merchantOrder.types'
import { isUuid, isWholeMoney, parseOrderTime } from './merchantOrder.utils'

export const EMPTY_CREATE_FORM: OrderCreateForm = {
  terminalId: '',
  orderCode: '',
  orderDescription: '',
  purpose: '',
  amount: null,
  bankCode: 'VPB',
  paymentMethod: 'QR',
  expiredAt: ''
}

/** `datetime-local` trả `YYYY-MM-DDTHH:mm`; BE cần thêm giây, giờ Việt Nam. */
const toBeDateTime = (value: string): string =>
  value.length === 16 ? `${value}:00` : value

export type CreateBodyResult =
  | { body: MerchantOrderCreateBody; error?: undefined }
  | { body?: undefined; error: string }

/**
 * Chỉ gửi các trường BE cho phép và bỏ trường trống. `netAmount`/`currency` do
 * BE tự đặt; VA chỉ có ở VPB nên tổ hợp khác bị chặn trước khi gọi.
 */
export const buildCreateBody = (
  form: OrderCreateForm,
  now: number = Date.now()
): CreateBodyResult => {
  const orderCode = form.orderCode.trim()
  const terminalId = form.terminalId.trim()
  if (!form.merchantId) return { error: 'Vui lòng chọn Merchant' }
  if (!orderCode) return { error: 'Vui lòng nhập mã đơn hàng' }
  if (!isWholeMoney(form.amount))
    return { error: 'Số tiền phải là số nguyên đồng, tối thiểu 1' }
  if (form.paymentMethod === 'VIRTUAL_ACCOUNT' && form.bankCode !== 'VPB')
    return { error: 'Tài khoản định danh chỉ hỗ trợ ngân hàng VPBank' }
  if (terminalId && !isUuid(terminalId))
    return { error: 'Mã terminal không đúng định dạng UUID' }
  if (terminalId && !form.subMerchantId)
    return { error: 'Terminal phải đi kèm Sub-merchant chứa nó' }
  if (form.expiredAt && parseOrderTime(toBeDateTime(form.expiredAt)) <= now)
    return { error: 'Hạn thanh toán phải ở tương lai' }

  const body: MerchantOrderCreateBody = {
    merchantId: form.merchantId,
    orderCode,
    amount: form.amount,
    bankCode: form.bankCode,
    paymentMethod: form.paymentMethod
  }
  if (form.orderDescription.trim())
    body.orderDescription = form.orderDescription.trim()
  if (form.purpose.trim()) body.purpose = form.purpose.trim()
  if (form.expiredAt) body.expiredAt = toBeDateTime(form.expiredAt)
  if (form.subMerchantId) body.subMerchantId = form.subMerchantId
  if (terminalId) body.terminalId = terminalId
  return { body }
}
