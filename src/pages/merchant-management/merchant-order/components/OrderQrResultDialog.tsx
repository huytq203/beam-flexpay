import { CopyableText, DialogModal } from '@components/index'
import type { MerchantOrder } from '../types/merchantOrder.types'
import {
  formatOrderDateTime,
  formatOrderMoney
} from '../utils/merchantOrder.utils'

interface Props {
  order: MerchantOrder
  title: string
  onClose: () => void
}

/**
 * Phương tiện thanh toán vừa phát hành. `qrCodeImage` (base64) chỉ có ở phản
 * hồi tạo/làm mới của VPB và không lấy lại được qua GET, nên phải hiện ngay.
 */
export function OrderQrResultDialog({ order, title, onClose }: Props) {
  const va = order.virtualAccount
  const qr = order.qrCode ?? va?.qrCode
  return (
    <DialogModal
      open
      title={title}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
    >
      <div className='space-y-3 text-sm'>
        <p>
          Đơn <strong>{order.orderCode}</strong> ·{' '}
          {formatOrderMoney(order.amount)} · hạn{' '}
          {formatOrderDateTime(order.expiredAt)}
        </p>
        {order.qrCodeImage && (
          <img
            alt={`Mã QR của đơn ${order.orderCode}`}
            className='mx-auto size-56 rounded-lg border border-border'
            src={`data:image/png;base64,${order.qrCodeImage}`}
          />
        )}
        {va?.virtualAccountNo && (
          <p>
            Tài khoản định danh: <strong>{va.virtualAccountNo}</strong>
            {va.virtualAccountName ? ` (${va.virtualAccountName})` : ''}
          </p>
        )}
        {order.paymentRef && <p>Mã tham chiếu: {order.paymentRef}</p>}
        {qr ? (
          <div>
            <p className='mb-1 text-muted-foreground'>Nội dung mã QR</p>
            <CopyableText value={qr} />
          </div>
        ) : (
          <p className='text-warning-strong'>
            Chưa có mã QR. Hãy mở lại đơn và dùng Làm mới QR trước khi hết hạn.
          </p>
        )}
      </div>
    </DialogModal>
  )
}
